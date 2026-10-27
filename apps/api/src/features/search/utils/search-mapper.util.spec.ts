import 'reflect-metadata';
import { FilterTab } from '../dto/advanced-search.dto';
import { mapToFrontendCard } from './search-mapper.util';

// No logo or photo is null: the app draws its own avatar icon, instead of a
// third-party placeholder image (via.placeholder.com)
describe('mapToFrontendCard image', () => {
  it("is the company's logo, or null without one", () => {
    const withLogo = mapToFrontendCard(
      { id: 'c1', companyData: { name: 'شركة', logoUrl: 'https://cdn/l.png' } },
      FilterTab.COMPANIES,
    );
    const without = mapToFrontendCard(
      { id: 'c2', companyData: { name: 'شركة' } },
      FilterTab.COMPANIES,
    );
    expect(withLogo.logoUrl).toBe('https://cdn/l.png');
    expect(without.logoUrl).toBeNull();
  });

  it("is the property's first photo, or null without one", () => {
    const without = mapToFrontendCard(
      { id: 'p1', type: 'SALE', images: [], location: 'السالمية' },
      FilterTab.SELL,
    );
    expect(without.logoUrl).toBeNull();
  });
});
