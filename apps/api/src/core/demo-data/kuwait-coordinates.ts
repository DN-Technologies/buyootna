/** Approximate area centers [lat, lng] for seeded Kuwait locations. */
const AREA_CENTROIDS: Record<string, [number, number]> = {
  // العاصمة
  capital_1: [29.375, 47.99],
  capital_2: [29.369, 47.975],
  capital_3: [29.378, 47.998],
  capital_4: [29.365, 47.955],
  capital_5: [29.352, 47.945],
  capital_6: [29.358, 47.962],
  // حولي
  hawally_1: [29.334, 48.065],
  hawally_2: [29.333, 48.028],
  hawally_3: [29.347, 48.048],
  hawally_4: [29.319, 48.035],
  hawally_5: [29.327, 48.078],
  hawally_6: [29.31, 48.062],
  hawally_7: [29.305, 48.045],
  hawally_8: [29.29, 48.038],
  // الفروانية
  farwaniya_1: [29.277, 47.958],
  farwaniya_2: [29.292, 47.978],
  farwaniya_3: [29.301, 47.965],
  farwaniya_4: [29.285, 47.932],
  farwaniya_5: [29.268, 47.945],
  farwaniya_6: [29.295, 47.902],
  // الأحمدي
  ahmadi_1: [29.173, 48.123],
  ahmadi_2: [29.075, 48.205],
  ahmadi_3: [29.095, 48.128],
  ahmadi_4: [29.128, 48.135],
  ahmadi_5: [29.082, 48.115],
  ahmadi_6: [29.145, 48.108],
  ahmadi_7: [29.152, 48.085],
  ahmadi_8: [29.202, 48.102],
  // الجهراء
  jahra_1: [29.337, 47.658],
  jahra_2: [29.345, 47.625],
  jahra_3: [29.302, 47.542],
  jahra_4: [29.358, 47.582],
  // مبارك الكبير
  mubarak_1: [29.257, 48.048],
  mubarak_2: [29.275, 48.018],
  mubarak_3: [29.245, 48.072],
  mubarak_4: [29.23, 48.055],
  mubarak_5: [29.292, 48.088],
  mubarak_6: [29.275, 48.032],
  mubarak_7: [29.308, 48.062],
};

/** Coastal areas — bias jitter inland (west) to avoid Gulf water. */
const COASTAL_AREA_IDS = new Set([
  'capital_1',
  'capital_3',
  'hawally_1',
  'hawally_3',
  'hawally_5',
  'hawally_6',
  'ahmadi_1',
  'ahmadi_2',
  'ahmadi_3',
  'ahmadi_4',
  'ahmadi_5',
  'ahmadi_6',
  'ahmadi_8',
  'mubarak_3',
  'mubarak_5',
]);

const KUWAIT_LAND = {
  minLat: 28.53,
  maxLat: 30.08,
  minLng: 46.55,
  maxLng: 48.35,
};

const ALL_AREA_IDS = Object.keys(AREA_CENTROIDS);

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function jitter(): number {
  return (Math.random() - 0.5) * 2;
}

export function randomCoordinateForArea(areaId: string): {
  latitude: number;
  longitude: number;
} {
  const resolvedId =
    AREA_CENTROIDS[areaId] !== undefined
      ? areaId
      : ALL_AREA_IDS[Math.floor(Math.random() * ALL_AREA_IDS.length)];

  const [baseLat, baseLng] = AREA_CENTROIDS[resolvedId];

  const lat = baseLat + jitter() * 0.008;
  let lng = baseLng + jitter() * 0.012;

  if (COASTAL_AREA_IDS.has(resolvedId)) {
    lng -= Math.random() * 0.01;
  }

  return {
    latitude: clamp(lat, KUWAIT_LAND.minLat, KUWAIT_LAND.maxLat),
    longitude: clamp(lng, KUWAIT_LAND.minLng, KUWAIT_LAND.maxLng),
  };
}
