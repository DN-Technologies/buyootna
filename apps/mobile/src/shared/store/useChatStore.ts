import { create } from 'zustand';

import {
  ChatMessage,
  chatService,
  ConversationSummary,
} from '@/shared/api/chat.service';
import { socketService } from '@/shared/services/socket.service';

import { useAuthStore } from './useAuthStore';

interface ConversationPagination {
  hasNextPage: boolean;
  nextCursor: string | undefined;
}

interface ChatState {
  conversations: ConversationSummary[];
  // Chat message state is keyed by conversationId everywhere below — there
  // is deliberately no single "active conversation's messages" field. A
  // shared/singleton field for the "current" room's messages was the root
  // cause of a critical bug where a message sent in one company's chat
  // could render inside a different company's chat room: React Navigation
  // keeps blurred stack screens mounted (not unmounted) rather than
  // destroying them, so two ChatDetailScreen instances (e.g. a chat opened,
  // then a different chat reached via a property/profile screen pushed on
  // top of it) can legitimately be mounted at the same time, both reading
  // from this store — if they shared one "active" slice, whichever screen
  // last became active would silently overwrite what the other was
  // showing. Keying every field by conversationId makes that class of bug
  // structurally impossible: each screen only ever reads its own
  // conversation's slice, however many chat screens happen to be mounted.
  messagesByConversation: Record<string, ChatMessage[]>;
  paginationByConversation: Record<string, ConversationPagination>;
  loadingConversationIds: Record<string, boolean>;
  // Which conversation is currently focused on screen. Only used for
  // notification bookkeeping (skip incrementing unread count, mark as
  // read) — it never gates which messages a screen is allowed to render.
  activeConversationId: string | null;
  isLoadingConversations: boolean;

  // Actions
  loadConversations: (page?: number, shouldRefresh?: boolean) => Promise<void>;
  loadMessages: (
    conversationId: string,
    cursor?: string,
    shouldRefresh?: boolean,
  ) => Promise<void>;
  sendMessage: (
    conversationId: string,
    payload: {
      content?: string;
      type?: 'TEXT' | 'IMAGE' | 'PROPERTY';
      imageUrl?: string;
      propertyId?: string;
    },
  ) => boolean;
  /**
   * Rolls back the optimistic bubble for a send the server refused to
   * persist (tempId comes back on the socket's message_error event).
   */
  messageFailed: (conversationId: string, tempId?: string) => void;
  receiveMessage: (conversationId: string, message: ChatMessage) => void;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  setActiveConversation: (conversationId: string | null) => void;
  clear: () => void;
}

