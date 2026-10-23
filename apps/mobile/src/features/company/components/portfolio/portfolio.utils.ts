import type { MyCompanyProject } from '@/shared/api/company.service';

// «الترتيب حسب»: الكل keeps the server's order (newest first)
export type PortfolioSort = 'ALL' | 'NEWEST' | 'OLDEST';

export const PORTFOLIO_SORT_OPTIONS: { value: PortfolioSort; label: string }[] = [
  { value: 'ALL', label: 'الكل' },
  { value: 'NEWEST', label: 'الأحدث أولاً' },
  { value: 'OLDEST', label: 'الأقدم أولاً' },
];

/** The projects matching the search (title or description), in the sort picked. */
export function visibleProjects(
  projects: MyCompanyProject[],
  search: string,
  sort: PortfolioSort,
): MyCompanyProject[] {
  const q = search.trim().toLowerCase();
  const matching = q
    ? projects.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.description.toLowerCase().includes(q),
      )
    : projects;
  if (sort === 'ALL') return matching;
  const time = (p: MyCompanyProject) => new Date(p.createdAt).getTime();
  return [...matching].sort((a, b) =>
    sort === 'NEWEST' ? time(b) - time(a) : time(a) - time(b),
  );
}

const ARABIC_MONTHS = [
  'يناير',
  'فبراير',
  'مارس',
  'أبريل',
  'مايو',
  'يونيو',
  'يوليو',
  'أغسطس',
  'سبتمبر',
  'أكتوبر',
  'نوفمبر',
  'ديسمبر',
];

/** «19 مايو 2025», for تاريخ الانشاء. */
export function formatCreatedDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getDate()} ${ARABIC_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}
