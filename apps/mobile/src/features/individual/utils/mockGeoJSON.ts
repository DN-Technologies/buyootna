import { formatNumber } from '@/shared/utils/formatNumber';
// Define the shape of our feature properties based on the UI requirements
export interface MapFeatureProperties {
  id: string;
  type: 'sell' | 'rent' | 'exchange' | 'company';
  priceLabel?: string; // e.g., "150,000 د.ك"
  rating?: string; // e.g., "3.5 ★"
  logoId?: string; // Reference to an image asset loaded in Mapbox
  isSelected: boolean;
}

// Generate some mock data around Kuwait City bounds
export const generateMockGeoJSON = (): GeoJSON.FeatureCollection => {
  const features: GeoJSON.Feature[] = [];
  const types: ('sell' | 'rent' | 'exchange' | 'company')[] = [
    'sell',
    'rent',
    'exchange',
    'company',
  ];

  // Base coordinates around Kuwait City (Longitude, Latitude)
  const baseLng = 47.9774;
  const baseLat = 29.3759;

  for (let i = 1; i <= 10000; i++) {
    const type = types[Math.floor(Math.random() * types.length)];

    // Distribute points in a scatter around Kuwait City
    // e.g. longitude offset of ~0.6 degrees and latitude offset of ~0.5 degrees
    const lngOffset = (Math.random() - 0.5) * 0.6;
    const latOffset = (Math.random() - 0.5) * 0.5;
    const coordinates = [baseLng + lngOffset, baseLat + latOffset];

    const properties: MapFeatureProperties = {
      id: i.toString(),
      type,
      isSelected: false,
    };

    if (type === 'sell' || type === 'rent') {
      const price = Math.floor(Math.random() * 850 + 50) * 1000; // 50,000 to 900,000
      properties.priceLabel = `${formatNumber(price)} د.ك`;
    } else if (type === 'company') {
      const rating = (Math.random() * 2 + 3).toFixed(1); // 3.0 to 5.0 rating
      properties.rating = `${rating} ★`;
      properties.logoId = `company-logo-${(i % 5) + 1}`;
    }

    features.push({
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates,
      },
      properties,
    });
  }

  return {
    type: 'FeatureCollection',
    features,
  };
};
