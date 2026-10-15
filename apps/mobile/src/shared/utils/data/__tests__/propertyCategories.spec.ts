import {
  categoryOptionsFor,
  findCategoryByApiValue,
  getCategoryFields,
  isCategoryOffered,
} from '../propertyCategories';

describe('property categories', () => {
  // The requirements document's eight categories; مكتب is no longer offered
  it('offers the requirements list for sale and rent', () => {
    const labels = ['بيت', 'شقة', 'عمارة', 'أرض', 'تجاري', 'استثماري', 'شاليه', 'مزرعة'];
    expect(categoryOptionsFor('sell').map((c) => c.label)).toEqual(labels);
    expect(categoryOptionsFor('rent').map((c) => c.label)).toEqual(labels);
    expect(isCategoryOffered('office', 'sell')).toBe(false);
    expect(findCategoryByApiValue('OFFICE')?.label).toBe('مكتب');
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
  // (requirements doc, المتغير حسب الفئة): which fields each one shows
  const shown = (id: string | null) =>
    Object.entries(getCategoryFields(id))
      .filter(([, on]) => on)
      .map(([field]) => field);

  it.each<[string, string[]]>([
    ['house', ['rooms', 'baths', 'floors', 'propertyAge']],
    ['apartment', ['rooms', 'baths', 'floorNumber', 'propertyAge']],
    ['building', ['floors', 'propertyAge', 'apartments']],
    ['land', ['landUse']],
    ['commercial', ['propertyAge', 'units']],
    ['investment', ['propertyAge', 'units']],
    ['chalet', ['rooms', 'baths', 'propertyAge']],
    ['farm', ['farm']],
    // No longer offered: as they were
    ['office', ['rooms', 'baths', 'propertyAge']],
    ['residential', ['rooms', 'baths', 'propertyAge']],
  ])('%s shows %j', (id, fields) => {
    expect(shown(id)).toEqual(fields);
  });

  it('shows rooms, baths and age before a category is picked', () => {
    expect(shown(null)).toEqual(['rooms', 'baths', 'propertyAge']);
  });
});
