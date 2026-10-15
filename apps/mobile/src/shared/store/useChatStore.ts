import { create } from 'zustand';

import { ChatMessage, chatService } from '@/shared/api/chat.service';
import { socketService } from '@/shared/services/socket.service';
import { mergeReceipts } from '@/shared/utils/chatReceipts';

import {
  mergeLoadedMessages,
  newTempId,
  optimisticMessage,
  pendingAttachmentsMessage,
  replaceWithServerCopy,
  withConversationMeta,
  withLastMessage,
  withoutRefusedSend,
} from './chat/messageLists';
import { ChatState, EMPTY_CHAT_STATE } from './chat/types';
import { uploadAndSend } from './chat/uploadAndSend';
import { useAuthStore } from './useAuthStore';

export { quoteOf } from './chat/messageLists';

/**
 * Chats and their messages, keyed by conversation (see ChatState). The
 * list logic lives in ./chat/messageLists as plain functions; this store
 * wires it to the API, the socket and the state.
 */
export const useChatStore = create<ChatState>((set, get) => {
  // One conversation's message list, changed by `update`
  const setMessages = (
    conversationId: string,
    update: (messages: ChatMessage[]) => ChatMessage[],
  ) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: update(
          state.messagesByConversation[conversationId] || [],
        ),
      },
    }));

  // Updates one message in place
  const patchMessage = (
    conversationId: string,
    id: string,
    patch: Partial<ChatMessage>,
  ) =>
    setMessages(conversationId, (messages) =>
      messages.map((m) => (m.id === id ? { ...m, ...patch } : m)),
    );

  const setLoading = (conversationId: string, loading: boolean, failed: boolean) =>
    set((state) => ({
      loadingConversationIds: {
        ...state.loadingConversationIds,
        [conversationId]: loading,
      },
      loadErrorConversationIds: {
        ...state.loadErrorConversationIds,
        [conversationId]: failed,
      },
    }));

  return {
    ...EMPTY_CHAT_STATE,

    loadConversations: async (page = 1) => {
      set({ isLoadingConversations: true });
      try {
        const res = await chatService.getConversations(page, 20);
        set((state) => ({
          conversations:
            page === 1 ? res.data : [...state.conversations, ...res.data],
          isLoadingConversations: false,
        }));
      } catch (error) {
        console.error('Failed to load conversations:', error);
        set({ isLoadingConversations: false });
      }
    },

    loadMessages: async (conversationId, cursor, shouldRefresh = false) => {
      // A refresh keeps what's cached on screen until the new page arrives
      // (and replaces it then): clearing first left reopened chats blank,
      // and blank for good if the request failed (QA). Only this
      // conversation's own slice is touched.
      setLoading(conversationId, true, false);
      try {
        const res = await chatService.getMessages(conversationId, cursor, 20);
        // The other person's receipt (my ticks)
        if (res.meta.otherReceipt) {
          get().applyReceipt({ conversationId, ...res.meta.otherReceipt });
        }

        set((state) => ({
          conversations: withConversationMeta(
            state.conversations,
            conversationId,
            res.meta,
          ),
          messagesByConversation: {
            ...state.messagesByConversation,
            [conversationId]: mergeLoadedMessages(
              state.messagesByConversation[conversationId] || [],
              res.data,
              !!cursor && !shouldRefresh,
            ),
          },
          paginationByConversation: {
            ...state.paginationByConversation,
            [conversationId]: {
              hasNextPage: res.meta.hasNextPage,
              nextCursor: res.meta.nextCursor,
            },
          },
          loadingConversationIds: {
            ...state.loadingConversationIds,
            [conversationId]: false,
          },
        }));
      } catch (error) {
        console.error('Failed to load messages:', error);
        setLoading(conversationId, false, true);
      }
    },

    sendMessage: (conversationId, payload) => {
      // The tempId is generated up front and used as the optimistic
      // bubble's id, so a `message_error` echo can roll back exactly this
      // bubble.
      const tempId = newTempId();

      // 1. Emit via socket. No socket object at all means the emit would be
      // silently dropped -- report the failure instead of showing an
      // optimistic bubble that can never be confirmed.
      const { replyTo, property: _card, ...fields } = payload;
      const emitted = socketService.sendMessage(conversationId, {
        ...fields,
        replyToId: replyTo?.id,
        tempId,
      });
      if (!emitted) return false;

      // 2. The bubble, at once, in this conversation's own slice only
      const bubble = optimisticMessage(tempId, payload);
      setMessages(conversationId, (messages) => [...messages, bubble]);
      return true;
    },

    applyReceipt: ({ conversationId, identityId, ...receipt }) => {
      // My own reads come back on the room too: they're not my ticks
      if (
        identityId &&
        identityId === useAuthStore.getState().activeIdentity?.id
      ) {
        return;
      }
      set((state) => {
        const merged = mergeReceipts(
          state.receiptByConversation[conversationId] ??
            state.conversations.find((c) => c.id === conversationId)
              ?.otherReceipt,
          receipt,
        );
        if (!merged) return {};
        return {
          receiptByConversation: {
            ...state.receiptByConversation,
            [conversationId]: merged,
          },
          conversations: state.conversations.map((c) =>
            c.id === conversationId ? { ...c, otherReceipt: merged } : c,
          ),
        };
      });
    },

    updateMessage: (conversationId, messageId, patch) =>
      patchMessage(conversationId, messageId, patch),

    hideMessage: async (conversationId, messageId) => {
      const before = get().messagesByConversation[conversationId] || [];
      setMessages(conversationId, () => before.filter((m) => m.id !== messageId));
      try {
        await chatService.hideMessage(messageId);
      } catch (error) {
        // Put it back where it was
        setMessages(conversationId, () => before);
        throw error;
      }
    },

    sendAttachments: async (conversationId, { files, caption, replyTo }) => {
      const pending = pendingAttachmentsMessage(
        newTempId(),
        files,
        caption,
        replyTo,
      );
      setMessages(conversationId, (messages) => [...messages, pending]);
      await uploadAndSend(patchMessage, conversationId, pending, replyTo?.id);
    },

    retryAttachments: async (conversationId, tempId) => {
      const pending = (get().messagesByConversation[conversationId] || []).find(
        (m) => m.id === tempId,
      );
      if (!pending?.localAttachments) return;
      await uploadAndSend(
        patchMessage,
        conversationId,
        pending,
        pending.replyTo?.id,
      );
    },

    messageFailed: (conversationId, tempId) =>
      setMessages(conversationId, (messages) =>
        withoutRefusedSend(messages, tempId),
      ),

    receiveMessage: (conversationId, message) => {
      const { user, activeIdentity } = useAuthStore.getState();
      const isMine =
        message.isMine ??
        (message.senderId ? message.senderId === user?.id : false);

      // A live reply is broadcast to both sides: "you" is whoever sent the
      // quoted message as this persona
      const replyTo =
        message.replyTo && !message.replyTo.deleted
          ? {
              ...message.replyTo,
              isMine:
                message.replyTo.isMine ??
                message.replyTo.senderIdentityId === activeIdentity?.id,
            }
          : message.replyTo;
      const incoming = { ...message, replyTo, isMine };

      // Always scoped to this message's own conversation — whichever chat
      // screens are mounted, each independently re-derives from this same
      // map, so there's nothing further to gate here.
      setMessages(conversationId, (messages) =>
        replaceWithServerCopy(messages, incoming),
      );
      set((state) => ({
        conversations: withLastMessage(
          state.conversations,
          conversationId,
          incoming,
          { isMine, isOpen: state.activeConversationId === conversationId },
        ),
      }));
    },

    markConversationAsRead: async (conversationId) => {
      try {
        await chatService.markAsRead(conversationId);
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv,
          ),
        }));
      } catch (error) {
        console.error('Failed to mark conversation as read:', error);
      }
    },

    setActiveConversation: (conversationId) => {
      set({ activeConversationId: conversationId });
      if (conversationId) {
        get().markConversationAsRead(conversationId);
      }
    },

    clear: () => set({ ...EMPTY_CHAT_STATE }),
  };
});
