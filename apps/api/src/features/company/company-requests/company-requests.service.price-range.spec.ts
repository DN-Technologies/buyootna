import { parsePriceRange } from './company-requests.service';

describe('parsePriceRange', () => {
  it.each([
    ['200 - 800 د.ك', 200, 800],
    ['15,000 - 22,000 د.ك', 15000, 22000],
    ['٣٠٠ - ٩٠٠ د.ك', 300, 900],
    ['0 - 500 د.ك', 0, 500],
  ])('%s', (text, min, max) => {
    expect(parsePriceRange(text)).toEqual({ priceMin: min, priceMax: max });
  });

  it('no range: nothing', () => {
    expect(parsePriceRange(null)).toEqual({ priceMin: null, priceMax: null });
    expect(parsePriceRange('غير محدد')).toEqual({
      priceMin: null,
      priceMax: null,
    });
  });
});
