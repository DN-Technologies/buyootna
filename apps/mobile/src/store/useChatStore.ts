import { create } from 'zustand';

import {
  ChatMessage,
  chatService,
  ConversationSummary,
} from '@/core/api/chat.service';
import { socketService } from '@/core/services/socket.service';

import { useAuthStore } from './useAuthStore';

interface ChatState {
  conversations: ConversationSummary[];
  activeMessages: ChatMessage[];
  activeConversationId: string | null;
  isLoadingConversations: boolean;
  isLoadingMessages: boolean;
  hasNextMessagesPage: boolean;
  nextMessagesCursor: string | undefined;

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
  ) => void;
  receiveMessage: (conversationId: string, message: ChatMessage) => void;
  markConversationAsRead: (conversationId: string) => Promise<void>;
  setActiveConversation: (conversationId: string | null) => void;
  clear: () => void;
}

export const useChatStore = create<ChatState>((set, get) => {
  return {
    conversations: [],
    activeMessages: [],
    activeConversationId: null,
    isLoadingConversations: false,
    isLoadingMessages: false,
    hasNextMessagesPage: false,
    nextMessagesCursor: undefined,

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
      set({ isLoadingMessages: true });
      try {
        const res = await chatService.getMessages(conversationId, cursor, 20);
        set((state) => ({
          activeMessages:
            cursor && !shouldRefresh
              ? [...res.data, ...state.activeMessages]
              : res.data,
          hasNextMessagesPage: res.meta.hasNextPage,
          nextMessagesCursor: res.meta.nextCursor,
          isLoadingMessages: false,
        }));
      } catch (error) {
        console.error('Failed to load messages:', error);
        set({ isLoadingMessages: false });
      }
    },

    sendMessage: (conversationId, payload) => {
      // 1. Emit via socket
      socketService.sendMessage(conversationId, payload);

      // 2. Add optimistic message to UI instantly
      const optimisticMsg: ChatMessage = {
        id: `temp-${Date.now()}`,
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
        activeMessages: [...state.activeMessages, optimisticMsg],
      }));
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

      // If this message belongs to the active conversation, add it to activeMessages
      if (get().activeConversationId === conversationId) {
        set((state) => {
          // Remove optimistic message if exists
          const filtered = state.activeMessages.filter(
            (msg) => msg.content !== messageWithIsMine.content || !msg.sending,
          );

          // Check if message is already added
          const exists = filtered.some((m) => m.id === messageWithIsMine.id);
          if (exists) return { activeMessages: filtered };

          return { activeMessages: [...filtered, messageWithIsMine] };
        });
      }

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
        activeMessages: [],
        activeConversationId: null,
        isLoadingConversations: false,
        isLoadingMessages: false,
        hasNextMessagesPage: false,
        nextMessagesCursor: undefined,
      });
    },
  };
});
