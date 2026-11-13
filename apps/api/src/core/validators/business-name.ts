// A company's or office's name: Arabic or English letters and spaces only
// (QA: numbers, emojis and symbols were accepted). The app filters the same
// set as it is typed (mobile shared/utils/businessName.ts); keep them alike.
const LETTER =
  'A-Za-z\\u0621-\\u063A\\u0641-\\u064A\\u064B-\\u065F\\u0670\\u0671-\\u06D3\\u06D5';

// Harakat are combining marks, allowed on purpose (a name may be voweled)
// eslint-disable-next-line no-misleading-character-class
export const BUSINESS_NAME_PATTERN = new RegExp(`^[${LETTER} ]+$`);

export const BUSINESS_NAME_MESSAGE =
  'الاسم يجب أن يحتوي على حروف عربية أو إنجليزية ومسافات فقط';
