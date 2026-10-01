// The client sees invoices addressed to them; the company sees what it issued
export type InvoicesMode = 'client' | 'company';

// الكل keeps the API default (newest first)
export type InvoiceSortOption = 'all' | 'newest' | 'oldest';

export const SORT_OPTIONS: { key: InvoiceSortOption; label: string }[] = [
  { key: 'all', label: 'الكل' },
  { key: 'newest', label: 'الأحدث أولاً' },
  { key: 'oldest', label: 'الأقدم أولاً' },
];
