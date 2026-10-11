import { useEffect } from 'react';

import { socketService } from '@/shared/services/socket.service';
import { useChatLiveStore } from '@/shared/store/useChatLiveStore';
import { useChatStore } from '@/shared/store/useChatStore';

/**
 * Listens for "متصل" and "يكتب الان..." while a chat screen (the list or a
 * conversation) is on screen, and feeds useChatLiveStore. A message
 * arriving also ends that person's "typing".
 */
export function useChatLiveSignals() {
  useEffect(() => {
    const live = useChatLiveStore.getState();

    const offTyping = socketService.onTyping((data) =>
      live.setTyping(data.conversationId, data.isTyping),
    );
    const offPresence = socketService.onPresenceChanged((data) =>
      live.setOnline(data.identityId, data.isOnline),
    );
    const offMessage = socketService.onNewMessage((message) => {
      if (message?.conversationId && !message.isMine) {
        live.setTyping(message.conversationId, false);
      }
    });
    const offUpdated = socketService.onConversationUpdated((data) => {
      if (data?.conversationId) live.setTyping(data.conversationId, false);
    });

    return () => {
      offTyping();
      offPresence();
      offMessage();
      offUpdated();
    };
  }, []);

  // What the last chats / messages response said about each person
  const conversations = useChatStore((state) => state.conversations);
  useEffect(() => {
    const { seedOnline, onlineByIdentity } = useChatLiveStore.getState();
    conversations.forEach((conversation) => {
      const { id, isOnline } = conversation.otherUser;
      // Socket news wins once it has arrived for that person
      if (id && onlineByIdentity[id] === undefined) seedOnline(id, isOnline);
    });
  }, [conversations]);
}

/** Whether a persona is online right now. */
export const useIsOnline = (identityId?: string) =>
  useChatLiveStore((state) =>
    identityId ? !!state.onlineByIdentity[identityId] : false,
  );

/** Whether the other person is typing in a conversation. */
export const useIsTyping = (conversationId?: string) =>
  useChatLiveStore((state) =>
    conversationId ? !!state.typingByConversation[conversationId] : false,
  );
