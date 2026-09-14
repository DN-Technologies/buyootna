const EASTERN_ARABIC_DIGITS: Record<string, string> = {
  '٠': '0',
  '١': '1',
  '٢': '2',
  '٣': '3',
  '٤': '4',
  '٥': '5',
  '٦': '6',
  '٧': '7',
  '٨': '8',
  '٩': '9',
};

/** Converts Eastern Arabic-Indic digits (١٢٣) to Western digits (123). */
export function toWesternDigits(value: string): string {
  return value.replace(/[٠-٩]/g, (digit) => EASTERN_ARABIC_DIGITS[digit]);
}
