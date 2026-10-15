// The price must be clear and fixed (Ministry of Commerce, December 2024).
// Mirrors the API's qualifiesPrice (apps/api/src/features/properties/
// property-category-fields.ts) -- change both. The app checks first so the
// advertiser hears it before publishing; the server has the last word.

// «حد» (a floor price), «سوم» (open to offers), «مراجعة» (price on
// request), as whole words with or without the article or a preposition.
// They count only next to a price -- «سعر», a currency, «ألف» or a number
// within a few words -- so «الحد الشمالي» of a plot is left alone.
const QUALIFIER_WORD =
  /(^|[^ء-ي])(?:[وبلف]?ال|[وبلف])?(حد|حده|سوم|مراجعه|مراجعة)(?=$|[^ء-ي])/g;
const PRICE_NEARBY = /سعر|د\.?\s?ك|دينار|ال?ف|[0-9٠-٩]/;
const NEARBY_CHARS = 25;

const normalize = (text: string) =>
  text
    .replace(/ـ/g, '')
    .replace(/[ً-ْ]/g, '')
    .replace(/[أإآ]/g, 'ا');

/** Whether the ad's text qualifies its price with a forbidden word. */
export function qualifiesPrice(text?: string | null): boolean {
  if (!text) return false;
  const plain = normalize(text);
  for (const match of plain.matchAll(QUALIFIER_WORD)) {
    const start = match.index ?? 0;
    const around = plain.slice(
      Math.max(0, start - NEARBY_CHARS),
      start + match[0].length + NEARBY_CHARS,
    );
    if (PRICE_NEARBY.test(around)) return true;
  }
  return false;
}

export const PRICE_QUALIFIER_MESSAGE =
  'وفق قرار وزارة التجارة (ديسمبر 2024) يجب أن يكون السعر واضحاً ومحدداً، ولا يجوز إضافة كلمات مثل «حد» أو «سوم» أو «مراجعة» إليه. احذفها من تفاصيل الإعلان.';
