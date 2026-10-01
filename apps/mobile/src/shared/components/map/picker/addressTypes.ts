// Plain address types, free of the Mapbox SDK so stores, API clients and
// tests can use them without loading the native map module

/** القطعة / الشارع / الجادة / المنزل / علامة مميزة -- all optional. */
export interface AddressDetails {
  block?: string;
  street?: string;
  avenue?: string;
  building?: string;
  landmark?: string;
}

export const ADDRESS_DETAIL_KEYS = [
  'block',
  'street',
  'avenue',
  'building',
  'landmark',
] as const;

/** A place the picker can jump to: a recent pick, a saved place or an area. */
export interface PickedPlace {
  address: string;
  lat: number;
  lng: number;
  details?: AddressDetails;
}
