import { formatNumber } from '@/shared/utils/formatNumber';

describe('formatNumber', () => {
  it('formats with Western digits and thousands separators regardless of device locale', () => {
    expect(formatNumber(1234)).toBe('1,234');
    expect(formatNumber(1300)).toBe('1,300');
    expect(formatNumber(0)).toBe('0');
    expect(formatNumber(999999)).toBe('999,999');
  });

  it('does not use the runtime default locale for digits', () => {
    // The bare toLocaleString() would follow the device locale and render
    // Eastern Arabic numerals (١٬٢٣٤) on Arabic-locale devices.
    expect(formatNumber(1234567)).toBe('1,234,567');
    expect(formatNumber(1234567)).not.toContain('١');
  });
});
