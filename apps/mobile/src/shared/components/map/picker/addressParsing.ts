import { ADDRESS_DETAIL_KEYS, type AddressDetails } from './addressTypes';

const ARABIC_DIGITS = '٠١٢٣٤٥٦٧٨٩';

/** Western digits for Arabic-Indic ones ("٥" -> "5"). */
export function westernDigits(text: string): string {
  return text.replace(/[٠-٩]/g, (d) => String(ARABIC_DIGITS.indexOf(d)));
}

/**
 * Loose Arabic for matching: alef forms, taa marbuta / haa and alef maqsura
 * / yaa are treated alike, tatweel and diacritics are dropped.
 */
export function normalizeArabic(text: string): string {
  return westernDigits(text)
    .replace(/[ً-ْـ]/g, '')
    .replace(/[أإآ]/g, 'ا')
    .replace(/ة/g, 'ه')
    .replace(/ى/g, 'ي')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
}

/** "السالمية قطعة 5" -> { rest: "السالمية", block: "5" } */
export function splitBlock(query: string): { rest: string; block?: string } {
  const text = westernDigits(query);
  const match = text.match(/(?:قطعة|قطعه|ق)\s*\.?\s*(\d{1,3})/);
  if (!match) return { rest: query.trim() };
  return {
    rest: text.replace(match[0], ' ').replace(/\s+/g, ' ').trim(),
    block: match[1],
  };
}

/**
 * What a Mapbox reverse-geocode feature tells us about the address parts:
 * "قطعة N" anywhere in the place name, the street for an address result,
 * and the house number.
 */
export function guessDetailsFromFeature(feature: any): AddressDetails {
  if (!feature) return {};
  const guess: AddressDetails = {};
  const placeName = westernDigits(
    `${feature.place_name ?? ''} ${feature.text ?? ''}`,
  );
  const block = placeName.match(/(?:قطعة|قطعه)\s*(\d{1,3})/);
  if (block) guess.block = block[1];
  const types: string[] = feature.place_type ?? [];
  if (types.includes('address') && feature.text) {
    guess.street = String(feature.text).trim();
    if (feature.address) guess.building = String(feature.address).trim();
  }
  return guess;
}

/** Only the filled parts; undefined when nothing is filled. */
export function cleanDetails(
  details?: AddressDetails,
): AddressDetails | undefined {
  if (!details) return undefined;
  const out: AddressDetails = {};
  for (const key of ADDRESS_DETAIL_KEYS) {
    const value = details[key]?.trim();
    if (value) out[key] = value;
  }
  return Object.keys(out).length ? out : undefined;
}

/** "قطعة 6، شارع أحمد الجابر، جادة 3، منزل 12 (بجانب الجمعية)" */
export function formatDetails(details?: AddressDetails | null): string {
  if (!details) return '';
  const parts = [
    details.block && `قطعة ${details.block}`,
    details.street &&
      (/^(شارع|ش\.)/.test(details.street)
        ? details.street
        : `شارع ${details.street}`),
    details.avenue && `جادة ${details.avenue}`,
    details.building && `منزل ${details.building}`,
  ].filter(Boolean);
  const line = parts.join('، ');
  return details.landmark
    ? `${line}${line ? ' ' : ''}(${details.landmark})`
    : line;
}
