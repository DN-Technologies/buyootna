// How the properties list can be ordered (the API's `sort`) and shown
export const SORTS = [
  { id: 'DEFAULT', label: 'الافتراضي' },
  { id: 'NEWEST', label: 'الأحدث' },
  { id: 'OLDEST', label: 'الأقدم' },
  { id: 'PRICE_DESC', label: 'السعر: من الأعلى' },
  { id: 'PRICE_ASC', label: 'السعر: من الأقل' },
] as const
export type SortId = (typeof SORTS)[number]['id']

export type ViewId = 'cards' | 'list'
