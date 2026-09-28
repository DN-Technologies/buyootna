import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { act, renderHook, waitFor } from '@testing-library/react-native';
import { ReactNode } from 'react';

import { settingsService } from '@/shared/api/settings.service';
import { showAlert } from '@/shared/utils/alert';

import { SETTINGS_QUERY_KEY, useUserSettings } from '../useUserSettings';

jest.mock('@/shared/api/settings.service', () => ({
  settingsService: { getSettings: jest.fn(), updateSettings: jest.fn() },
}));
jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: jest.fn((selector) => selector({ token: 'token' })),
}));
jest.mock('@/shared/utils/alert', () => ({ showAlert: jest.fn() }));

const saved = {
  id: 's1',
  userId: 'u1',
  showPhone: true,
  showWhatsapp: true,
  hideActivity: false,
  hideOfficeAds: false,
};

let queryClient: QueryClient;

async function setup() {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false, gcTime: Infinity } },
  });
  const wrapper = ({ children }: { children: ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
  const utils = await renderHook(() => useUserSettings(), { wrapper });
  await waitFor(() => expect(utils.result.current.isLoading).toBe(false));
  return utils;
}

describe('useUserSettings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (settingsService.getSettings as jest.Mock).mockResolvedValue(saved);
  });

  afterEach(() => queryClient?.clear());

  it('shows a toggle at once and saves it', async () => {
    (settingsService.updateSettings as jest.Mock).mockResolvedValue({});
    const { result } = await setup();

    await act(() => result.current.updateSettings({ hideActivity: true }));

    await waitFor(() => expect(result.current.hideActivity).toBe(true));
    expect(settingsService.updateSettings).toHaveBeenCalledWith({
      hideActivity: true,
    });
    expect(showAlert).not.toHaveBeenCalled();
  });

  it('puts the toggle back and explains when saving fails', async () => {
    (settingsService.updateSettings as jest.Mock).mockRejectedValue(
      new Error('offline'),
    );
    const { result } = await setup();

    await act(() => result.current.updateSettings({ hideActivity: true }));

    expect(result.current.hideActivity).toBe(false);
    expect(queryClient.getQueryData(SETTINGS_QUERY_KEY)).toEqual(saved);
    expect(showAlert).toHaveBeenCalledWith(
      'خطأ',
      'تعذر حفظ الإعداد، حاول مرة أخرى',
    );
  });
});
