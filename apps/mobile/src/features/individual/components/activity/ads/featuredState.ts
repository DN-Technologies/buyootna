import { formatArabicDate } from '@/shared/utils/helpers/property';

/**
 * «مميز حتى 20 نوفمبر» while an ad is featured, else null: its «تمييز»
 * button is then replaced by this (QA: it stayed on a featured ad). A
 * featuring past its end reads as not featured, even before the server's
 * hourly clean-up switches it off.
 */
export function activeFeatureLabel(
  ad: { isPremium?: boolean; featuredUntil?: string | null },
  now = new Date(),
): string | null {
  if (!ad.isPremium) return null;
  if (!ad.featuredUntil) return 'مميز';
  const until = new Date(ad.featuredUntil);
  if (Number.isNaN(until.getTime()) || until <= now) return null;
  const date = formatArabicDate(ad.featuredUntil).replace(/ \d{4}$/, '');
  return date ? `مميز حتى ${date}` : 'مميز';
}
