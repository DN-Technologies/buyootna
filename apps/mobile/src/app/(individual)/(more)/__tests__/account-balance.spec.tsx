import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

import { plansService } from '@/shared/api/plans.service';

import AccountBalanceScreen from '../account-balance';

const mockPush = jest.fn();

jest.mock('expo-router', () => ({
  useRouter: () => ({ back: jest.fn(), push: mockPush, replace: jest.fn() }),
}));

jest.mock('expo-image', () => ({ Image: () => null }));

jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: (selector: (s: unknown) => unknown) =>
    selector({ user: { id: 'u1' } }),
}));

jest.mock('@/shared/api/plans.service', () => ({
  plansService: { getWallet: jest.fn() },
}));

const wallet = {
  freeAdsRemaining: 0,
  slots: [{ id: 's1' }],
  balanceCounts: { gold: 0, silver: 1, regular: 2 },
  history: [1, 2, 3, 4].map((n) => ({
    id: `h${n}`,
    displayId: `ID:${n}`,
    planName: `الباقة ${n}`,
    planSlug: 'basic',
    status: 'ACTIVE' as const,
    dateText: `تاريخ ${n}`,
    createdAt: '2026-10-01',
    adsRemaining: 1,
  })),
};

async function renderScreen() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  const utils = await render(
    <QueryClientProvider client={queryClient}>
      <AccountBalanceScreen />
    </QueryClientProvider>,
  );
  return { ...utils, queryClient };
}

describe('AccountBalanceScreen', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (plansService.getWallet as jest.Mock).mockResolvedValue(wallet);
  });

  it('renders balance counts and a 3-item history preview', async () => {
    const { findByText, getByText, queryByText } = await renderScreen();

    expect(await findByText('الباقة 1')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
    expect(getByText('عادي')).toBeTruthy();
    expect(getByText('ID:3')).toBeTruthy();
    expect(queryByText('الباقة 4')).toBeNull();
  });

  it('caches the full wallet payload so slots stay available to add-listing', async () => {
    const { findByText, queryClient } = await renderScreen();
    await findByText('الباقة 1');

    expect(queryClient.getQueryData(['wallet'])).toEqual(wallet);
  });

  it('opens the full history from عرض الكل', async () => {
    const { findByText } = await renderScreen();
    fireEvent.press(await findByText('عرض الكل'));

    await waitFor(() => expect(mockPush).toHaveBeenCalledWith('/package-history'));
  });
});
