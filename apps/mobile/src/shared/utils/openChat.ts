import type { Router } from 'expo-router';

/** Route id that tells the chat screen to create the conversation itself. */
export const NEW_CHAT_ID = 'new';

export interface OpenChatParams {
  recipientId: string;
  propertyId?: string;
  // The quote request the chat is about (shown pinned instead of an ad)
  requestId?: string;
}

/**
 * Opens the chat screen immediately; the screen creates (or finds) the
 * conversation while showing its loading state, so the tap never waits on
 * the network.
 */
export function openChatWith(
  router: Pick<Router, 'push'>,
  { recipientId, propertyId, requestId }: OpenChatParams,
) {
  router.push({
    pathname: '/chat/[id]',
    params: {
      id: NEW_CHAT_ID,
      recipientId,
      ...(propertyId ? { propertyId } : {}),
      ...(requestId ? { requestId } : {}),
    },
  });
}
