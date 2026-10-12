import type { ListingStateData } from '@/shared/store/useListingStore';
import { findCategoryByApiValue } from '@/shared/utils/data/propertyCategories';
import type { PropertyDetailsDto } from '@/types/property';

const LISTING_TYPES = { SALE: 'sell', RENT: 'rent', EXCHANGE: 'exchange' } as const;

const text = (value: number | string | null | undefined) =>
  value ? value.toString() : '';

const sameItems = (current: string[], initial: string[]) =>
  current.length === initial.length &&
  current.every((item) => initial.includes(item));

/**
 * Whether the edit form differs from the ad it was loaded from, i.e. there
 * is something to save (or to lose by leaving).
 */
export function hasListingChanges(
  form: ListingStateData,
  initial: PropertyDetailsDto,
): boolean {
  const { listingType } = form;
  if (listingType !== LISTING_TYPES[initial.type]) return true;

  // Location
  if (form.governorate?.id !== initial.governorateId) return true;
  if (form.area?.id !== initial.areaId) return true;

  // Category & size
  const initialCategory =
    findCategoryByApiValue(initial.category)?.id ?? 'residential';
  if ((form.propertyCategory?.id || '') !== initialCategory) return true;
  if ((parseFloat(form.areaSize) || 0) !== (initial.areaSize || 0)) return true;

  // Automated number, age and counts
  if (form.automatedNumber !== (initial.automatedNumber || '')) return true;
  if (form.propertyAge !== text(initial.propertyAge)) return true;
  if (form.rooms !== (initial.beds ?? 0)) return true;
  if (form.baths !== (initial.baths ?? 0)) return true;
  if (form.floors !== (initial.floors ?? 0)) return true;

  // Details & contact; a number counts only while its toggle is on
  if (form.adDetails !== (initial.description || '')) return true;
  const phone = form.showPhone ? form.phoneNumber : '';
  if (phone !== (initial.phoneNumber || '')) return true;
  const whatsapp = form.showWhatsapp ? form.whatsappNumber : '';
  if (whatsapp !== (initial.whatsappNumber || '')) return true;

  // Price (monthly rent on a rent ad) and its toggle
  const shownPrice = listingType === 'rent' ? form.monthlyRent : form.price;
  if (shownPrice !== text(initial.price)) return true;
  const hadPrice = initial.price !== null && initial.price !== undefined;
  if (form.showPrice !== hadPrice) return true;

  if (listingType === 'exchange') {
    if (form.requestYear !== text(initial.requestYear)) return true;
    if (form.requiredYear !== text(initial.requiredYear)) return true;
    if (form.allocationState !== (initial.allocationStatus || '')) return true;
  }

  const initialFeatures = (initial.features ?? []).map(
    (feature) => feature.label || (feature as unknown as string),
  );
  if (!sameItems(form.features, initialFeatures)) return true;
  if (!sameItems(form.images, initial.images || [])) return true;

  return false;
}
