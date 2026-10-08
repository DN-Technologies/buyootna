import apiClient from '@/shared/api/api';

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
    type: 'TEXT' | 'IMAGE' | 'PROPERTY' | 'FILE';
    createdAt: string;
    isMine: boolean;
    // For the preview: "📷 3 صور" / "📎 file name"
    attachmentsCount?: number;
    attachmentName?: string | null;
  } | null;
  unreadCount: number;
}

/** A private chat photo / document; `url` is a short-lived signed link. */
export interface ChatAttachment {
  id: string;
  kind: 'IMAGE' | 'FILE';
  fileName: string;
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  url: string;
}

/** A picked file before it's uploaded (from the camera, gallery or files). */
export interface LocalAttachment {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
  kind: 'IMAGE' | 'FILE';
}

/** The message a reply quotes (deleted: gone, or hidden on this side). */
export interface ReplyPreview {
  id: string;
  deleted?: boolean;
  type?: 'TEXT' | 'IMAGE' | 'PROPERTY' | 'FILE';
  content?: string | null;
  imageUrl?: string | null;
  senderIdentityId?: string | null;
  isMine?: boolean;
}

export interface ChatMessage {
  id: string;
  type: 'TEXT' | 'IMAGE' | 'PROPERTY' | 'FILE';
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
  // Set when this message replies to another one
  replyTo?: ReplyPreview | null;
  // Photos / documents (private, signed links)
  attachments?: ChatAttachment[];
  // While sending: the picked files shown before upload finishes
  localAttachments?: LocalAttachment[];
  uploadProgress?: number;
  failed?: boolean;
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
  getConversations: async (
    page = 1,
    limit = 10,
    // Server-side search: name, the ad title, message text
    q?: string,
  ): Promise<GetConversationsResponse> => {
    const response = await apiClient.get<GetConversationsResponse>('/chat/conversations', {
      params: { page, limit, ...(q?.trim() ? { q: q.trim() } : {}) },
    });
    return response.data;
  },

  /** Uploads picked files (up to 10) to send in this chat; returns their ids. */
  uploadAttachments: async (
    conversationId: string,
    files: LocalAttachment[],
    onProgress?: (fraction: number) => void,
  ): Promise<ChatAttachment[]> => {
    const form = new FormData();
    files.forEach((f) =>
      form.append('files', {
        uri: f.uri,
        name: f.name,
        type: f.mimeType,
      } as unknown as Blob),
    );
    const response = await apiClient.post<{ data: ChatAttachment[] }>(
      `/chat/conversations/${conversationId}/attachments`,
      form,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        // Big documents on slow networks
        timeout: 120000,
        onUploadProgress: (e) => {
          if (e.total) onProgress?.(e.loaded / e.total);
        },
      },
    );
    return response.data.data;
  },

  /** A fresh link once a file's signed link has expired. */
  attachmentUrl: async (attachmentId: string): Promise<string> => {
    const response = await apiClient.get<{ url: string }>(
      `/chat/attachments/${attachmentId}/url`,
    );
    return response.data.url;
  },

  /** Ids of the messages in this chat matching `q`, newest first. */
  searchMessages: async (
    conversationId: string,
    q: string,
  ): Promise<{ id: string; createdAt: string }[]> => {
    const response = await apiClient.get<{
      data: { id: string; createdAt: string }[];
    }>(`/chat/conversations/${conversationId}/messages/search`, {
      params: { q },
    });
    return response.data.data;
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

  /** "حذف لدي": hide a message on this persona's side only. */
  hideMessage: async (messageId: string): Promise<void> => {
    await apiClient.post(`/chat/messages/${messageId}/hide`);
  },

  // Mark all messages as read
  markAsRead: async (conversationId: string): Promise<{ success: boolean }> => {
    const response = await apiClient.post<{ success: boolean }>(
      `/chat/conversations/${conversationId}/read`,
    );
    return response.data;
  },
};
