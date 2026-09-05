import { useMemo } from 'react';

import { ActivityFilterType, FilterPill } from '@/features/individual/components/activity/ActivityFilterPills';
import { ActivityItem } from '@/features/individual/hooks/useMyActivity';

export type ActivitySortBy = 'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC';

/**
 * Derives the filter-pill counts and the filtered/sorted list shown on the
 * activity screen. Pure client-side filtering/sorting over the full
 * activity list already fetched by useMyActivity -- kept separate from the
 * screen so the derivation logic can be reasoned about (and tested)
 * independently of the FlashList/UI wiring.
 */
export function useActivityFilters(
  data: ActivityItem[],
  activeFilterId: ActivityFilterType,
  sortBy: ActivitySortBy,
) {
  const filterPills: FilterPill[] = useMemo(() => {
    const allCount = data.length;
    const activeCount = data.filter((item) => item.status === 'ACTIVE').length;
    const draftCount = data.filter((item) => item.status === 'DRAFT').length;
    const premiumCount = data.filter((item) => item.isPremium).length;
    const archivedCount = data.filter(
      (item) => item.status === 'EXPIRED' || item.status === 'CLOSED',
    ).length;

    return [
      { id: 'ARCHIVED', label: `مؤرشفة (${archivedCount})` },
      { id: 'DRAFT', label: `مسودة (${draftCount})` },
      { id: 'PREMIUM', label: `مميزة (${premiumCount})` },
      { id: 'ACTIVE', label: `نشطة (${activeCount})` },
      { id: 'ALL', label: `الكل (${allCount})` },
    ];
  }, [data]);

  const sortedAndFilteredData = useMemo(() => {
    const filteredData =
      activeFilterId === 'ALL'
        ? data
        : activeFilterId === 'PREMIUM'
          ? data.filter((item) => item.isPremium)
          : activeFilterId === 'ARCHIVED'
            ? data.filter(
                (item) => item.status === 'EXPIRED' || item.status === 'CLOSED',
              )
            : data.filter((item) => item.status === activeFilterId);

    return [...filteredData].sort((a, b) => {
      if (sortBy === 'PRICE_ASC') return (a.price ?? 0) - (b.price ?? 0);
      if (sortBy === 'PRICE_DESC') return (b.price ?? 0) - (a.price ?? 0);
      return (
        new Date(b.createdAt ?? 0).getTime() -
        new Date(a.createdAt ?? 0).getTime()
      );
    });
  }, [data, activeFilterId, sortBy]);

  return { filterPills, sortedAndFilteredData };
}
