import { Alert, ListingType, Prisma, PropertyCategory } from '@prisma/client';

/**
 * Matching rules between a saved Alert and a Property listing. Two forms of
 * the same rules:
 *  - propertyMatchesAlert: in-memory check, used when a listing is published
 *    (one query for candidate alerts, then filter here -- no per-alert query)
 *  - alertMatchWhere: Prisma filter, used to list an alert's matches
 * Both must agree; the spec runs the same cases through each.
 *
 * Every criterion is optional: null / 0 / empty means "any". Amenities are
 * not matched -- alerts store ids ("pool") while listings store feature
 * labels, and there is no shared key between them yet.
 */

export type AlertCriteria = Pick<
  Alert,
  | 'type'
  | 'operationType'
  | 'governorateId'
  | 'areaId'
  | 'categoryId'
  | 'price'
  | 'rentValue'
  | 'areaSize'
  | 'rooms'
  | 'baths'
  | 'floors'
  | 'requestYear'
  | 'requiredYear'
  | 'startDate'
  | 'endDate'
>;

export interface MatchableProperty {
  type: ListingType;
  category: PropertyCategory;
  governorateId: string | null;
  areaId: string | null;
  price: number | null;
  areaSize: number | null;
  beds: number | null;
  baths: number | null;
  floors: number | null;
  requestYear: number | null;
  requiredYear: number | null;
  startDate: Date | null;
}

// Alert category ids are the lowercase PropertyCategory values ("apartment")
function toCategory(categoryId: string | null): PropertyCategory | null {
  if (!categoryId) return null;
  const upper = categoryId.toUpperCase();
  return upper in PropertyCategory ? (upper as PropertyCategory) : null;
}

const isSet = (value: number | null | undefined): value is number =>
  value !== null && value !== undefined && value > 0;

/** The listing type an alert targets. */
export function alertListingType(alert: AlertCriteria): ListingType | null {
  return alert.type === 'AUCTIONS' ? ListingType.AUCTION : alert.operationType;
}

/** Max price for the alert: the sale budget or the rent ceiling. */
function maxPrice(alert: AlertCriteria): number | null {
  if (alert.operationType === 'RENT') {
    return isSet(alert.rentValue) ? alert.rentValue : null;
  }
  if (alert.operationType === 'SALE') {
    return isSet(alert.price) ? alert.price : null;
  }
  return null;
}

export function propertyMatchesAlert(
  alert: AlertCriteria,
  property: MatchableProperty,
): boolean {
  const listingType = alertListingType(alert);
  if (listingType && property.type !== listingType) return false;

  if (property.governorateId !== alert.governorateId) return false;
  if (alert.areaId && property.areaId !== alert.areaId) return false;

  const category = toCategory(alert.categoryId);
  if (category && property.category !== category) return false;

  if (alert.type === 'AUCTIONS') {
    if (alert.startDate || alert.endDate) {
      if (!property.startDate) return false;
      if (alert.startDate && property.startDate < alert.startDate) return false;
      if (alert.endDate && property.startDate > alert.endDate) return false;
    }
    return true;
  }

  const priceCap = maxPrice(alert);
  if (
    priceCap !== null &&
    (property.price === null || property.price > priceCap)
  ) {
    return false;
  }

  if (isSet(alert.areaSize)) {
    if (property.areaSize === null || property.areaSize < alert.areaSize) {
      return false;
    }
  }

  if (alert.operationType === 'EXCHANGE') {
    const minimums: [number | null, number | null][] = [
      [alert.rooms, property.beds],
      [alert.baths, property.baths],
      [alert.floors, property.floors],
    ];
    for (const [min, actual] of minimums) {
      if (isSet(min) && (actual === null || actual < min)) return false;
    }
    if (
      isSet(alert.requestYear) &&
      property.requestYear !== alert.requestYear
    ) {
      return false;
    }
    if (
      isSet(alert.requiredYear) &&
      property.requiredYear !== alert.requiredYear
    ) {
      return false;
    }
  }

  return true;
}

export function alertMatchWhere(
  alert: AlertCriteria,
): Prisma.PropertyWhereInput {
  const where: Prisma.PropertyWhereInput = {
    governorateId: alert.governorateId,
  };

  const listingType = alertListingType(alert);
  if (listingType) where.type = listingType;
  if (alert.areaId) where.areaId = alert.areaId;

  const category = toCategory(alert.categoryId);
  if (category) where.category = category;

  if (alert.type === 'AUCTIONS') {
    if (alert.startDate || alert.endDate) {
      where.startDate = {
        not: null,
        ...(alert.startDate ? { gte: alert.startDate } : {}),
        ...(alert.endDate ? { lte: alert.endDate } : {}),
      };
    }
    return where;
  }

  const priceCap = maxPrice(alert);
  if (priceCap !== null) where.price = { lte: priceCap };
  if (isSet(alert.areaSize)) where.areaSize = { gte: alert.areaSize };

  if (alert.operationType === 'EXCHANGE') {
    if (isSet(alert.rooms)) where.beds = { gte: alert.rooms };
    if (isSet(alert.baths)) where.baths = { gte: alert.baths };
    if (isSet(alert.floors)) where.floors = { gte: alert.floors };
    if (isSet(alert.requestYear)) where.requestYear = alert.requestYear;
    if (isSet(alert.requiredYear)) where.requiredYear = alert.requiredYear;
  }

  return where;
}
