/**
 * A letter avatar's colours, the app's own: the light gold of its pills
 * (#FBEFCD) behind the brand navy (#15304D). Kept in step with the
 * bg-[#FBEFCD] / text-[#15304D] classes the letter fallbacks use.
 */
export const LETTER_AVATAR = { background: '#FBEFCD', letter: '#15304D' };

// Arabic's definite article, which would make every «ال…» name start alike
const ARTICLE = /^ال(?=\S{2,})/;

/**
 * The letter a profile with no photo shows: the name's first letter, leaving
 * out «ال» so «الصباح» isn't one more «ا». «شركة النبض» → «ش», «الصباح» → «ص»,
 * «ebrahim» → «E».
 */
export function nameInitials(name?: string | null): string {
  const first = (name ?? '').trim().split(/\s+/)[0] ?? '';
  const [letter = ''] = [...first.replace(ARTICLE, '')];
  return letter.toUpperCase();
}
