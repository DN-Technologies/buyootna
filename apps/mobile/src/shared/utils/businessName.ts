// «اسم الشركة» / «اسم المكتب»: Arabic or English letters and spaces only.
// Numbers, emojis and symbols went through to the server (QA). The API
// checks the same rule (core/validators/business-name.ts); keep them alike.

// Arabic letters (with harakat and the extended letters like پ چ گ ڤ),
// English letters, and spaces
const LETTER = 'A-Za-z\\u0621-\\u063A\\u0641-\\u064A\\u064B-\\u065F\\u0670\\u0671-\\u06D3\\u06D5';

export const BUSINESS_NAME_PATTERN = new RegExp(`^[${LETTER} ]+$`);

export const BUSINESS_NAME_MESSAGE =
  'الاسم يجب أن يحتوي على حروف عربية أو إنجليزية ومسافات فقط';

const NOT_ALLOWED = new RegExp(`[^${LETTER} ]`, 'g');

/** What may be typed: everything else is dropped as it is typed or pasted. */
export function keepBusinessNameChars(text: string): string {
  return text.replace(NOT_ALLOWED, '');
}
