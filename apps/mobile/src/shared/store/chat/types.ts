import {
  ChatMessage,
  ChatMessageType,
  ChatReceipt,
  ConversationSummary,
  LocalAttachment,
  ProposalInput,
} from '@/shared/api/chat.service';

export interface ConversationPagination {
  hasNextPage: boolean;
  nextCursor: string | undefined;
}

/** What a text / ad / location / offer / appointment message is sent with. */
export interface SendMessagePayload {
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
}

export interface ChatState {
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
  sendMessage: (conversationId: string, payload: SendMessagePayload) => boolean;
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

/** The store's starting (and cleared) data. */
export const EMPTY_CHAT_STATE = {
  conversations: [],
  messagesByConversation: {},
  receiptByConversation: {},
  paginationByConversation: {},
  loadingConversationIds: {},
  loadErrorConversationIds: {},
  activeConversationId: null,
  isLoadingConversations: false,
} satisfies Partial<ChatState>;
