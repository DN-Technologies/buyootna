import type { RadioOption } from '@/shared/components/profile/RadioSelectionSheet';

// Matches the API's `sort` query param on GET /properties
export type HomeSort =
  | 'DEFAULT'
  | 'NEWEST'
  | 'OLDEST'
  | 'PRICE_DESC'
  | 'PRICE_ASC';

// In the design's order
export const HOME_SORT_OPTIONS: RadioOption[] = [
  { label: 'الكل', value: 'DEFAULT' },
  { label: 'الأقدم أولاً', value: 'OLDEST' },
  { label: 'الأحدث أولاً', value: 'NEWEST' },
  { label: 'السعر (من الأعلى للأقل)', value: 'PRICE_DESC' },
  { label: 'السعر (من الأقل للأعلى)', value: 'PRICE_ASC' },
];
