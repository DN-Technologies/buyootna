import { FilterTab } from '../dto/advanced-search.dto';

export interface SearchResultItem {
  id: string;
  name: string;
  category: string;
  serviceArea: string;
  projectsCount: string;
  logoUrl: string;
  isFavorite: boolean;
}

export function mapToFrontendCard(
  item: unknown,
  tab: FilterTab,
): SearchResultItem {
  // --- 1. Company Mapping ---
  if (tab === FilterTab.COMPANIES) {
    const company = item as {
      id: string;
      companyProfile?: {
        name?: string | null;
        specialty?: string | null;
        serviceAreas?: string | null;
        logoUrl?: string | null;
      } | null;
    };

    return {
      id: company.id,
      name: company.companyProfile?.name || 'Unknown Company',
      category: company.companyProfile?.specialty || 'General Contracting',
      serviceArea: company.companyProfile?.serviceAreas || 'All Areas',
      projectsCount: '+85', // You can dynamically calculate this if you have a projects table
      logoUrl:
        company.companyProfile?.logoUrl || 'https://via.placeholder.com/150',
      isFavorite: false,
    };
  }

  // --- 2. Property Mapping (Sell, Rent, Exchange, Auctions, Deals) ---
  // We hijack the frontend card slots to display property-specific data
  const property = item as {
    id: string;
    type: string;
    title?: string;
    propertyType?: string;
    category?: string;
    areaSize?: number | null;
    area?: { name: string } | null;
    location: string;
    price?: number | null;
    images?: string[];
  };

  let typeLabel = '';
  if (property.type === 'SALE') typeLabel = 'للبيع';
  if (property.type === 'RENT') typeLabel = 'للإيجار';
  if (property.type === 'EXCHANGE') typeLabel = 'للبدل';
  if (property.type === 'AUCTION') typeLabel = 'مزاد';
  if (property.type === 'DEAL') typeLabel = 'صفقة';

  // Construct a fallback title if one doesn't exist
  const propertyTitle = property.title || `عقار ${typeLabel}`;

  return {
    id: property.id,
    name: propertyTitle,
    category: property.propertyType || property.category || 'عقار',
    // Hijack serviceArea to show physical area and geographical location
    serviceArea: `${property.areaSize || 0} م² - ${property.area?.name || property.location}`,
    // Hijack projectsCount to show the price beautifully formatted
    projectsCount: property.price
      ? `${property.price.toLocaleString()} د.ك`
      : 'السعر عند الاتصال',
    logoUrl: property.images?.[0] || 'https://via.placeholder.com/150',
    isFavorite: false, // You can cross-reference with a UserFavorites table here
  };
}
