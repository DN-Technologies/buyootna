import { act, renderHook, waitFor } from '@testing-library/react-native';

import { chatService } from '@/shared/api/chat.service';
import { useChatSearch } from '@/shared/hooks/chat/useChatSearch';

jest.mock('@/shared/api/chat.service', () => ({
  chatService: { searchMessages: jest.fn() },
}));
// No waiting on the debounce
jest.mock('@/shared/hooks/device/useDebounce', () => ({ useDebounce: (v: unknown) => v }));

describe('useChatSearch', () => {
  beforeEach(() => jest.clearAllMocks());

  it('walks the matches newest first, loading older pages for one not loaded', async () => {
    (chatService.searchMessages as jest.Mock).mockResolvedValue([
      { id: 'm9' },
      { id: 'm2' },
    ]);
    const loadOlder = jest.fn();
    const { result, rerender } = await renderHook(
      (props: { messages: { id: string }[] }) =>
        useChatSearch({
          conversationId: 'c1',
          messages: props.messages,
          hasOlderMessages: true,
          loadOlder,
        }),
      { initialProps: { messages: [{ id: 'm5' }, { id: 'm9' }] } },
    );

    await act(async () => {
      result.current.open();
      result.current.setQuery('متاح');
    });
    await waitFor(() => expect(result.current.total).toBe(2));
    expect(chatService.searchMessages).toHaveBeenCalledWith('c1', 'متاح');
    expect(result.current.position).toBe(1);
    expect(result.current.focusId).toBe('m9');

    // ↑ to an older match that isn't loaded yet
    await act(async () => result.current.older());
    expect(result.current.focusId).toBeNull();
    expect(loadOlder).toHaveBeenCalled();

    // Its page arrives: now it can be shown
    await rerender({ messages: [{ id: 'm2' }, { id: 'm5' }, { id: 'm9' }] });
    expect(result.current.focusId).toBe('m2');
    expect(result.current.position).toBe(2);
  });

  it('closing clears the search', async () => {
    const { result } = await renderHook(() =>
      useChatSearch({
        conversationId: 'c1',
        messages: [],
        hasOlderMessages: false,
        loadOlder: jest.fn(),
      }),
    );
    await act(async () => {
      result.current.open();
      result.current.setQuery('x');
    });
    await act(async () => result.current.close());
    expect(result.current.isOpen).toBe(false);
    expect(result.current.query).toBe('');
  });
});
