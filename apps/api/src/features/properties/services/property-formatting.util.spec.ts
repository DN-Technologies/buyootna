import {
  formatProperties,
  PropertyFeedPayload,
} from './property-formatting.util';

const property = (overrides: Partial<PropertyFeedPayload>) =>
  ({
    id: 'p1',
    images: [],
    price: 1000,
    isFeatured: false,
    category: 'INVESTMENT',
    areaSize: 200,
    propertyIncome: null,
    beds: 3,
    baths: 2,
    location: 'السالمية',
    createdAt: new Date('2026-09-01'),
    publishedAt: new Date('2026-09-01'),
    phoneNumber: null,
    identity: null,
    ...overrides,
  }) as unknown as PropertyFeedPayload;

describe('formatProperties', () => {
  it("returns the property's income, which the cards show as 'مدخول العقار'", () => {
    const [card] = formatProperties([property({ propertyIncome: 1500 })]);
    expect(card.propertyIncome).toBe(1500);
  });

  it('returns null when the ad has no income (the card then hides the row)', () => {
    const [card] = formatProperties([property({ propertyIncome: null })]);
    expect(card.propertyIncome).toBeNull();
  });

  it('returns the listing type and, for an exchange ad, its two years', () => {
    const [card] = formatProperties([
      property({ type: 'EXCHANGE', requestYear: 2021, requiredYear: 2023 }),
    ]);
    expect(card).toMatchObject({
      listingType: 'EXCHANGE',
      requestYear: 2021,
      requiredYear: 2023,
    });
  });
});
