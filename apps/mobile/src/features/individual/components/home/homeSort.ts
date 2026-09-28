import type { RadioOption } from '@/shared/components/profile/RadioSelectionSheet';

// Matches the API's `sort` query param on GET /properties
export type HomeSort = 'DEFAULT' | 'NEWEST' | 'OLDEST';

export const HOME_SORT_OPTIONS: RadioOption[] = [
  { label: 'الكل', value: 'DEFAULT' },
  { label: 'الأحدث أولاً', value: 'NEWEST' },
  { label: 'الأقدم أولاً', value: 'OLDEST' },
];
