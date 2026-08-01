import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, View } from 'react-native';

import {
  boundsToParams,
  categoryToMapType,
  mapService,
} from '@/features/individual/services/map.service';
import type { SelectionItem } from '@/shared/components/filters/SelectionDrawer';
import { useDebounce } from '@/shared/hooks/useDebounce';
import AddPropertyFAB from '@/features/individual/components/map/AddPropertyFAB';
import DiscoveryMap, {
  MapBounds,
} from '@/features/individual/components/map/DiscoveryMap';
import { EmptySearchSheet } from '@/features/individual/components/map/EmptySearchSheet';
import { PropertyPreviewCard } from '@/features/individual/components/map/FloatingPreviewCards';
import MapOverlayUI from '@/features/individual/components/map/MapOverlayUI';
import type { MapFeatureProperties } from '@/features/individual/utils/mockGeoJSON';

const EMPTY_GEOJSON: GeoJSON.FeatureCollection<
  GeoJSON.Point,
  MapFeatureProperties
> = {
  type: 'FeatureCollection',
  features: [],
};

export default function MapDashboardScreen() {
  const [currentBounds, setCurrentBounds] = useState<MapBounds | null>(null);
  const [geoJSON, setGeoJSON] =
    useState<GeoJSON.FeatureCollection<GeoJSON.Point, MapFeatureProperties>>(
      EMPTY_GEOJSON,
    );
  const [isLoading, setIsLoading] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const [activeCategory, setActiveCategory] = useState('بيع');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGovernorate, setSelectedGovernorate] =
    useState<SelectionItem | null>(null);
  const [selectedArea, setSelectedArea] = useState<SelectionItem | null>(null);

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

  const handleGovernorateChange = (item: SelectionItem | null) => {
    setSelectedGovernorate(item);
    setSelectedArea(null);
    setSelectedFeature(null);
  };

  const handleAreaChange = (item: SelectionItem | null) => {
    setSelectedArea(item);
    setSelectedFeature(null);
  };

  const handleClearFilters = () => {
    setSearchQuery('');
    setSelectedGovernorate(null);
    setSelectedArea(null);
    setSelectedFeature(null);
  };

  useEffect(() => {
    if (!debouncedBounds) return;

    let cancelled = false;

    const fetchMapData = async () => {
      setIsLoading(true);
      try {
        const response = await mapService.discover({
          ...boundsToParams(debouncedBounds),
          type: categoryToMapType(activeCategory),
          ...(selectedGovernorate?.id
            ? { governorateId: selectedGovernorate.id }
            : {}),
          ...(selectedArea?.id ? { areaId: selectedArea.id } : {}),
          ...(debouncedSearchQuery.trim()
            ? { searchQuery: debouncedSearchQuery.trim() }
            : {}),
        });

        if (!cancelled) {
          setGeoJSON(response);
          setHasFetched(true);
        }
      } catch (error) {
        console.warn('Failed to fetch map data:', error);
        if (!cancelled) {
          setGeoJSON(EMPTY_GEOJSON);
          setHasFetched(true);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    fetchMapData();

    return () => {
      cancelled = true;
    };
  }, [
    debouncedBounds,
    activeCategory,
    selectedGovernorate?.id,
    selectedArea?.id,
    debouncedSearchQuery,
  ]);

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
        selectedGovernorate={selectedGovernorate}
        selectedArea={selectedArea}
        onGovernorateChange={handleGovernorateChange}
        onAreaChange={handleAreaChange}
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
