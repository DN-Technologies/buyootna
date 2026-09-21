import { toWesternDigits } from '../arabicNumerals';

describe('toWesternDigits', () => {
  it('converts Eastern Arabic-Indic digits to Western digits', () => {
    expect(toWesternDigits('١٢٣٤٥٦٧٨٩٠')).toBe('1234567890');
  });

  it('leaves Western digits and non-digit text untouched', () => {
    expect(toWesternDigits('1200')).toBe('1200');
    expect(toWesternDigits('م2')).toBe('م2');
  });

  it('converts mixed Arabic/Western digit strings', () => {
    expect(toWesternDigits('١٢00')).toBe('1200');
  });

  it('handles empty strings', () => {
    expect(toWesternDigits('')).toBe('');
  });
});
