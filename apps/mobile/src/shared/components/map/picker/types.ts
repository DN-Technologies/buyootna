import Mapbox from '@rnmapbox/maps';

import type { AddressDetails } from './addressTypes';
import { MAPBOX_ACCESS_TOKEN } from './config';

export { MAPBOX_ACCESS_TOKEN } from './config';

// Initialize Mapbox with access token
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

// Kuwait Center Default Coordinates: [Longitude, Latitude]
export const DEFAULT_CENTER: [number, number] = [47.9774, 29.3759];
export const DEFAULT_ZOOM = 14.5;

export type { AddressDetails, PickedPlace } from './addressTypes';
export { ADDRESS_DETAIL_KEYS } from './addressTypes';

export interface MapPickerModalProps {
  visible: boolean;
  onClose: () => void;
  /**
   * `details` is only what the user filled in (or the map guessed and they
   * kept); undefined when nothing was filled.
   */
  onConfirm: (
    addressName: string,
    lat: number,
    lng: number,
    details?: AddressDetails,
  ) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddressLabel?: string;
  initialDetails?: AddressDetails;
}

export interface SearchResultItem {
  id: string;
  place_name: string;
  text: string;
  center: [number, number]; // [lng, lat]
}
