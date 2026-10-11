import { formatMessageTime } from '@/shared/utils/chatDate';

/**
 * Device-local time with western digits, from the message's createdAt (the
 * server's preformatted `timestamp` is only a fallback for odd dates).
 */
export const timeOf = (item: { createdAt?: string; timestamp?: string }) =>
  (item.createdAt && formatMessageTime(item.createdAt)) || item.timestamp || '';
