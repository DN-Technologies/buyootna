import { isCoordinates, readableLocation } from '../location';

describe('readableLocation', () => {
  it('hides a location saved as raw map coordinates', () => {
    expect(isCoordinates('29.37643980000003,47.986544699999996')).toBe(true);
    expect(readableLocation('29.37643980000003,47.986544699999996')).toBe('');
  });

  it('keeps an address name, even one with a comma', () => {
    expect(readableLocation('حولي - السالمية')).toBe('حولي - السالمية');
    expect(isCoordinates('شارع 5, قطعة 2')).toBe(false);
  });
});
