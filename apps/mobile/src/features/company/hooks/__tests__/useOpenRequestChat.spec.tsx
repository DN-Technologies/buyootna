import { act, renderHook } from '@testing-library/react-native';
import { router } from 'expo-router';

import { chatService } from '@/shared/api/chat.service';
import { showAlert } from '@/shared/utils/alert';

import { useOpenRequestChat } from '../useOpenRequestChat';

jest.mock('@/shared/api/chat.service', () => ({
  chatService: { createConversation: jest.fn() },
}));
jest.mock('@/shared/api/companyRequests.service', () => ({
  companyRequestsService: {},
}));
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));
jest.mock('@/features/company/utils/subscriptionRequired', () => ({
  handleSubscriptionRequired: jest.fn(() => false),
}));

const createConversation = chatService.createConversation as jest.Mock;
const REQUEST = { id: 'req-1', clientIdentityId: 'client-1' };

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

function setup() {
  return renderHook(() => useOpenRequestChat());
}

describe('useOpenRequestChat', () => {
  beforeEach(() => jest.clearAllMocks());

  it('opens the chat pinned to the request after one call', async () => {
    createConversation.mockResolvedValue({ id: 'conv-1' });
    const { result } = await setup();

    await act(() => result.current.openChat(REQUEST));

    expect(createConversation).toHaveBeenCalledTimes(1);
    expect(createConversation).toHaveBeenCalledWith('client-1', undefined, 'req-1');
    expect(router.push).toHaveBeenCalledWith('/chat/conv-1');
  });

  it('shows which request is opening, and ignores taps meanwhile', async () => {
    const pending = deferred<{ id: string }>();
    createConversation.mockReturnValue(pending.promise);
    const { result } = await setup();

    let first!: Promise<void>;
    await act(async () => {
      first = result.current.openChat(REQUEST);
    });
    expect(result.current.openingId).toBe('req-1');

    await act(() => result.current.openChat(REQUEST));
    expect(createConversation).toHaveBeenCalledTimes(1);

    await act(async () => {
      pending.resolve({ id: 'conv-1' });
      await first;
    });
    expect(result.current.openingId).toBeNull();
    expect(router.push).toHaveBeenCalledTimes(1);
  });

  it('when the chat cannot be created: an alert, no navigation, the button frees up', async () => {
    createConversation.mockRejectedValue({
      response: { data: { message: 'لا يمكنك مراسلة هذا المستخدم' } },
    });
    const { result } = await setup();
    await act(() => result.current.openChat(REQUEST));
    expect(router.push).not.toHaveBeenCalled();
    expect(showAlert).toHaveBeenCalledWith('تنبيه', 'لا يمكنك مراسلة هذا المستخدم');
    expect(result.current.openingId).toBeNull();
  });
});
