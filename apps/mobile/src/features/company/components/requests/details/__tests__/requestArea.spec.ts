import { requestArea } from '../RequestDetailsInfoGrid';

describe('requestArea', () => {
  it('keeps the area of «المحافظة - المنطقة»', () => {
    expect(requestArea('الفروانية - جنوب عبدالله المبارك')).toBe(
      'جنوب عبدالله المبارك',
    );
  });

  it('leaves a location without a governorate as it is', () => {
    expect(requestArea('شمال غرب صليبيخات')).toBe('شمال غرب صليبيخات');
    // An area name with its own hyphen (no spaces round it) stays whole
    expect(requestArea('حولي - بيان-غرب')).toBe('بيان-غرب');
  });
});
