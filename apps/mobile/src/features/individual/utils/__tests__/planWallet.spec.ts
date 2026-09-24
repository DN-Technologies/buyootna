import { groupWalletSlots } from '@/features/individual/utils/planWallet';
import type { WalletSlot } from '@/shared/api/plans.service';

const slot = (overrides: Partial<WalletSlot>): WalletSlot => ({
  id: 'slot',
  planId: 'plan-gold',
  planName: 'الذهبية',
  planSlug: 'gold',
  adsRemaining: 1,
  maxActiveAds: 1,
  createdAt: '2026-09-01T00:00:00.000Z',
  ...overrides,
});

describe('groupWalletSlots', () => {
  it('combines slots of the same tier into one row with remaining of total', () => {
    const rows = groupWalletSlots([
      slot({ id: 'g1', adsRemaining: 1, totalAds: 1 }),
      slot({ id: 'g5', adsRemaining: 3, totalAds: 5 }),
      slot({
        id: 'r2',
        planId: 'plan-regular',
        planName: 'الاساسية',
        planSlug: 'regular',
        adsRemaining: 2,
        totalAds: 2,
      }),
    ]);

    expect(rows).toEqual([
      expect.objectContaining({ planSlug: 'gold', adsRemaining: 4, totalAds: 6 }),
      expect.objectContaining({
        planSlug: 'regular',
        planName: 'الاساسية',
        adsRemaining: 2,
        totalAds: 2,
      }),
    ]);
  });

  it('falls back to maxActiveAds (never below remaining) when totalAds is missing', () => {
    expect(
      groupWalletSlots([slot({ adsRemaining: 3, maxActiveAds: 1 })])[0]
        .totalAds,
    ).toBe(3);
    expect(
      groupWalletSlots([slot({ adsRemaining: 1, maxActiveAds: 4 })])[0]
        .totalAds,
    ).toBe(4);
  });

  it('returns no rows for an empty wallet', () => {
    expect(groupWalletSlots([])).toEqual([]);
  });
});
