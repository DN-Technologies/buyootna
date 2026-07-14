import { ListingType } from '@prisma/client';

export type MapPinType = 'sell' | 'rent' | 'exchange' | 'company';

export interface MapFeatureProperties {
  id: string;
  type: MapPinType;
  priceLabel?: string;
  rating?: string;
  logoId?: string;
  isSelected: boolean;
}

interface PropertyPinRow {
  id: string;
  type: ListingType;
  price: number | null;
  latitude: number | null;
  longitude: number | null;
}

interface CompanyPinRow {
  id: string;
  latitude: number | null;
  longitude: number | null;
  logoUrl: string | null;
}

const LISTING_TO_PIN: Partial<Record<ListingType, MapPinType>> = {
  [ListingType.SALE]: 'sell',
  [ListingType.RENT]: 'rent',
  [ListingType.EXCHANGE]: 'exchange',
};

function formatPriceLabel(price: number | null): string | undefined {
  if (price == null) return undefined;
  return `${price.toLocaleString()} د.ك`;
}

function toFeature(
  id: string,
  lng: number,
  lat: number,
  properties: MapFeatureProperties,
) {
  return {
    type: 'Feature' as const,
    geometry: {
      type: 'Point' as const,
      coordinates: [lng, lat],
    },
    properties,
  };
}

export function propertiesToFeatureCollection(rows: PropertyPinRow[]) {
  const features = rows
    .filter(
      (row) =>
        row.latitude != null &&
        row.longitude != null &&
        LISTING_TO_PIN[row.type],
    )
    .map((row) => {
      const pinType = LISTING_TO_PIN[row.type]!;
      return toFeature(row.id, row.longitude!, row.latitude!, {
        id: row.id,
        type: pinType,
        priceLabel:
          pinType === 'sell' || pinType === 'rent'
            ? formatPriceLabel(row.price)
            : undefined,
        isSelected: false,
      });
    });

  return { type: 'FeatureCollection' as const, features };
}

export function companiesToFeatureCollection(rows: CompanyPinRow[]) {
  const features = rows
    .filter((row) => row.latitude != null && row.longitude != null)
    .map((row) =>
      toFeature(row.id, row.longitude!, row.latitude!, {
        id: row.id,
        type: 'company',
        rating: '4.5 ★', // placeholder until ratings exist
        logoId: row.logoUrl ?? undefined,
        isSelected: false,
      }),
    );

  return { type: 'FeatureCollection' as const, features };
}
