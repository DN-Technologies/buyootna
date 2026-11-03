import { fireEvent, render } from '@testing-library/react-native';

import type { ActivityItem } from '@/shared/hooks/properties/useMyActivity';

import OfficeAdCard from '../components/OfficeAdCard';
import OfficePropertyStats from '../components/OfficePropertyStats';
import OwnerGovernorateCard from '../components/OwnerGovernorateCard';

const ad = (over: Partial<ActivityItem> = {}): ActivityItem => ({
  id: 'a1',
  images: [],
  price: 150000,
  type: 'بيع',
  category: 'APARTMENT',
  status: 'ACTIVE',
  updatedAt: '2026-05-15T00:00:00.000Z',
  publishedAt: '2026-05-15T00:00:00.000Z',
  listingType: 'SALE',
  views: 50,
  favoritesCount: 80,
  chatsCount: 4,
  ...over,
});

describe('OfficePropertyStats', () => {
  it('shows the four tiles from the dashboard', async () => {
    const { getByTestId } = await render(
      <OfficePropertyStats
        dashboard={
          {
            stats: {
              activeListings: 9,
              activeListingsThisWeek: 3,
              activeServices: 0,
              newMessagesToday: 0,
              totalViews: 1400,
              closedListings: 3,
            },
            billing: {
              hasActivePackage: true,
              adsRemaining: 4,
              adsTotal: 20,
              freeAdsRemaining: 0,
            },
          } as never
        }
      />,
    );
    expect(getByTestId('office-stat-active-value').props.children).toBe('3 هذا الأسبوع');
    expect(getByTestId('office-stat-closed-value').props.children).toBe('3');
    expect(getByTestId('office-stat-balance-value').props.children).toBe('4 من اصل 20');
    expect(getByTestId('office-stat-views-value').props.children).toBe('1.4K');
  });

  it('works on an older API without the new fields', async () => {
    const { getByTestId } = await render(
      <OfficePropertyStats
        dashboard={
          {
            stats: { activeListings: 2, activeListingsThisWeek: 0, totalViews: 5 },
            billing: { adsRemaining: 1, freeAdsRemaining: 0 },
          } as never
        }
      />,
    );
    expect(getByTestId('office-stat-closed-value').props.children).toBe('0');
    expect(getByTestId('office-stat-active-value').props.children).toBe('2');
  });
});

describe('OwnerGovernorateCard', () => {
  it('shows five categories then «+N», the count and featured count', async () => {
    const onPress = jest.fn();
    const { getByText, getByTestId } = await render(
      <OwnerGovernorateCard
        summary={{
          governorateId: 'capital',
          title: 'محافظة العاصمة',
          count: 12,
          featuredCount: 3,
          categories: ['شقة', 'بيت', 'عمارة', 'أرض', 'مكتب', 'شاليه', 'مزرعة'],
        }}
        onPress={onPress}
      />,
    );
    expect(getByText('2+')).toBeTruthy();
    expect(getByText('12 عقارات')).toBeTruthy();
    expect(getByText('3 عقارات مميزة')).toBeTruthy();
    await fireEvent.press(getByTestId('owner-governorate-capital'));
    expect(onPress).toHaveBeenCalled();
  });
});

describe('OfficeAdCard', () => {
  it.each([
    [{}, 'نشط'],
    [{ isHidden: true }, 'اعلان مخفي'],
    [{ isPremium: true, featuredUntil: null }, 'مميز'],
  ])('badge for %o', async (over, label) => {
    const { getByText } = await render(<OfficeAdCard ad={ad(over)} onPress={jest.fn()} />);
    expect(getByText(label)).toBeTruthy();
  });

  it('shows the stats, opens the ad, or picks it while selecting', async () => {
    const onPress = jest.fn();
    const onToggle = jest.fn();
    const { getByTestId, getByText, rerender } = await render(
      <OfficeAdCard ad={ad()} onPress={onPress} />,
    );
    expect(getByText('50')).toBeTruthy();
    expect(getByText('80')).toBeTruthy();
    expect(getByText('4')).toBeTruthy();
    await fireEvent.press(getByTestId('office-ad-a1'));
    expect(onPress).toHaveBeenCalledTimes(1);

    await rerender(
      <OfficeAdCard ad={ad()} onPress={onPress} selecting selected onToggleSelect={onToggle} />,
    );
    expect(getByTestId('office-ad-check-a1-on')).toBeTruthy();
    await fireEvent.press(getByTestId('office-ad-a1'));
    expect(onToggle).toHaveBeenCalledTimes(1);
    expect(onPress).toHaveBeenCalledTimes(1);
  });
});
