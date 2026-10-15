/**
 * The chat store's list logic, as plain functions of the current lists:
 * what a send shows at once, how a server page merges with what is on
 * screen, how the server's copy of a sent message takes its bubble's place,
 * and how the chats list follows a new message.
 */
import {
  ChatMessage,
  ConversationSummary,
  LocalAttachment,
  ReplyPreview,
} from '@/shared/api/chat.service';
import { messageTypeFor } from '@/shared/utils/chatAttachments';

import { SendMessagePayload } from './types';

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

/** The id of a bubble shown before the server has the message. */
export const newTempId = () =>
  `temp-${Date.now()}-${Math.floor(Math.random() * 1e6)}`;

/** A message the server doesn't have yet: still sending, or failed. */
export const isUnsent = (message: ChatMessage) => message.id.startsWith('temp-');

/** The bubble a text / ad / location / offer shows until the server's copy. */
export function optimisticMessage(
  tempId: string,
  payload: SendMessagePayload,
): ChatMessage {
  const { replyTo, property } = payload;
  return {
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
}

/** The bubble for photos / documents / a voice note while they upload. */
export function pendingAttachmentsMessage(
  tempId: string,
  files: LocalAttachment[],
  caption?: string,
  replyTo?: ChatMessage,
): ChatMessage {
  return {
    id: tempId,
    type: messageTypeFor(files),
    content: caption?.trim() || undefined,
    localAttachments: files,
    uploadProgress: 0,
    replyTo: replyTo ? quoteOf(replyTo) : null,
    isMine: true,
    timestamp: '',
    createdAt: new Date().toISOString(),
    sending: true,
  };
}

/**
 * A page from the server merged with what is on screen. An older page goes
 * in front; a fresh one replaces the list but keeps:
 * - what isn't on the server yet (sending or failed). QA (Android): picking
 *   a file leaves the app, coming back reloads the chat, and that reload
 *   landing after the send removed the new bubble until the server's copy
 *   arrived;
 * - each row's key (see replaceWithServerCopy).
 */
export function mergeLoadedMessages(
  existing: ChatMessage[],
  page: ChatMessage[],
  olderPage: boolean,
): ChatMessage[] {
  const keyOf = new Map(
    existing
      .filter((m) => m.clientKey)
      .map((m) => [m.id, m.clientKey as string]),
  );
  const fresh = page.map((m) =>
    keyOf.has(m.id) ? { ...m, clientKey: keyOf.get(m.id) } : m,
  );
  return olderPage
    ? [...fresh, ...existing]
    : [...fresh, ...existing.filter(isUnsent)];
}

/** The conversation's header data from a messages page, kept in the list. */
export function withConversationMeta(
  conversations: ConversationSummary[],
  conversationId: string,
  meta: {
    otherUser?: ConversationSummary['otherUser'] | null;
    propertyContext?: ConversationSummary['propertyContext'];
    requestContext?: ConversationSummary['requestContext'];
  },
): ConversationSummary[] {
  if (!meta.otherUser && !meta.propertyContext && !meta.requestContext) {
    return conversations;
  }
  const index = conversations.findIndex((c) => c.id === conversationId);
  if (index > -1) {
    const updated = [...conversations];
    const current = updated[index];
    updated[index] = {
      ...current,
      propertyContext:
        meta.propertyContext !== undefined
          ? meta.propertyContext
          : current.propertyContext,
      requestContext:
        meta.requestContext !== undefined
          ? meta.requestContext
          : current.requestContext,
      otherUser: meta.otherUser ?? current.otherUser,
    };
    return updated;
  }
  if (!meta.otherUser) return conversations;
  const now = new Date().toISOString();
  return [
    {
      id: conversationId,
      createdAt: now,
      updatedAt: now,
      otherUser: meta.otherUser,
      propertyContext: meta.propertyContext || null,
      requestContext: meta.requestContext || null,
      lastMessage: null,
      unreadCount: 0,
    },
    ...conversations,
  ];
}

/**
 * A message from the server added to the list. My own takes the place of
 * its sending bubble -- same text and the same number of attachments (a
 * photo sent without a caption has no text) -- in place and under the
 * bubble's key, so the row is updated, not removed and added again (which
 * made it flicker on Android).
 */
export function replaceWithServerCopy(
  existing: ChatMessage[],
  incoming: ChatMessage,
): ChatMessage[] {
  const sameAs = (msg: ChatMessage) =>
    msg.type === incoming.type &&
    (msg.content ?? '') === (incoming.content ?? '') &&
    (msg.localAttachments?.length ?? 0) === (incoming.attachments?.length ?? 0);
  const pendingIndex = existing.findIndex((msg) => !!msg.sending && sameAs(msg));

  if (existing.some((m) => m.id === incoming.id)) {
    // Already here (e.g. a reload got it first): drop the bubble only
    return pendingIndex > -1
      ? existing.filter((_, i) => i !== pendingIndex)
      : existing;
  }
  if (pendingIndex > -1) {
    const pending = existing[pendingIndex];
    const updated = [...existing];
    updated[pendingIndex] = {
      ...incoming,
      clientKey: pending.clientKey ?? pending.id,
    };
    return updated;
  }
  return [...existing, incoming];
}

/**
 * A send the server refused, taken off the list. Without a correlation id
 * (older client/server pair) the most recent still-sending bubble goes.
 */
export function withoutRefusedSend(
  existing: ChatMessage[],
  tempId?: string,
): ChatMessage[] {
  let lastSendingId: string | undefined;
  for (const msg of existing) {
    if (msg.sending) lastSendingId = msg.id;
  }
  return existing.filter((msg) => {
    if (tempId) return msg.id !== tempId;
    return !msg.sending || msg.id !== lastSendingId;
  });
}

/**
 * The chats list after a new message: its conversation shows it as the last
 * message, moves to the top, and counts it as unread unless it's mine or
 * that conversation is open.
 */
export function withLastMessage(
  conversations: ConversationSummary[],
  conversationId: string,
  message: ChatMessage,
  { isMine, isOpen }: { isMine: boolean; isOpen: boolean },
): ConversationSummary[] {
  const updated = conversations.map((conv) =>
    conv.id === conversationId
      ? {
          ...conv,
          lastMessage: {
            id: message.id,
            content: message.content || null,
            type: message.type,
            createdAt: message.createdAt,
            isMine,
            // For the preview: photos / file / pin / offer
            attachmentsCount: message.attachments?.length ?? 0,
            attachmentName: message.attachments?.[0]?.fileName ?? null,
            attachmentDurationMs: message.attachments?.[0]?.durationMs ?? null,
            locationLabel: message.location?.label ?? null,
            proposal: message.proposal ?? null,
          },
          unreadCount: isOpen || isMine ? conv.unreadCount : conv.unreadCount + 1,
        }
      : conv,
  );
  const index = updated.findIndex((c) => c.id === conversationId);
  if (index > -1) {
    const [conv] = updated.splice(index, 1);
    updated.unshift(conv);
  }
  return updated;
}
