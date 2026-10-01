// The Mapbox token for the SDK and the geocoding REST calls (kept apart
// from types.ts so the REST helpers don't load the native SDK)
export const MAPBOX_ACCESS_TOKEN =
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ||
  'pk.eyJ1IjoiY29uc3R5b3Vzc2VmIiwiYSI6ImNtcmh2dTZ3azFrNzczMHNldzNyc2hia3gifQ.VteDtFkHHKEsyVL004WSkQ';
