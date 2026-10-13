import { getArabicCategoryLabel } from '../property';

// Every category the API can send (apps/api/prisma/enums.prisma,
// PropertyCategory): none may fall through to its English code
const CATEGORIES = [
  'COMMERCIAL',
  'INVESTMENT',
  'INDUSTRIAL',
  'COASTAL',
  'OFFICE',
  'PRIVATE',
  'HOUSE',
  'APARTMENT',
  'VILLA',
  'BUILDING',
  'LAND',
  'CHALET',
  'RESIDENTIAL',
  'FARM',
];

describe('getArabicCategoryLabel', () => {
  it.each(CATEGORIES)('has an Arabic label for %s', (category) => {
    const label = getArabicCategoryLabel(category);
    expect(label).not.toBe(category);
    expect(label).toMatch(/[؀-ۿ]/);
    expect(label).not.toMatch(/[A-Za-z]/);
  });

  it('takes the code in any case and passes Arabic through', () => {
    expect(getArabicCategoryLabel('villa')).toBe('فيلا');
    expect(getArabicCategoryLabel('عمارة')).toBe('عمارة');
    expect(getArabicCategoryLabel(null)).toBe('');
  });
});
