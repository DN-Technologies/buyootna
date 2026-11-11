import { isSlotUsable, slotExpiry, usableSlotWhere } from './plan-slots.rules';

// «صلاحية انتهاء الباقة»: an office bundle's unused ads are lost after it
describe('plan slot rules', () => {
  const now = new Date('2026-11-11T10:00:00Z');

  it('a bundle bought now expires that many months later; none without', () => {
    expect(slotExpiry(2, now)).toEqual(new Date('2027-01-11T10:00:00Z'));
    expect(slotExpiry(6, now)).toEqual(new Date('2027-05-11T10:00:00Z'));
    expect(slotExpiry(null, now)).toBeNull();
    expect(slotExpiry(0, now)).toBeNull();
  });

  it.each([
    [
      'active, ads left, no expiry',
      { status: 'ACTIVE', adsRemaining: 2, expiresAt: null },
      true,
    ],
    [
      'before its expiry',
      { status: 'ACTIVE', adsRemaining: 2, expiresAt: new Date('2026-11-12') },
      true,
    ],
    [
      'past its expiry',
      { status: 'ACTIVE', adsRemaining: 2, expiresAt: new Date('2026-11-10') },
      false,
    ],
    [
      'marked expired',
      { status: 'EXPIRED', adsRemaining: 2, expiresAt: null },
      false,
    ],
    [
      'no ads left',
      { status: 'ACTIVE', adsRemaining: 0, expiresAt: null },
      false,
    ],
    [
      'older credits (no expiresAt at all)',
      { status: 'ACTIVE', adsRemaining: 1 },
      true,
    ],
  ])('%s → usable %s', (_, slot, usable) => {
    expect(isSlotUsable(slot as never, now)).toBe(usable);
  });

  it('the query matches the same rule', () => {
    expect(usableSlotWhere(now)).toEqual({
      status: 'ACTIVE',
      adsRemaining: { gt: 0 },
      OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
    });
  });
});
