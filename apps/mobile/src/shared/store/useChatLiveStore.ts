import { create } from 'zustand';

// A "typing" that is never followed by "stopped" (the app was killed, the
// network dropped) clears itself after this long
export const TYPING_TIMEOUT_MS = 6000;

interface ChatLiveState {
  // Who is online, by persona id: live socket news on top of what the last
  // chats / messages response said
  onlineByIdentity: Record<string, boolean>;
  // Conversations where the other person is typing right now
  typingByConversation: Record<string, boolean>;
  setOnline: (identityId: string, isOnline: boolean) => void;
  /** What a REST response said, without overriding fresher socket news. */
  seedOnline: (identityId: string, isOnline: boolean | undefined) => void;
  setTyping: (conversationId: string, isTyping: boolean) => void;
  reset: () => void;
}

const typingTimers: Record<string, ReturnType<typeof setTimeout>> = {};

/**
 * Chat signals that are never stored: "متصل" and "يكتب الان...". Kept apart
 * from useChatStore so a keystroke on the other phone doesn't re-render
 * every message list.
 */
export const useChatLiveStore = create<ChatLiveState>((set, get) => ({
  onlineByIdentity: {},
  typingByConversation: {},

  setOnline: (identityId, isOnline) =>
    set((state) => ({
      onlineByIdentity: { ...state.onlineByIdentity, [identityId]: isOnline },
    })),

  seedOnline: (identityId, isOnline) => {
    if (isOnline === undefined) return;
    if (get().onlineByIdentity[identityId] === isOnline) return;
    get().setOnline(identityId, isOnline);
  },

  setTyping: (conversationId, isTyping) => {
    clearTimeout(typingTimers[conversationId]);
    delete typingTimers[conversationId];
    if (isTyping) {
      typingTimers[conversationId] = setTimeout(
        () => get().setTyping(conversationId, false),
        TYPING_TIMEOUT_MS,
      );
    }
    if (!!get().typingByConversation[conversationId] === isTyping) return;
    set((state) => {
      const next = { ...state.typingByConversation };
      if (isTyping) next[conversationId] = true;
      else delete next[conversationId];
      return { typingByConversation: next };
    });
  },

  reset: () => {
    Object.keys(typingTimers).forEach((id) => {
      clearTimeout(typingTimers[id]);
      delete typingTimers[id];
    });
    set({ onlineByIdentity: {}, typingByConversation: {} });
  },
}));
