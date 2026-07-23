import apiClient from '@/core/api/api';

export interface ChatParticipant {
  id: string;
  name: string;
  avatarUrl: string;
}

export interface PropertyContext {
  id: string;
  type: string;
  category: string;
  imageUrl: string;
  price: number;
  area?: number;
  location?: string;
}

export interface ConversationSummary {
  id: string;
  createdAt: string;
  updatedAt: string;
  otherUser: ChatParticipant;
  propertyContext: PropertyContext | null;
  lastMessage: {
    id: string;
    content: string | null;
    type: 'TEXT' | 'IMAGE' | 'PROPERTY';
    createdAt: string;
    isMine: boolean;
  } | null;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  type: 'TEXT' | 'IMAGE' | 'PROPERTY';
  content?: string;
  imageUrl?: string;
  propertyId?: string;
  property?: {
    id: string;
    imageUrl: string;
    price?: number | null;
    title: string;
    type?: string;
    area?: number;
    bedrooms?: number;
    bathrooms?: number;
    specs?: string;
    location: string;
  };
  isMine: boolean;
  senderId?: string;
  timestamp: string;
  createdAt: string;
  sending?: boolean; // For optimistic UI states
}

export interface GetConversationsResponse {
  data: ConversationSummary[];
  meta: {
    total: number;
    page: number;
    limit: number;
    hasNextPage: boolean;
  };
}

export interface GetMessagesResponse {
  data: ChatMessage[];
  meta: {
    nextCursor?: string;
    hasNextPage: boolean;
    propertyContext?: PropertyContext | null;
    otherUser?: ChatParticipant | null;
  };
}

export const chatService = {
  // Start or fetch a conversation
  createConversation: async (
    recipientId: string,
    propertyId?: string,
  ): Promise<{ id: string }> => {
    const response = await apiClient.post<{ id: string }>('/chat/conversations', {
      recipientId,
      propertyId,
    });
    return response.data;
  },

  // Get user's inbox list
  getConversations: async (page = 1, limit = 10): Promise<GetConversationsResponse> => {
    const response = await apiClient.get<GetConversationsResponse>('/chat/conversations', {
      params: { page, limit },
    });
    return response.data;
  },

  // Get conversation history (cursor-based pagination)
  getMessages: async (
    conversationId: string,
    cursor?: string,
    limit = 20,
  ): Promise<GetMessagesResponse> => {
    const response = await apiClient.get<GetMessagesResponse>(
      `/chat/conversations/${conversationId}/messages`,
      {
        params: { cursor, limit },
      },
    );
    return response.data;
  },

  // Mark all messages as read
  markAsRead: async (conversationId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post<{ success: boolean }>(
      `/chat/conversations/${conversationId}/read`,
    );
    return response.data;
  },
};
