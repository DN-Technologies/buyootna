import { PropertyCategory } from '@prisma/client';
import {
  CATEGORY_FIELDS,
  categoryFieldOverrides,
} from './property-category-fields';

describe('property category fields', () => {
  it('covers every category', () => {
    expect(Object.keys(CATEGORY_FIELDS).sort()).toEqual(
      Object.values(PropertyCategory).sort(),
    );
  });

  // The same table as the mobile app's propertyCategories.spec.ts
  it.each([
    ['LAND', false, false, false, false],
    ['FARM', false, false, false, false],
    ['APARTMENT', true, true, true, true],
    ['BUILDING', true, true, true, true],
    ['HOUSE', true, true, false, true],
    ['CHALET', true, true, false, true],
    ['OFFICE', true, true, false, true],
    ['COMMERCIAL', true, true, false, true],
    ['RESIDENTIAL', true, true, false, true],
  ] as const)(
    '%s: rooms %s, baths %s, floors %s, age %s',
    (category, rooms, baths, floors, propertyAge) => {
      expect(CATEGORY_FIELDS[category]).toEqual({
        rooms,
        baths,
        floors,
        propertyAge,
      });
    },
  );

  it('nulls every count for land', () => {
    expect(categoryFieldOverrides('LAND')).toEqual({
      beds: null,
      baths: null,
      floors: null,
      propertyAge: null,
    });
  });

  it('only nulls floors for a house', () => {
    expect(categoryFieldOverrides('HOUSE')).toEqual({ floors: null });
  });

  it('leaves an apartment and a missing category untouched', () => {
    expect(categoryFieldOverrides('APARTMENT')).toEqual({});
    expect(categoryFieldOverrides(undefined)).toEqual({});
  });
});