export const useChatStore = create<ChatState>((set, get) => {
  return {
    conversations: [],
    messagesByConversation: {},
    paginationByConversation: {},
    loadingConversationIds: {},
    activeConversationId: null,
    isLoadingConversations: false,

    loadConversations: async (page = 1, shouldRefresh = false) => {
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

    loadMessages: async (
      conversationId: string,
      cursor?: string,
      shouldRefresh = false,
    ) => {
      // Reset only this conversation's own slice — never touches any other
      // conversation's cached messages, so a refresh here can't affect (or
      // be affected by) whatever any other mounted chat screen shows.
      if (shouldRefresh) {
        set((state) => ({
          loadingConversationIds: {
            ...state.loadingConversationIds,
            [conversationId]: true,
          },
          messagesByConversation: {
            ...state.messagesByConversation,
            [conversationId]: [],
          },
        }));
      } else {
        set((state) => ({
          loadingConversationIds: {
            ...state.loadingConversationIds,
            [conversationId]: true,
          },
        }));
      }
      try {
        const res = await chatService.getMessages(conversationId, cursor, 20);

        set((state) => {
          let updatedConversations = state.conversations;

          if (res.meta.otherUser || res.meta.propertyContext) {
            const existingIndex = state.conversations.findIndex(
              (c) => c.id === conversationId,
            );

            if (existingIndex > -1) {
              updatedConversations = [...state.conversations];
              updatedConversations[existingIndex] = {
                ...updatedConversations[existingIndex],
                propertyContext:
                  res.meta.propertyContext !== undefined
                    ? res.meta.propertyContext
                    : updatedConversations[existingIndex].propertyContext,
                otherUser:
                  res.meta.otherUser ??
                  updatedConversations[existingIndex].otherUser,
              };
            } else if (res.meta.otherUser) {
              const newConv: ConversationSummary = {
                id: conversationId,
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString(),
                otherUser: res.meta.otherUser,
                propertyContext: res.meta.propertyContext || null,
                lastMessage: null,
                unreadCount: 0,
              };
              updatedConversations = [newConv, ...state.conversations];
            }
          }

          const existingCached = state.messagesByConversation[conversationId] || [];
          const mergedMessages =
            cursor && !shouldRefresh
              ? [...res.data, ...existingCached]
              : res.data;

          return {
            conversations: updatedConversations,
            messagesByConversation: {
              ...state.messagesByConversation,
              [conversationId]: mergedMessages,
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
          };
        });
      } catch (error) {
        console.error('Failed to load messages:', error);
        set((state) => ({
          loadingConversationIds: {
            ...state.loadingConversationIds,
            [conversationId]: false,
          },
        }));
      }
    },

    sendMessage: (conversationId, payload) => {
      // The tempId is generated up front and used as the optimistic
      // bubble's id, so a `message_error` echo can roll back exactly this
      // bubble.
      const tempId = `temp-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

      // 1. Emit via socket. No socket object at all means the emit would be
      // silently dropped -- report the failure instead of showing an
      // optimistic bubble that can never be confirmed.
      const emitted = socketService.sendMessage(conversationId, {
        ...payload,
        tempId,
      });
      if (!emitted) {
        return false;
      }

      // 2. Add optimistic message to UI instantly, scoped to this
      // conversation's own slice only.
      const optimisticMsg: ChatMessage = {
        id: tempId,
        type: payload.type || 'TEXT',
        content: payload.content,
        imageUrl: payload.imageUrl,
        propertyId: payload.propertyId,
        isMine: true,
        timestamp: new Date().toLocaleTimeString('ar-KW', {
          hour: '2-digit',
          minute: '2-digit',
          hour12: false,
        }),
        createdAt: new Date().toISOString(),
        sending: true,
      };

      set((state) => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: [
            ...(state.messagesByConversation[conversationId] || []),
            optimisticMsg,
          ],
        },
      }));

      return true;
    },

    messageFailed: (conversationId, tempId) => {
      set((state) => {
        const existing = state.messagesByConversation[conversationId] || [];
        // No correlation id (older client/server pair): fall back to
        // dropping the most recent still-sending bubble.
        let lastSendingId: string | undefined;
        for (const msg of existing) {
          if (msg.sending) lastSendingId = msg.id;
        }
        const filtered = existing.filter((msg) => {
          if (tempId) return msg.id !== tempId;
          return !msg.sending || msg.id !== lastSendingId;
        });
        return {
          messagesByConversation: {
            ...state.messagesByConversation,
            [conversationId]: filtered,
          },
        };
      });
    },

    receiveMessage: (conversationId, message) => {
      const currentUserId = useAuthStore.getState().user?.id;
      const isMine =
        message.isMine ??
        (message.senderId ? message.senderId === currentUserId : false);

      const messageWithIsMine = {
        ...message,
        isMine,
      };

      // Always scoped to this message's own conversation — whichever chat
      // screens are mounted, each independently re-derives from this same
      // map, so there's nothing further to gate here.
      set((state) => {
        const existingCached = state.messagesByConversation[conversationId] || [];

        // Remove optimistic message if exists
        const filtered = existingCached.filter(
          (msg) => msg.content !== messageWithIsMine.content || !msg.sending,
        );

        // Check if message is already added
        const exists = filtered.some((m) => m.id === messageWithIsMine.id);
        const updatedCached = exists ? filtered : [...filtered, messageWithIsMine];

        return {
          messagesByConversation: {
            ...state.messagesByConversation,
            [conversationId]: updatedCached,
          },
        };
      });

      // Update conversations list (move to top, set last message, increment unread count if not active)
      set((state) => {
        const conversations = state.conversations.map((conv) => {
          if (conv.id === conversationId) {
            return {
              ...conv,
              lastMessage: {
                id: messageWithIsMine.id,
                content: messageWithIsMine.content || null,
                type: messageWithIsMine.type,
                createdAt: messageWithIsMine.createdAt,
                isMine,
              },
              unreadCount:
                state.activeConversationId === conversationId || isMine
                  ? conv.unreadCount
                  : conv.unreadCount + 1,
            };
          }
          return conv;
        });

        // Re-order conversations to put the updated one on top
        const updatedIndex = conversations.findIndex(
          (c) => c.id === conversationId,
        );
        if (updatedIndex > -1) {
          const [updatedConv] = conversations.splice(updatedIndex, 1);
          conversations.unshift(updatedConv);
        }

        return { conversations };
      });
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

    clear: () => {
      set({
        conversations: [],
        messagesByConversation: {},
        paginationByConversation: {},
        loadingConversationIds: {},
        activeConversationId: null,
        isLoadingConversations: false,
      });
    },
  };
});
