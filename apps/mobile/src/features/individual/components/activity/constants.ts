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

// تصفية البحث on اعلاناتي: the deal type (Figma bottom sheet). The status
// chips (نشطة، مسودة...) stay on the screen and combine with it. Values are
// the labels GET /properties/me/activity sends in `type`.
export type AdDealFilter = 'ALL' | 'بيع' | 'إيجار' | 'بدل';

export const AD_DEAL_OPTIONS: RadioOption[] = [
  { label: 'الكل', value: 'ALL' },
  { label: 'البيع', value: 'بيع' },
  { label: 'الايجار', value: 'إيجار' },
  { label: 'البدل', value: 'بدل' },
];

export type AdSortBy = 'NEWEST' | 'PRICE_ASC' | 'PRICE_DESC';

export const AD_SORT_OPTIONS: RadioOption[] = [
  { label: 'الأحدث أولاً', value: 'NEWEST' },
  { label: 'السعر: من الأعلى إلى الأقل', value: 'PRICE_DESC' },
  { label: 'السعر: من الأقل إلى الأعلى', value: 'PRICE_ASC' },
];
