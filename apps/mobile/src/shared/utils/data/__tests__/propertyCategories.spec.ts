import {
  categoryOptionsFor,
  findCategoryByApiValue,
  getCategoryFields,
  isCategoryOffered,
} from '../propertyCategories';

describe('property categories', () => {
  it('offers the Figma list for sale and rent', () => {
    const labels = ['بيت', 'شقة', 'تجاري', 'عمارة', 'مكتب', 'شاليه', 'مزرعة', 'أرض'];
    expect(categoryOptionsFor('sell').map((c) => c.label)).toEqual(labels);
    expect(categoryOptionsFor('rent').map((c) => c.label)).toEqual(labels);
  });

  it('offers only land and house for exchange', () => {
    expect(categoryOptionsFor('exchange').map((c) => c.label)).toEqual([
      'أرض',
      'بيت',
    ]);
    expect(isCategoryOffered('apartment', 'exchange')).toBe(false);
    expect(isCategoryOffered('land', 'exchange')).toBe(true);
  });

  it('still knows categories that are no longer offered', () => {
    expect(findCategoryByApiValue('RESIDENTIAL')?.label).toBe('سكني');
    expect(isCategoryOffered('residential', 'sell')).toBe(false);
  });

  // The same table as the API's property-category-fields.spec.ts
  it.each([
    ['land', false, false, false, false],
    ['farm', false, false, false, false],
    ['apartment', true, true, true, true],
    ['building', true, true, true, true],
    ['house', true, true, false, true],
    ['chalet', true, true, false, true],
    ['office', true, true, false, true],
    ['commercial', true, true, false, true],
    ['residential', true, true, false, true],
  ])(
    '%s: rooms %s, baths %s, floors %s, age %s',
    (id, rooms, baths, floors, propertyAge) => {
      expect(getCategoryFields(id)).toEqual({
        rooms,
        baths,
        floors,
        propertyAge,
      });
    },
  );

  it('shows rooms and baths before a category is picked', () => {
    expect(getCategoryFields(null)).toEqual({
      rooms: true,
      baths: true,
      floors: false,
      propertyAge: true,
    });
  });
});
