import { renderHook } from '@testing-library/react-native';

import { ActivityItem } from '@/shared/hooks/useMyActivity';

import { useActivityFilters } from '../useActivityFilters';

const buildItem = (overrides: Partial<ActivityItem> = {}): ActivityItem => ({
  id: 'item-1',
  images: [],
  price: 100,
  type: 'APARTMENT',
  category: 'SALE',
  status: 'ACTIVE',
  updatedAt: '2024-01-01T00:00:00.000Z',
  createdAt: '2024-01-01T00:00:00.000Z',
  ...overrides,
});

describe('useActivityFilters', () => {
  const data: ActivityItem[] = [
    buildItem({ id: 'active-1', status: 'ACTIVE', price: 300, createdAt: '2024-01-03' }),
    buildItem({ id: 'draft-1', status: 'DRAFT', price: 100, createdAt: '2024-01-01' }),
    buildItem({ id: 'premium-1', status: 'ACTIVE', isPremium: true, price: 200, createdAt: '2024-01-02' }),
    buildItem({ id: 'expired-1', status: 'EXPIRED', price: 400, createdAt: '2024-01-04' }),
    buildItem({ id: 'closed-1', status: 'CLOSED', price: 50, createdAt: '2024-01-05' }),
  ];

  it('computes filter pill counts for each category', async () => {
    const { result } = await renderHook(() => useActivityFilters(data, 'ALL', 'NEWEST'));

    expect(result.current.filterPills).toEqual([
      { id: 'ARCHIVED', label: 'مؤرشفة (2)' },
      { id: 'DRAFT', label: 'مسودة (1)' },
      { id: 'PREMIUM', label: 'مميزة (1)' },
      { id: 'ACTIVE', label: 'نشطة (2)' },
      { id: 'ALL', label: 'الكل (5)' },
    ]);
  });

  it('filters to only ARCHIVED (EXPIRED + CLOSED) when that filter is active', async () => {
    const { result } = await renderHook(() =>
      useActivityFilters(data, 'ARCHIVED', 'NEWEST'),
    );

    expect(result.current.sortedAndFilteredData.map((i) => i.id).sort()).toEqual(
      ['closed-1', 'expired-1'].sort(),
    );
  });

  it('filters to only PREMIUM items when that filter is active', async () => {
    const { result } = await renderHook(() =>
      useActivityFilters(data, 'PREMIUM', 'NEWEST'),
    );

    expect(result.current.sortedAndFilteredData.map((i) => i.id)).toEqual([
      'premium-1',
    ]);
  });

  it('filters by exact status for ACTIVE/DRAFT', async () => {
    const { result } = await renderHook(() =>
      useActivityFilters(data, 'DRAFT', 'NEWEST'),
    );

    expect(result.current.sortedAndFilteredData.map((i) => i.id)).toEqual([
      'draft-1',
    ]);
  });

  it('sorts by newest createdAt first when sortBy is NEWEST', async () => {
    const { result } = await renderHook(() => useActivityFilters(data, 'ALL', 'NEWEST'));

    expect(result.current.sortedAndFilteredData.map((i) => i.id)).toEqual([
      'closed-1',
      'expired-1',
      'active-1',
      'premium-1',
      'draft-1',
    ]);
  });

  it('sorts by ascending price when sortBy is PRICE_ASC', async () => {
    const { result } = await renderHook(() =>
      useActivityFilters(data, 'ALL', 'PRICE_ASC'),
    );

    expect(result.current.sortedAndFilteredData.map((i) => i.price)).toEqual([
      50, 100, 200, 300, 400,
    ]);
  });

  it('sorts by descending price when sortBy is PRICE_DESC', async () => {
    const { result } = await renderHook(() =>
      useActivityFilters(data, 'ALL', 'PRICE_DESC'),
    );

    expect(result.current.sortedAndFilteredData.map((i) => i.price)).toEqual([
      400, 300, 200, 100, 50,
    ]);
  });
});
