import apiClient from '@/shared/api/api';

export interface ChatParticipant {
  id: string;
  name: string;
  avatarUrl: string;
  // Whether their app is open right now ("متصل"), as of this response;
  // live changes arrive on the socket (see useChatLiveStore)
  isOnline?: boolean;
  lastSeenAt?: string | null;
  // False once their account is deleted, suspended or blocked: the chat
  // can be read but not written to. Absent from older servers (= available)
  isAvailable?: boolean;
}

// The quote request a chat is about (pinned above the messages)
export interface RequestContext {
  id: string;
  title: string;
  location: string;
  priceRange: string | null;
  status: string;
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
  // How far the other person has received / read (tick on my last message)
  otherReceipt?: ChatReceipt | null;
  id: string;
  createdAt: string;
  updatedAt: string;
  otherUser: ChatParticipant;
  propertyContext: PropertyContext | null;
  requestContext?: RequestContext | null;
  lastMessage: {
    id: string;
    content: string | null;
    type: ChatMessageType;
    createdAt: string;
    isMine: boolean;
    locationLabel?: string | null;
    proposal?: ChatProposal | null;
    // For the preview: "📷 3 صور" / "📎 file name"
    attachmentsCount?: number;
    attachmentName?: string | null;
    attachmentDurationMs?: number | null;
  } | null;
  unreadCount: number;
}

export type ChatMessageType =
  | 'TEXT'
  | 'IMAGE'
  | 'PROPERTY'
  | 'FILE'
  | 'LOCATION'
  | 'APPOINTMENT'
  | 'OFFER'
  | 'VIDEO'
  | 'VOICE';

export type ProposalStatus =
  | 'PENDING'
  | 'ACCEPTED'
  | 'DECLINED'
  | 'COUNTERED'
  | 'CANCELLED';
export type OfferPeriod = 'TOTAL' | 'MONTHLY' | 'YEARLY';

/** A viewing appointment (موعد معاينة) or a price offer (عرض سعر). */
export interface ChatProposal {
  id: string;
  kind: 'APPOINTMENT' | 'OFFER';
  status: ProposalStatus;
  scheduledAt?: string | null;
  amount?: number | null;
  currency?: string;
  period?: OfferPeriod | null;
  note?: string | null;
  counterOfId?: string | null;
  respondedAt?: string | null;
}

/** What the user fills in to propose (sent with the message). */
export interface ProposalInput {
  scheduledAt?: string;
  amount?: number;
  period?: OfferPeriod;
  note?: string;
  // Answering this proposal (counter-offer / another time)
  counterOfId?: string;
}

/**
 * How far a persona has received / read a conversation: a message of mine
 * is delivered when sent at or before `lastDeliveredAt`, read when at or
 * before `lastReadAt`.
 */
export interface ChatReceipt {
  lastDeliveredAt?: string | null;
  lastReadAt?: string | null;
}

/** A map pin (LOCATION message). */
export interface ChatLocation {
  latitude: number;
  longitude: number;
  label?: string | null;
}

/** A private chat photo / document; `url` is a short-lived signed link. */
export type AttachmentKind = 'IMAGE' | 'FILE' | 'VIDEO' | 'AUDIO';

export interface ChatAttachment {
  id: string;
  kind: AttachmentKind;
  fileName: string;
  mimeType: string;
  size: number;
  width?: number | null;
  height?: number | null;
  // Video / voice note length
  durationMs?: number | null;
  url: string;
  // Video: a still shown before playing (signed, like `url`)
  thumbnailUrl?: string | null;
}

/** A picked file before it's uploaded (from the camera, gallery or files). */
export interface LocalAttachment {
  uri: string;
  name: string;
  mimeType: string;
  size?: number;
  kind: AttachmentKind;
  durationMs?: number;
  // Video: a still made on the phone, uploaded with it
  thumbnailUri?: string;
}

/** The message a reply quotes (deleted: gone, or hidden on this side). */
export interface ReplyPreview {
  id: string;
  deleted?: boolean;
  type?: ChatMessageType;
  content?: string | null;
  imageUrl?: string | null;
  senderIdentityId?: string | null;
  isMine?: boolean;
}

export interface ChatMessage {
  id: string;
  // The id of the sending bubble this message replaced: the list keeps it as
  // the row's key, so the row isn't torn down and rebuilt at that moment
  clientKey?: string;
  type: ChatMessageType;
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
    // The shared ad is no longer on the market
    unavailable?: boolean;
  };
  // LOCATION: the pin
  location?: ChatLocation;
  // APPOINTMENT / OFFER
  proposal?: ChatProposal;
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
    // How far the other person has received / read (my ticks)
    otherReceipt?: ChatReceipt | null;
    propertyContext?: PropertyContext | null;
    requestContext?: RequestContext | null;
    otherUser?: ChatParticipant | null;
  };
}

export const chatService = {
  // Start or fetch a conversation
  createConversation: async (
    recipientId: string,
    propertyId?: string,
    // The quote request the chat is about; it takes the place of an ad
    requestId?: string,
  ): Promise<{ id: string }> => {
    const response = await apiClient.post<{ id: string }>('/chat/conversations', {
      recipientId,
      propertyId,
      requestId,
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
    // A still per video (in the videos' order) and each file's length
    files
      .filter((f) => f.kind === 'VIDEO' && f.thumbnailUri)
      .forEach((f, i) =>
        form.append('thumbnails', {
          uri: f.thumbnailUri,
          name: `thumbnail-${i}.jpg`,
          type: 'image/jpeg',
        } as unknown as Blob),
      );
    if (files.some((f) => f.durationMs)) {
      form.append(
        'durations',
        JSON.stringify(files.map((f) => f.durationMs ?? null)),
      );
    }
    const response = await apiClient.post<{ data: ChatAttachment[] }>(
      `/chat/conversations/${conversationId}/attachments`,
      form,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        // Big documents / videos on slow networks
        timeout: files.some((f) => f.kind === 'VIDEO') ? 600000 : 120000,
        onUploadProgress: (e) => {
          if (e.total) onProgress?.(e.loaded / e.total);
        },
      },
    );
    return response.data.data;
  },

  /** قبول / رفض (the other side) or إلغاء (the sender) of a proposal. */
  respondToProposal: async (
    proposalId: string,
    action: 'accept' | 'decline' | 'cancel',
  ): Promise<{ messageId: string; proposal: ChatProposal }> => {
    const response = await apiClient.post<{
      messageId: string;
      proposal: ChatProposal;
    }>(`/chat/proposals/${proposalId}/respond`, { action });
    return response.data;
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
