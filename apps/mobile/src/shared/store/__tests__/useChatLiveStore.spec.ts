import { act } from '@testing-library/react-native';

import { TYPING_TIMEOUT_MS, useChatLiveStore } from '../useChatLiveStore';

describe('useChatLiveStore', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    useChatLiveStore.getState().reset();
  });
  afterEach(() => jest.useRealTimers());

  it('clears a "typing" that is never followed by "stopped"', () => {
    const live = useChatLiveStore.getState();

    act(() => live.setTyping('c1', true));
    expect(useChatLiveStore.getState().typingByConversation.c1).toBe(true);

    act(() => jest.advanceTimersByTime(TYPING_TIMEOUT_MS + 10));
    expect(useChatLiveStore.getState().typingByConversation.c1).toBeUndefined();
  });

  it('keeps socket news over what an older response said', () => {
    const live = useChatLiveStore.getState();

    act(() => live.setOnline('p1', true));
    act(() => live.seedOnline('p2', false));
    act(() => live.seedOnline('p3', undefined));

    expect(useChatLiveStore.getState().onlineByIdentity).toEqual({
      p1: true,
      p2: false,
    });
  });
});
