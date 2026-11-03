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
