/**
 * مواعيد العمل of a company or office, like WhatsApp Business: the week,
 * Sunday (0) to Saturday (6), each day open or closed, an open day with one
 * to three time ranges in 24h "HH:mm". The API checks the same rules
 * (common/utils/working-hours.util.ts).
 */
export interface WorkingRange {
  from: string;
  to: string;
}

export interface WorkingDay {
  day: number;
  open: boolean;
  ranges: WorkingRange[];
}

/** One line of the profile's مواعيد العمل: days with the same hours. */
export interface WorkingHourItem {
  days: string;
  hours: string;
  isOpen: boolean;
}

export const DAY_NAMES = [
  'الأحد',
  'الاثنين',
  'الثلاثاء',
  'الأربعاء',
  'الخميس',
  'الجمعة',
  'السبت',
];

export const MAX_RANGES_PER_DAY = 3;
export const DEFAULT_RANGE: WorkingRange = { from: '09:00', to: '17:00' };

/** A starting week: Sunday to Thursday 9:00 ص - 5:00 م, the weekend closed. */
export const defaultWeek = (): WorkingDay[] =>
  DAY_NAMES.map((_, day) =>
    day <= 4
      ? { day, open: true, ranges: [{ ...DEFAULT_RANGE }] }
      : { day, open: false, ranges: [] },
  );

/**
 * The saved hours (an array from the API, or JSON text from a form) as a
 * full week; null when none are saved or they can't be read.
 */
export function readWeek(saved: unknown): WorkingDay[] | null {
  let value = saved;
  if (typeof value === 'string') {
    if (!value.trim()) return null;
    try {
      value = JSON.parse(value) as unknown;
    } catch {
      return null;
    }
  }
  if (!Array.isArray(value) || value.length === 0) return null;
  const byDay = new Map<number, WorkingDay>();
  for (const item of value as WorkingDay[]) {
    if (typeof item?.day === 'number') byDay.set(item.day, item);
  }
  return DAY_NAMES.map((_, day) => {
    const item = byDay.get(day);
    return item?.open && item.ranges?.length
      ? { day, open: true, ranges: item.ranges.map((r) => ({ ...r })) }
      : { day, open: false, ranges: [] };
  });
}

/** "13:30" → "1:30 م" */
export function formatTime(hhmm: string): string {
  const [h, m] = hhmm.split(':').map(Number);
  const suffix = h < 12 ? 'ص' : 'م';
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, '0')} ${suffix}`;
}

export const rangeLabel = (range: WorkingRange) =>
  `${formatTime(range.from)} - ${formatTime(range.to)}`;

/** What's wrong with the week, in Arabic, or null when it can be saved. */
export function weekProblem(week: WorkingDay[]): string | null {
  for (const day of week) {
    if (!day.open) continue;
    const name = DAY_NAMES[day.day];
    const ranges = [...day.ranges].sort((a, b) => a.from.localeCompare(b.from));
    if (ranges.length === 0) return `أضف ساعات العمل ليوم ${name}`;
    for (let i = 0; i < ranges.length; i++) {
      if (ranges[i].from >= ranges[i].to) {
        return `وقت البداية يجب أن يسبق النهاية (${name})`;
      }
      if (i > 0 && ranges[i].from < ranges[i - 1].to) {
        return `الفترات متداخلة (${name})`;
      }
    }
  }
  return null;
}

const dayKey = (day: WorkingDay) =>
  day.open
    ? [...day.ranges]
        .sort((a, b) => a.from.localeCompare(b.from))
        .map((r) => `${r.from}-${r.to}`)
        .join(',')
    : 'closed';

/**
 * The week as profile lines, neighbouring days with the same hours on one
 * line: "الأحد - الخميس: 9:00 ص - 5:00 م", "الجمعة - السبت: مغلق".
 */
export function summarizeWeek(week: WorkingDay[]): WorkingHourItem[] {
  const items: WorkingHourItem[] = [];
  let start = 0;
  for (let i = 1; i <= week.length; i++) {
    if (i < week.length && dayKey(week[i]) === dayKey(week[start])) continue;
    const first = week[start];
    const last = week[i - 1];
    items.push({
      days:
        first.day === last.day
          ? DAY_NAMES[first.day]
          : `${DAY_NAMES[first.day]} - ${DAY_NAMES[last.day]}`,
      hours: first.open
        ? [...first.ranges]
            .sort((a, b) => a.from.localeCompare(b.from))
            .map(rangeLabel)
            .join('، ')
        : 'مغلق',
      isOpen: first.open,
    });
    start = i;
  }
  return items;
}

/** "HH:mm" ↔ a Date today, for the time picker. */
export function timeToDate(hhmm: string): Date {
  const [h, m] = hhmm.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  return date;
}

export const dateToTime = (date: Date) =>
  `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
