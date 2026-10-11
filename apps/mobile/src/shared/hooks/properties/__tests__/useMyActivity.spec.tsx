import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { renderHook, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';

import apiClient from '@/shared/api/api';
import { plansService } from '@/shared/api/plans.service';

import { subscriptionFromWallet, useMyActivity } from '../useMyActivity';

jest.mock('@/shared/api/api', () => ({
  __esModule: true,
  default: { get: jest.fn() },
}));

jest.mock('@/shared/api/plans.service', () => ({
  plansService: { getWallet: jest.fn() },
}));

jest.mock('@/shared/store/useAuthStore', () => ({
  useAuthStore: () => ({ token: 't' }),
}));

const mockGet = apiClient.get as jest.Mock;
const mockGetWallet = plansService.getWallet as jest.Mock;

function wrapper({ children }: { children: ReactNode }) {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
}

describe('subscriptionFromWallet', () => {
  it('maps wallet balanceCounts to per-tier remaining ads', () => {
    expect(
      subscriptionFromWallet({
        freeAdsRemaining: 0,
        slots: [],
        balanceCounts: { gold: 0, silver: 1, regular: 2 },
      }),
    ).toEqual({ goldRemaining: 0, silverRemaining: 1, normalRemaining: 2 });
  });

  it('is undefined with no remaining package ads or no wallet', () => {
    expect(
      subscriptionFromWallet({
        freeAdsRemaining: 1,
        slots: [],
        balanceCounts: { gold: 0, silver: 0, regular: 0 },
      }),
    ).toBeUndefined();
    expect(subscriptionFromWallet(null)).toBeUndefined();
  });
});

describe('useMyActivity', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGet.mockImplementation((url: string) =>
      Promise.resolve(
        url === '/users/me'
          ? // The API's placeholder subscription must be ignored
            {
              data: {
                user: {
                  freeAdsRemaining: 0,
                  hasSubscription: false,
                  subscription: null,
                },
              },
            }
          : { data: [] },
      ),
    );
  });

  it('surfaces purchased package ads from the real wallet', async () => {
    mockGetWallet.mockResolvedValue({
      freeAdsRemaining: 0,
      slots: [],
      balanceCounts: { gold: 0, silver: 1, regular: 2 },
    });

    const { result } = await renderHook(() => useMyActivity(), { wrapper });

    await waitFor(() => expect(result.current.hasSubscription).toBe(true));
    expect(result.current.subscription).toEqual({
      goldRemaining: 0,
      silverRemaining: 1,
      normalRemaining: 2,
    });
  });

  it('still loads the ad list when the wallet request fails', async () => {
    mockGetWallet.mockRejectedValue(new Error('boom'));

    const { result } = await renderHook(() => useMyActivity(), { wrapper });

    await waitFor(() => expect(result.current.isLoading).toBe(false));
    expect(result.current.error).toBeNull();
    expect(result.current.hasSubscription).toBe(false);
  });
});
