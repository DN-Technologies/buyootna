import { useQuery } from '@tanstack/react-query';
import { useCallback, useRef, useState } from 'react';
import { Animated, View } from 'react-native';

import AddPropertyFAB from '@/features/individual/components/map/AddPropertyFAB';
import DiscoveryMap, {
  MapBounds,
} from '@/features/individual/components/map/DiscoveryMap';
import { EmptySearchSheet } from '@/features/individual/components/map/EmptySearchSheet';
import { PropertyPreviewCard } from '@/features/individual/components/map/FloatingPreviewCards';
import MapOverlayUI from '@/features/individual/components/map/MapOverlayUI';
import {
  boundsToParams,
  categoryToMapType,
  MapDiscoverResponse,
  mapService,
} from '@/features/individual/services/map.service';
import type { MapFeatureProperties } from '@/features/individual/utils/mockGeoJSON';
import type { SelectionItem } from '@/shared/components/filters/SelectionDrawer';
import { useDebounce } from '@/shared/hooks/useDebounce';
import { AREAS } from '@/shared/utils/data/locations';

const EMPTY_GEOJSON: GeoJSON.FeatureCollection<
  GeoJSON.Point,
  MapFeatureProperties
> = {
  type: 'FeatureCollection',
  features: [],
};

export default function MapDashboardScreen() {
  const [currentBounds, setCurrentBounds] = useState<MapBounds | null>(null);

  const [activeCategory, setActiveCategory] = useState('بيع');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGovernorates, setSelectedGovernorates] = useState<
    SelectionItem[]
  >([]);
  const [selectedAreas, setSelectedAreas] = useState<SelectionItem[]>([]);

  const [selectedFeature, setSelectedFeature] = useState<any | null>(null);

  const slideAnim = useRef(new Animated.Value(200)).current;

  const debouncedBounds = useDebounce(currentBounds, 400);
  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  const handleBoundsChanged = useCallback((bounds: MapBounds) => {
    setCurrentBounds(bounds);
  }, []);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    setSelectedFeature(null);
  };

  const handleGovernoratesChange = (items: SelectionItem[]) => {
    setSelectedGovernorates(items);
    // Keep only the areas that still belong to a chosen governorate
    const allowed = new Set(
      items.flatMap((gov) => (AREAS[gov.id] ?? []).map((area) => area.id)),
    );
    setSelectedAreas((areas) =>
      items.length ? areas.filter((area) => allowed.has(area.id)) : areas,
    );
    setSelectedFeature(null);
  };

  const handleAreasChange = (items: SelectionItem[]) => {
    setSelectedAreas(items);
    setSelectedFeature(null);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedGovernorates([]);
    setSelectedAreas([]);
    setSelectedFeature(null);
  };

  const {
    data: geoJSON = EMPTY_GEOJSON,
    isFetching: isLoading,
    isFetched: hasFetched,
  } = useQuery<MapDiscoverResponse>({
    queryKey: [
      'mapDiscover',
      debouncedBounds,
      activeCategory,
      selectedGovernorates.map((g) => g.id).join(','),
      selectedAreas.map((a) => a.id).join(','),
      debouncedSearchQuery,
    ],
    queryFn: async () => {
      try {
        return await mapService.discover({
          ...boundsToParams(debouncedBounds!),
          type: categoryToMapType(activeCategory),
          ...(selectedGovernorates.length
            ? { governorateIds: selectedGovernorates.map((g) => g.id).join(',') }
            : {}),
          ...(selectedAreas.length
            ? { areaIds: selectedAreas.map((a) => a.id).join(',') }
            : {}),
          ...(debouncedSearchQuery.trim()
            ? { searchQuery: debouncedSearchQuery.trim() }
            : {}),
        });
      } catch (error) {
        console.warn('Failed to fetch map data:', error);
        return EMPTY_GEOJSON;
      }
    },
    enabled: !!debouncedBounds,
  });

  const handleMarkerPress = useCallback(
    (feature: any) => {
      setSelectedFeature(feature);

      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 50,
        friction: 8,
      }).start();
    },
    [slideAnim],
  );

  const handleCloseCard = useCallback(() => {
    Animated.timing(slideAnim, {
      toValue: 200,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSelectedFeature(null);
    });
  }, [slideAnim]);

  const showEmptySheet =
    hasFetched &&
    !isLoading &&
    geoJSON.features.length === 0 &&
    !selectedFeature;

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      <DiscoveryMap
        geoJSON={geoJSON}
        onBoundsChanged={handleBoundsChanged}
        selectedId={selectedFeature?.properties?.id || null}
        onMarkerPress={handleMarkerPress}
      />

      <MapOverlayUI
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        searchQuery={searchQuery}
        onSearchQueryChange={setSearchQuery}
        selectedGovernorates={selectedGovernorates}
        selectedAreas={selectedAreas}
        onGovernoratesChange={handleGovernoratesChange}
        onAreasChange={handleAreasChange}
        onOpenFilters={() => console.log('Open Detailed Filters Sheet')}
      />

      {!selectedFeature && (
        <View pointerEvents="box-none" className="absolute inset-0 z-10">
          <AddPropertyFAB />
          {/* <MapListToggle /> */}
        </View>
      )}

      <Animated.View
        pointerEvents="box-none"
        className="absolute bottom-[30px] left-0 right-0 z-20"
        style={{ transform: [{ translateY: selectedFeature ? slideAnim : 0 }] }}
      >
        {selectedFeature ? (
          <PropertyPreviewCard
            property={selectedFeature.properties}
            onClose={handleCloseCard}
          />
        ) : showEmptySheet ? (
          <EmptySearchSheet
            activeCategory={activeCategory}
            onModifyFilters={handleClearFilters}
            onShowAll={handleClearFilters}
          />
        ) : null}
      </Animated.View>
    </View>
  );
}
