import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook } from '@testing-library/react-native';
import { router } from 'expo-router';
import type { ReactNode } from 'react';

import { chatService } from '@/shared/api/chat.service';
import { companyRequestsService } from '@/shared/api/companyRequests.service';
import { showAlert } from '@/shared/utils/alert';

import { useOpenRequestChat } from '../useOpenRequestChat';

jest.mock('@/shared/api/chat.service', () => ({
  chatService: { createConversation: jest.fn() },
}));
jest.mock('@/shared/api/companyRequests.service', () => ({
  companyRequestsService: { markResponded: jest.fn() },
}));
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));
jest.mock('@/features/company/utils/subscriptionRequired', () => ({
  handleSubscriptionRequired: jest.fn(() => false),
}));

const createConversation = chatService.createConversation as jest.Mock;
const markResponded = companyRequestsService.markResponded as jest.Mock;
const REQUEST = { id: 'req-1', clientIdentityId: 'client-1' };

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((r) => (resolve = r));
  return { promise, resolve };
}

function setup() {
  const client = new QueryClient();
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(() => useOpenRequestChat(), { wrapper });
}

describe('useOpenRequestChat', () => {
  beforeEach(() => jest.clearAllMocks());

  it('opens the chat without waiting for the request to be marked answered', async () => {
    createConversation.mockResolvedValue({ id: 'conv-1' });
    // Never settles: the chat must open anyway
    markResponded.mockReturnValue(new Promise(() => {}));
    const { result } = await setup();

    await act(() => result.current.openChat(REQUEST, { markResponded: true }));

    expect(createConversation).toHaveBeenCalledWith('client-1', undefined, 'req-1');
    expect(router.push).toHaveBeenCalledWith('/chat/conv-1');
    expect(markResponded).toHaveBeenCalledWith('req-1');
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

  it('ابدأ المحادثة does not mark the request answered', async () => {
    createConversation.mockResolvedValue({ id: 'conv-1' });
    const { result } = await setup();
    await act(() => result.current.openChat(REQUEST));
    expect(markResponded).not.toHaveBeenCalled();
  });

  it('a failed mark-as-answered is silent: the chat is already open', async () => {
    createConversation.mockResolvedValue({ id: 'conv-1' });
    markResponded.mockRejectedValue(new Error('network'));
    const { result } = await setup();
    await act(() => result.current.openChat(REQUEST, { markResponded: true }));
    expect(router.push).toHaveBeenCalledWith('/chat/conv-1');
    expect(showAlert).not.toHaveBeenCalled();
  });

  it('when the chat cannot be created: an alert, no navigation, the button frees up', async () => {
    createConversation.mockRejectedValue({
      response: { data: { message: 'لا يمكنك مراسلة هذا المستخدم' } },
    });
    const { result } = await setup();
    await act(() => result.current.openChat(REQUEST, { markResponded: true }));
    expect(router.push).not.toHaveBeenCalled();
    expect(markResponded).not.toHaveBeenCalled();
    expect(showAlert).toHaveBeenCalledWith('تنبيه', 'لا يمكنك مراسلة هذا المستخدم');
    expect(result.current.openingId).toBeNull();
  });
});
