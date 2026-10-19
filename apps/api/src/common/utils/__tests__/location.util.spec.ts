import { readableLocation } from '../location.util';

describe('readableLocation', () => {
  it('hides a location saved as raw map coordinates', () => {
    expect(readableLocation('29.37643980000003,47.986544699999996')).toBeNull();
    expect(readableLocation(' 29.3, -47.9 ')).toBeNull();
  });

  it('keeps an address name', () => {
    expect(readableLocation('حولي - السالمية')).toBe('حولي - السالمية');
    expect(readableLocation('شارع 5, قطعة 2')).toBe('شارع 5, قطعة 2');
  });

  it('is null when there is nothing', () => {
    expect(readableLocation(null)).toBeNull();
    expect(readableLocation('  ')).toBeNull();
  });
});
