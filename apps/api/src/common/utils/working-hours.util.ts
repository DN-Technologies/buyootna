import { BadRequestException } from '@nestjs/common';

/**
 * مواعيد العمل of a company or office, like WhatsApp Business: the week,
 * Sunday (0) to Saturday (6), each day open or closed, an open day with one
 * to three time ranges ("HH:mm", 24h, from before to).
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

export const MAX_RANGES_PER_DAY = 3;
const TIME = /^([01]\d|2[0-3]):[0-5]\d$/;

const invalid = (detail: string) =>
  new BadRequestException(`مواعيد العمل غير صالحة: ${detail}`);

/**
 * The working hours sent on an identity update: an array, or the same as
 * JSON text (multipart bodies carry every field as text). null clears them.
 * Returns them in day order, a closed day with no ranges.
 */
export function parseWorkingHours(input: unknown): WorkingDay[] | null {
  if (input === null || input === '') return null;
  let value: unknown = input;
  if (typeof value === 'string') {
    try {
      value = JSON.parse(value) as unknown;
    } catch {
      throw invalid('صيغة غير صحيحة');
    }
  }
  if (!Array.isArray(value) || value.length > 7) {
    throw invalid('يجب أن تكون قائمة بأيام الأسبوع');
  }

  const seen = new Set<number>();
  const days = value.map((raw: unknown): WorkingDay => {
    const item = (raw ?? {}) as Partial<WorkingDay>;
    const day = item.day;
    if (
      typeof day !== 'number' ||
      !Number.isInteger(day) ||
      day < 0 ||
      day > 6
    ) {
      throw invalid('يوم غير معروف');
    }
    if (seen.has(day)) throw invalid('يوم مكرر');
    seen.add(day);
    if (typeof item.open !== 'boolean') throw invalid('حالة اليوم مطلوبة');
    if (!item.open) return { day, open: false, ranges: [] };

    const ranges = item.ranges;
    if (
      !Array.isArray(ranges) ||
      ranges.length === 0 ||
      ranges.length > MAX_RANGES_PER_DAY
    ) {
      throw invalid(`من فترة إلى ${MAX_RANGES_PER_DAY} فترات لكل يوم مفتوح`);
    }
    const clean = ranges.map((r: Partial<WorkingRange>) => {
      if (
        typeof r?.from !== 'string' ||
        typeof r?.to !== 'string' ||
        !TIME.test(r.from) ||
        !TIME.test(r.to)
      ) {
        throw invalid('وقت غير صحيح');
      }
      if (r.from >= r.to) throw invalid('وقت البداية يجب أن يسبق النهاية');
      return { from: r.from, to: r.to };
    });
    clean.sort((a, b) => a.from.localeCompare(b.from));
    for (let i = 1; i < clean.length; i++) {
      if (clean[i].from < clean[i - 1].to) throw invalid('فترات متداخلة');
    }
    return { day, open: true, ranges: clean };
  });

  return days.sort((a, b) => a.day - b.day);
}
