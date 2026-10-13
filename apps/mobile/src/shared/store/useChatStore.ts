import { create } from 'zustand';

import {
  ChatMessage,
  ChatMessageType,
  ChatReceipt,
  chatService,
  ConversationSummary,
  LocalAttachment,
  ProposalInput,
  ReplyPreview,
} from '@/shared/api/chat.service';
import { socketService } from '@/shared/services/socket.service';
import { showAlert } from '@/shared/utils/alert';
import { messageTypeFor, uploadRefusal } from '@/shared/utils/chatAttachments';
import { mergeReceipts } from '@/shared/utils/chatReceipts';

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
  // How far the other person has received / read each conversation
  receiptByConversation: Record<string, ChatReceipt>;
  /** A receipt from the server (ignored when it's my own persona's). */
  applyReceipt: (receipt: {
    conversationId: string;
    identityId?: string;
    lastDeliveredAt?: string | null;
    lastReadAt?: string | null;
  }) => void;
  paginationByConversation: Record<string, ConversationPagination>;
  loadingConversationIds: Record<string, boolean>;
  // Last load of a conversation's messages failed (shown with a retry)
  loadErrorConversationIds: Record<string, boolean>;
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
      type?: ChatMessageType;
      imageUrl?: string;
      propertyId?: string;
      // The shared ad's card until the server's copy arrives
      property?: ChatMessage['property'];
      // LOCATION
      latitude?: number;
      longitude?: number;
      locationLabel?: string;
      // APPOINTMENT / OFFER
      proposal?: ProposalInput;
      // Replying to this message (shown quoted on the new bubble)
      replyTo?: ChatMessage;
    },
  ) => boolean;
  /** Patches one message (an answered offer / appointment). */
  updateMessage: (
    conversationId: string,
    messageId: string,
    patch: Partial<ChatMessage>,
  ) => void;
  /** "حذف لدي": removes it here at once; restored if the server refuses. */
  hideMessage: (conversationId: string, messageId: string) => Promise<void>;
  /**
   * Photos / documents: shown at once from the device, uploaded (with
   * progress), then sent. A failed upload stays as a bubble to retry.
   */
  sendAttachments: (
    conversationId: string,
    payload: {
      files: LocalAttachment[];
      caption?: string;
      replyTo?: ChatMessage;
    },
  ) => Promise<void>;
  /** Tries a failed attachment message again. */
  retryAttachments: (conversationId: string, tempId: string) => Promise<void>;
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

/** How a message appears quoted under a reply. */
export function quoteOf(message: ChatMessage): ReplyPreview {
  return {
    id: message.id,
    type: message.type,
    content: message.content ?? null,
    imageUrl: message.imageUrl ?? null,
    isMine: message.isMine,
  };
}

