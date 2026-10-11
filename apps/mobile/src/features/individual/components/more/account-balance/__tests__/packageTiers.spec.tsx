import { render } from '@testing-library/react-native';

import SubscriptionSlotsRow from '@/features/individual/components/activity/ads/SubscriptionSlotsRow';

import { BalanceSummaryCards } from '../BalanceSummaryCards';

jest.mock('@/shared/components/ui/SafeLinearGradient', () => {
  const { View } = require('react-native');
  return { SafeLinearGradient: View };
});

// QA: only two tiers are sold -- عادي and ذهبي. A فضي card made it look like
// a third package existed.
describe('package tiers shown to the user', () => {
  it('الرصيد: عادي and ذهبي only', async () => {
    const { getByText, queryByText } = await render(
      <BalanceSummaryCards counts={{ regular: 3, silver: 0, gold: 2 }} />,
    );
    expect(getByText('عادي')).toBeTruthy();
    expect(getByText('ذهبي')).toBeTruthy();
    expect(queryByText('فضي')).toBeNull();
  });

  it('الرصيد: credits left over from the retired silver tier count as ذهبي', async () => {
    const { getByText } = await render(
      <BalanceSummaryCards counts={{ regular: 1, silver: 4, gold: 2 }} />,
    );
    expect(getByText('6')).toBeTruthy();
    expect(getByText('1')).toBeTruthy();
  });

  it('نشاطي: عادي and ذهبي only, silver credits folded into ذهبي', async () => {
    const { getByText, queryByText } = await render(
      <SubscriptionSlotsRow
        subscription={{ normalRemaining: 7, silverRemaining: 4, goldRemaining: 1 }}
      />,
    );
    expect(getByText('عادي')).toBeTruthy();
    expect(getByText('ذهبي')).toBeTruthy();
    expect(queryByText('فضي')).toBeNull();
    expect(getByText('7')).toBeTruthy(); // عادي
    expect(getByText('5')).toBeTruthy(); // ذهبي = 1 + 4 silver
  });
});
