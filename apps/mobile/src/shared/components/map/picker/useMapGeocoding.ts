import { useCallback, useRef, useState } from 'react';

import { guessDetailsFromFeature } from './addressParsing';
import { type AddressDetails, MAPBOX_ACCESS_TOKEN } from './types';

export function useMapGeocoding(initialLabel?: string) {
  const [addressLabel, setAddressLabel] = useState<string>(
    initialLabel || 'جاري تحميل الموقع...',
  );
  const [isLoadingAddress, setIsLoadingAddress] = useState(false);
  // What the map knows about block / street / house at the pin, used to
  // pre-fill the address details the user hasn't typed themselves
  const [detailsGuess, setDetailsGuess] = useState<AddressDetails>({});
  const reverseGeoTimerRef = useRef<any>(null);

  const reverseGeocode = useCallback(async (lat: number, lng: number) => {
    setIsLoadingAddress(true);
    try {
      // 1. Try Mapbox Reverse Geocoding API
      const mapboxUrl = `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}&language=ar`;
      const response = await fetch(mapboxUrl);
      const data = await response.json();

      if (data && data.features && data.features.length > 0) {
        const feature = data.features[0];
        setDetailsGuess(guessDetailsFromFeature(feature));
        const fullPlace = feature.place_name || feature.text || '';
        const parts = fullPlace.split(',').map((s: string) => s.trim());
        const cleanedLabel =
          parts.length > 2 ? `${parts[0]}، ${parts[1]}` : parts.join('، ');

        setAddressLabel(cleanedLabel);
      } else {
        setDetailsGuess({});
        // 2. Fallback to OpenStreetMap Nominatim
        const nomUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1&accept-language=ar`;
        const nomRes = await fetch(nomUrl, {
          headers: { 'User-Agent': 'BuyootnaApp/1.0' },
        });
        const nomData = await nomRes.json();
        if (nomData && nomData.address) {
          const addr = nomData.address;
          const neighborhood = addr.neighbourhood || addr.suburb || '';
          const cityOrTown = addr.city || addr.town || addr.village || '';
          const state = addr.state || addr.county || '';
          const parts = [neighborhood, cityOrTown, state]
            .filter(Boolean)
            .filter((val, index, self) => self.indexOf(val) === index);
          setAddressLabel(
            parts.length > 0
              ? parts.join('، ')
              : nomData.display_name.split(',')[0],
          );
        } else {
          setAddressLabel(`موقع محدد (${lat.toFixed(4)}، ${lng.toFixed(4)})`);
        }
      }
    } catch (err) {
      console.warn('Reverse geocoding error:', err);
      setAddressLabel(`موقع محدد (${lat.toFixed(4)}، ${lng.toFixed(4)})`);
    } finally {
      setIsLoadingAddress(false);
    }
  }, []);

  const triggerDebouncedReverseGeocode = useCallback(
    (lat: number, lng: number) => {
      if (reverseGeoTimerRef.current) {
        clearTimeout(reverseGeoTimerRef.current);
      }
      reverseGeoTimerRef.current = setTimeout(() => {
        reverseGeocode(lat, lng);
      }, 600);
    },
    [reverseGeocode],
  );

  return {
    addressLabel,
    setAddressLabel,
    isLoadingAddress,
    detailsGuess,
    reverseGeocode,
    triggerDebouncedReverseGeocode,
  };
}

