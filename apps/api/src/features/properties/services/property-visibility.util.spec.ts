import {
  ownerActiveWhere,
  publicListingWhere,
  withPublicListing,
} from './property-expiry.util';

describe('public listing filters', () => {
  it('hides ads whose owner suspended their account or was blocked', () => {
    expect(ownerActiveWhere()).toEqual({
      identity: { user: { isDisabled: false, isBlocked: false } },
    });
  });

  it('requires active, visible, unexpired ads of an active owner', () => {
    const where = publicListingWhere() as { AND: unknown[] };
    expect(where.AND).toEqual([
      { status: 'ACTIVE', isHidden: false },
      {
        OR: [{ endDate: null }, { endDate: { gt: expect.any(Date) as Date } }],
      },
      ownerActiveWhere(),
    ]);
  });

  it("wraps a query's own filter instead of merging into it", () => {
    const own = { type: 'SALE' as const, OR: [{ price: { lte: 5 } }] };
    const where = withPublicListing(own) as { AND: unknown[] };
    expect(where.AND[0]).toBe(own);
    // Same rules (each call stamps its own "now" for the expiry check)
    expect(where.AND[1]).toEqual({
      AND: [
        { status: 'ACTIVE', isHidden: false },
        {
          OR: [
            { endDate: null },
            { endDate: { gt: expect.any(Date) as Date } },
          ],
        },
        ownerActiveWhere(),
      ],
    });
  });
});
