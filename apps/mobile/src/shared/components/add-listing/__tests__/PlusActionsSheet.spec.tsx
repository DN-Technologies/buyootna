import type { BottomSheetModal } from '@gorhom/bottom-sheet';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';
import { createRef } from 'react';

import { plansService } from '@/shared/api/plans.service';

import PlusActionsSheet from '../PlusActionsSheet';

const mockPush = jest.fn();
jest.mock('expo-router', () => ({
  useRouter: () => ({ push: mockPush }),
}));

jest.mock('@/shared/api/plans.service', () => ({
  plansService: { getPublishOptions: jest.fn() },
}));

jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: (selector: (state: { token: string }) => unknown) =>
    selector({ token: 'token' }),
}));

const getPublishOptions = plansService.getPublishOptions as jest.Mock;

const renderSheet = async (known?: { canPublish: boolean }) => {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  if (known) client.setQueryData(['publishOptions'], { options: [], ...known });
  const onQuotaExhausted = jest.fn();
  const utils = await render(
    <QueryClientProvider client={client}>
      <PlusActionsSheet
        ref={createRef<BottomSheetModal>()}
        onQuotaExhausted={onQuotaExhausted}
      />
    </QueryClientProvider>,
  );
  return { ...utils, onQuotaExhausted };
};

describe('PlusActionsSheet › اضافة اعلان', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // A slow network: the form must not wait on it
    getPublishOptions.mockReturnValue(new Promise(() => {}));
  });

  it('opens the form at once when the user is known to have credit', async () => {
    const { getByText } = await renderSheet({ canPublish: true });

    fireEvent.press(getByText('اضافة اعلان'));

    expect(mockPush).toHaveBeenCalledWith('/add-listing');
  });

  it('opens the form at once while the answer is still loading', async () => {
    const { getByText } = await renderSheet();

    fireEvent.press(getByText('اضافة اعلان'));

    expect(mockPush).toHaveBeenCalledWith('/add-listing');
  });

  it('shows the quota sheet when a fresh check confirms no credit', async () => {
    getPublishOptions.mockResolvedValue({ canPublish: false, options: [] });
    const { getByText, onQuotaExhausted } = await renderSheet({
      canPublish: false,
    });

    fireEvent.press(getByText('اضافة اعلان'));

    await waitFor(() => expect(onQuotaExhausted).toHaveBeenCalled());
    expect(mockPush).not.toHaveBeenCalled();
  });

  it('opens the form when the fresh check finds new credit', async () => {
    getPublishOptions.mockResolvedValue({ canPublish: true, options: [] });
    const { getByText, onQuotaExhausted } = await renderSheet({
      canPublish: false,
    });

    fireEvent.press(getByText('اضافة اعلان'));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/add-listing'));
    expect(onQuotaExhausted).not.toHaveBeenCalled();
  });
});
