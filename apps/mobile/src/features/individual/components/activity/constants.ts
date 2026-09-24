import type { ActivityTab } from '@/features/individual/components/activity/ActivityTabsRow';
import type { RadioOption } from '@/shared/components/profile/RadioSelectionSheet';

export type ActivityTabId = 'ads' | 'offers' | 'alerts';

export const TABS: ActivityTab<ActivityTabId>[] = [
  { id: 'ads', label: 'اعلاناتي' },
  { id: 'offers', label: 'عروضي' },
  { id: 'alerts', label: 'تنبيهاتي' },
];

// Where the header "+" goes on each tab
export const ADD_ROUTE_BY_TAB: Record<ActivityTabId, string> = {
  ads: '/add-listing',
  offers: '/request-quote',
  alerts: '/add-alert',
};

export type AdSortBy = 'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC';

export const AD_SORT_OPTIONS: RadioOption[] = [
  { label: 'الأحدث أولاً', value: 'NEWEST' },
  { label: 'السعر: من الأعلى إلى الأقل', value: 'PRICE_DESC' },
  { label: 'السعر: من الأقل إلى الأعلى', value: 'PRICE_ASC' },
];