export const useChatStore = create<ChatState>((set, get) => {
  // Updates one pending message in place
  const patchMessage = (
    conversationId: string,
    id: string,
    patch: Partial<ChatMessage>,
  ) =>
    set((state) => ({
      messagesByConversation: {
        ...state.messagesByConversation,
        [conversationId]: (state.messagesByConversation[conversationId] || []).map(
          (m) => (m.id === id ? { ...m, ...patch } : m),
        ),
      },
    }));

  // Upload the pending message's files, then send it over the socket. The
  // server's new_message replaces the pending bubble (see receiveMessage)
  const uploadAndSend = async (
    conversationId: string,
    pending: ChatMessage,
    replyToId?: string,
  ) => {
    patchMessage(conversationId, pending.id, {
      sending: true,
      failed: false,
      uploadProgress: 0,
    });
    try {
      const uploaded = await chatService.uploadAttachments(
        conversationId,
        pending.localAttachments ?? [],
        (fraction) =>
          patchMessage(conversationId, pending.id, { uploadProgress: fraction }),
      );
      const sent = socketService.sendMessage(conversationId, {
        content: pending.content,
        type: pending.type,
        attachmentIds: uploaded.map((a) => a.id),
        replyToId,
        tempId: pending.id,
      });
      if (!sent) throw new Error('no socket');
      patchMessage(conversationId, pending.id, { uploadProgress: 1 });
    } catch (error) {
      console.error('Failed to send attachments:', error);
      patchMessage(conversationId, pending.id, { sending: false, failed: true });
      // Refused by the server (too large, wrong type): say why, since
      // retrying the same file can't succeed
      const refusal = uploadRefusal(error);
      // (after the preview sheet has finished closing)
      if (refusal) setTimeout(() => showAlert('تعذر إرسال المرفق', refusal), 500);
    }
  };

  return {
    conversations: [],
    messagesByConversation: {},
    receiptByConversation: {},
    paginationByConversation: {},
    loadingConversationIds: {},
    loadErrorConversationIds: {},
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
      // A refresh keeps what's cached on screen until the new page arrives
      // (and replaces it then): clearing first left reopened chats blank,
      // and blank for good if the request failed (QA). Only this
      // conversation's own slice is touched.
      set((state) => ({
        loadingConversationIds: {
          ...state.loadingConversationIds,
          [conversationId]: true,
        },
        loadErrorConversationIds: {
          ...state.loadErrorConversationIds,
          [conversationId]: false,
        },
      }));
      try {
        const res = await chatService.getMessages(conversationId, cursor, 20);
        // The other person's receipt (my ticks)
        if (res.meta.otherReceipt) {
          get().applyReceipt({ conversationId, ...res.meta.otherReceipt });
        }

        set((state) => {
          let updatedConversations = state.conversations;

          if (
            res.meta.otherUser ||
            res.meta.propertyContext ||
            res.meta.requestContext
          ) {
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
                requestContext:
                  res.meta.requestContext !== undefined
                    ? res.meta.requestContext
                    : updatedConversations[existingIndex].requestContext,
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
                requestContext: res.meta.requestContext || null,
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
          loadErrorConversationIds: {
            ...state.loadErrorConversationIds,
            [conversationId]: true,
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
      const { replyTo, property, ...fields } = payload;
      const emitted = socketService.sendMessage(conversationId, {
        ...fields,
        replyToId: replyTo?.id,
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
        property,
        location:
          payload.latitude != null && payload.longitude != null
            ? {
                latitude: payload.latitude,
                longitude: payload.longitude,
                label: payload.locationLabel,
              }
            : undefined,
        // Shown as pending until the server's copy replaces it
        proposal: payload.proposal
          ? {
              id: tempId,
              kind: payload.type === 'APPOINTMENT' ? 'APPOINTMENT' : 'OFFER',
              status: 'PENDING',
              scheduledAt: payload.proposal.scheduledAt,
              amount: payload.proposal.amount,
              period: payload.proposal.period,
              note: payload.proposal.note,
            }
          : undefined,
        replyTo: replyTo ? quoteOf(replyTo) : null,
        isMine: true,
        // Shown via formatMessageTime(createdAt); kept for the type
        timestamp: '',
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
      set((state) => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: before.filter((m) => m.id !== messageId),
        },
      }));
      try {
        await chatService.hideMessage(messageId);
      } catch (error) {
        // Put it back where it was
        set((state) => ({
          messagesByConversation: {
            ...state.messagesByConversation,
            [conversationId]: before,
          },
        }));
        throw error;
      }
    },

    sendAttachments: async (conversationId, { files, caption, replyTo }) => {
      const tempId = `temp-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;
      const type = messageTypeFor(files);
      const pending: ChatMessage = {
        id: tempId,
        type,
        content: caption?.trim() || undefined,
        localAttachments: files,
        uploadProgress: 0,
        replyTo: replyTo ? quoteOf(replyTo) : null,
        isMine: true,
        timestamp: '',
        createdAt: new Date().toISOString(),
        sending: true,
      };
      set((state) => ({
        messagesByConversation: {
          ...state.messagesByConversation,
          [conversationId]: [
            ...(state.messagesByConversation[conversationId] || []),
            pending,
          ],
        },
      }));
      await uploadAndSend(conversationId, pending, replyTo?.id);
    },

    retryAttachments: async (conversationId, tempId) => {
      const pending = (get().messagesByConversation[conversationId] || []).find(
        (m) => m.id === tempId,
      );
      if (!pending?.localAttachments) return;
      await uploadAndSend(conversationId, pending, pending.replyTo?.id);
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
      const { user, activeIdentity } = useAuthStore.getState();
      const currentUserId = user?.id;
      const isMine =
        message.isMine ??
        (message.senderId ? message.senderId === currentUserId : false);

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

      const messageWithIsMine = {
        ...message,
        replyTo,
        isMine,
      };

      // Always scoped to this message's own conversation — whichever chat
      // screens are mounted, each independently re-derives from this same
      // map, so there's nothing further to gate here.
      set((state) => {
        const existingCached = state.messagesByConversation[conversationId] || [];

        // Remove the matching pending bubble: same text and the same number
        // of attachments (a photo sent without a caption has no text)
        const sameAs = (msg: ChatMessage) =>
          msg.type === messageWithIsMine.type &&
          (msg.content ?? '') === (messageWithIsMine.content ?? '') &&
          (msg.localAttachments?.length ?? 0) ===
            (messageWithIsMine.attachments?.length ?? 0);
        const filtered = existingCached.filter(
          (msg) => !msg.sending || !sameAs(msg),
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
                // For the preview: photos / file / pin / offer
                attachmentsCount: messageWithIsMine.attachments?.length ?? 0,
                attachmentName:
                  messageWithIsMine.attachments?.[0]?.fileName ?? null,
                attachmentDurationMs:
                  messageWithIsMine.attachments?.[0]?.durationMs ?? null,
                locationLabel: messageWithIsMine.location?.label ?? null,
                proposal: messageWithIsMine.proposal ?? null,
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
        receiptByConversation: {},
        paginationByConversation: {},
        loadingConversationIds: {},
        loadErrorConversationIds: {},
        activeConversationId: null,
        isLoadingConversations: false,
      });
    },
  };
});
