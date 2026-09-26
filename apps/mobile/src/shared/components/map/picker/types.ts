import Mapbox from '@rnmapbox/maps';

// Initialize Mapbox with access token
export const MAPBOX_ACCESS_TOKEN =
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  'pk.eyJ1IjoiY29uc3R5b3Vzc2VmIiwiYSI6ImNtcmh2dTZ3azFrNzczMHNldzNyc2hia3gifQ.VteDtFkHHKEsyVL004WSkQ';
Mapbox.setAccessToken(MAPBOX_ACCESS_TOKEN);

// Kuwait Center Default Coordinates: [Longitude, Latitude]
export const DEFAULT_CENTER: [number, number] = [47.9774, 29.3759];
export const DEFAULT_ZOOM = 14.5;

export interface MapPickerModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm: (addressName: string, lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
  initialAddressLabel?: string;
}

export interface SearchResultItem {
  id: string;
  place_name: string;
  text: string;
  center: [number, number]; // [lng, lat]
}
