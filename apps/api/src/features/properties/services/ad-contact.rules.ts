/**
 * What an ad shows of its numbers, from its «طرق التواصل»: with both «اتصال»
 * and «واتساب» off, no number leaves the server (the app shows only
 * «مراسلة»). With one on, the number stays: WhatsApp uses it too.
 */
export function adNumbersVisible(ad: {
  showPhone?: boolean | null;
  showWhatsapp?: boolean | null;
}): boolean {
  return ad.showPhone !== false || ad.showWhatsapp !== false;
}
