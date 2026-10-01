import { useMemo } from 'react';

import { AREAS, GOVERNORATES } from '@/shared/utils/data/locations';

import { normalizeArabic, splitBlock } from './addressParsing';
import { MAPBOX_ACCESS_TOKEN } from './config';

export interface AreaMatch {
  id: string;
  area: string;
  governorate: string;
  // From "… قطعة N" in the query
  block?: string;
}

const AREA_INDEX = GOVERNORATES.flatMap((gov) =>
  (AREAS[gov.id] ?? []).map((area) => ({
    id: area.id,
    area: area.label,
    governorate: gov.label,
    key: normalizeArabic(area.label),
  })),
);

// Area centres found so far, so picking the same area twice is instant
const centreCache = new Map<string, [number, number]>();

/**
 * Our own list of Kuwait's governorates and areas, matched loosely
 * (spelling variants of alef / taa marbuta / yaa); "السالمية قطعة 5" also
 * carries the block.
 */
export function useAreaSearch(query: string, limit = 4): AreaMatch[] {
  return useMemo(() => {
    const { rest, block } = splitBlock(query);
    const q = normalizeArabic(rest);
    if (q.length < 2) return [];
    const starts = AREA_INDEX.filter((a) => a.key.startsWith(q));
    const contains = AREA_INDEX.filter(
      (a) => !a.key.startsWith(q) && a.key.includes(q),
    );
    return [...starts, ...contains].slice(0, limit).map((a) => ({
      id: a.id,
      area: a.area,
      governorate: a.governorate,
      ...(block ? { block } : {}),
    }));
  }, [query, limit]);
}

/** The area's centre [lng, lat] via Mapbox, or null when it can't be found. */
export async function locateArea(
  match: AreaMatch,
): Promise<[number, number] | null> {
  const cached = centreCache.get(match.id);
  if (cached) return cached;
  const q = encodeURIComponent(`${match.area}، ${match.governorate}، الكويت`);
  const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${q}.json?access_token=${MAPBOX_ACCESS_TOKEN}&country=kw&language=ar&limit=1`;
  try {
    const res = await fetch(url);
    const data = await res.json();
    const centre = data?.features?.[0]?.center as [number, number] | undefined;
    if (!centre) return null;
    centreCache.set(match.id, centre);
    return centre;
  } catch {
    return null;
  }
}
