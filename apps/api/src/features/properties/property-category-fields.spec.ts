import { ListingType, PropertyCategory } from '@prisma/client';

import {
  categoryFieldOverrides,
  CATEGORY_FIELDS,
  qualifiesPrice,
} from './property-category-fields';

const ALL_FIELDS = [
  'beds',
  'baths',
  'floors',
  'floorNumber',
  'propertyAge',
  'apartmentsCount',
  'rentalStatus',
  'landUse',
  'allocationStatus',
  'unitsCount',
  'monthlyIncome',
  'isCultivated',
  'isBuilt',
  'propertyIncome',
];

// What an ad of this category and deal type keeps of everything it may send
const kept = (
  category: PropertyCategory,
  type: ListingType = ListingType.SALE,
) => {
  const nulled = Object.keys(categoryFieldOverrides(category, type));
  return ALL_FIELDS.filter((f) => !nulled.includes(f));
};

describe('category fields (requirements doc, المتغير حسب الفئة)', () => {
  it.each<[PropertyCategory, string[]]>([
    ['HOUSE', ['beds', 'baths', 'floors', 'propertyAge', 'propertyIncome']],
    [
      'APARTMENT',
      ['beds', 'baths', 'floorNumber', 'propertyAge', 'propertyIncome'],
    ],
    [
      'BUILDING',
      [
        'floors',
        'propertyAge',
        'apartmentsCount',
        'rentalStatus',
        'propertyIncome',
      ],
    ],
    ['LAND', ['landUse', 'allocationStatus', 'propertyIncome']],
    [
      'COMMERCIAL',
      ['propertyAge', 'unitsCount', 'monthlyIncome', 'propertyIncome'],
    ],
    [
      'INVESTMENT',
      ['propertyAge', 'unitsCount', 'monthlyIncome', 'propertyIncome'],
    ],
    ['CHALET', ['beds', 'baths', 'propertyAge', 'propertyIncome']],
    ['FARM', ['isCultivated', 'isBuilt', 'propertyIncome']],
  ])('a %s sale ad keeps only its own fields', (category, fields) => {
    expect(kept(category)).toEqual(fields);
  });

  it('keeps حالة التخصيص on every exchange ad, and مدخول العقار only on a sale or a building', () => {
    expect(kept('HOUSE', ListingType.EXCHANGE)).toContain('allocationStatus');
    expect(kept('HOUSE', ListingType.RENT)).not.toContain('allocationStatus');
    expect(kept('HOUSE', ListingType.RENT)).not.toContain('propertyIncome');
    expect(kept('BUILDING', ListingType.RENT)).toContain('propertyIncome');
  });

  it('leaves the categories no longer offered as they were', () => {
    expect(CATEGORY_FIELDS.OFFICE).toMatchObject({
      rooms: true,
      baths: true,
      propertyAge: true,
    });
    expect(kept('VILLA')).toEqual([
      'beds',
      'baths',
      'propertyAge',
      'propertyIncome',
    ]);
  });
});

describe('a clear price (Ministry of Commerce, December 2024)', () => {
  it.each([
    'السعر حد 120 ألف',
    'السعر على السوم',
    'السعر: بالسوم',
    'السعر مراجعه',
    'السعر عند المراجعة',
    'سعر الحد 450 د.ك',
    'السـوم واصل 300 الف',
    'حده 95,000',
  ])('refuses «%s»', (text) => {
    expect(qualifiesPrice(text)).toBe(true);
  });

  it.each([
    'شقة ثلاث غرف قريبة من الخدمات',
    'الحد الشمالي للقسيمة شارع رئيسي',
    'بعد مراجعة البلدية تم اعتماد المخطط',
    'لا حدود لإطلالة البحر',
    'السعر 450 د.ك شامل',
    '',
  ])('accepts «%s»', (text) => {
    expect(qualifiesPrice(text)).toBe(false);
  });
});
