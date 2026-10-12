// How the properties list can be ordered (the API's `sort`) and shown
export const SORTS = [
  { id: 'DEFAULT', label: 'الكل' },
  { id: 'NEWEST', label: 'الأحدث أولاً' },
  { id: 'OLDEST', label: 'الأقدم أولاً' },
  { id: 'PRICE_ASC', label: 'السعر (من الأقل للأعلى)' },
  { id: 'PRICE_DESC', label: 'السعر (من الأعلى للأقل)' },
] as const
export type SortId = (typeof SORTS)[number]['id']

export type ViewId = 'cards' | 'list' | 'map'
