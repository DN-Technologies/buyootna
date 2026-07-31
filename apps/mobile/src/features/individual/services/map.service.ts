import apiClient from '@/shared/api/api';
import type { MapFeatureProperties } from '@/features/individual/utils/mockGeoJSON';

export type MapPinType = 'sell' | 'rent' | 'exchange' | 'company';

export interface MapBoundsInput {
  ne: number[];
  sw: number[];
}

export interface MapDiscoverParams {
  ne_lat: number;
  ne_lng: number;
  sw_lat: number;
  sw_lng: number;
  type?: MapPinType;
  governorateId?: string;
  areaId?: string;
  searchQuery?: string;
}

export type MapDiscoverResponse = GeoJSON.FeatureCollection<
  GeoJSON.Point,
  MapFeatureProperties
>;

export function boundsToParams(bounds: MapBoundsInput): Pick<
  MapDiscoverParams,
  'ne_lat' | 'ne_lng' | 'sw_lat' | 'sw_lng'
> {
  return {
    ne_lng: bounds.ne[0],
    ne_lat: bounds.ne[1],
    sw_lng: bounds.sw[0],
    sw_lat: bounds.sw[1],
  };
}

const CATEGORY_TO_TYPE: Record<string, MapPinType> = {
  بيع: 'sell',
  ايجار: 'rent',
  بدل: 'exchange',
  شركات: 'company',
};

export function categoryToMapType(category: string): MapPinType {
  return CATEGORY_TO_TYPE[category] ?? 'sell';
}

export const mapService = {
  discover: async (params: MapDiscoverParams): Promise<MapDiscoverResponse> => {
    const response = await apiClient.get<MapDiscoverResponse>('/map/discover', {
      params,
    });
    return response.data;
  },
};
