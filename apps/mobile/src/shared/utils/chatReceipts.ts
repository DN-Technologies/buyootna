import type { ChatReceipt } from '@/shared/api/chat.service';

export type MessageStatus = 'sending' | 'sent' | 'delivered' | 'read';

const time = (iso?: string | null) => (iso ? new Date(iso).getTime() : 0);

/**
 * The tick state of one of my messages, from how far the other person has
 * received / read the conversation. Null for their messages and for a send
 * that failed (it shows its retry row instead).
 */
export function messageStatus(
  message: {
    isMine: boolean;
    createdAt: string;
    sending?: boolean;
    failed?: boolean;
  },
  other?: ChatReceipt | null,
): MessageStatus | null {
  if (!message.isMine || message.failed) return null;
  if (message.sending) return 'sending';
  const sentAt = time(message.createdAt);
  if (sentAt && sentAt <= time(other?.lastReadAt)) return 'read';
  if (sentAt && sentAt <= time(other?.lastDeliveredAt)) return 'delivered';
  return 'sent';
}

/** Receipts only move forward: keep the later of each timestamp. */
export function mergeReceipts(
  current?: ChatReceipt | null,
  next?: ChatReceipt | null,
): ChatReceipt | null {
  if (!current) return next ?? null;
  if (!next) return current;
  const later = (a?: string | null, b?: string | null) =>
    time(a) >= time(b) ? (a ?? null) : (b ?? null);
  return {
    lastDeliveredAt: later(current.lastDeliveredAt, next.lastDeliveredAt),
    lastReadAt: later(current.lastReadAt, next.lastReadAt),
  };
}
