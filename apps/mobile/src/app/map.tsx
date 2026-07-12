import { useCallback, useRef, useState } from 'react';
import { Animated, View } from 'react-native';

import AddPropertyFAB from '@/features/components/map/AddPropertyFAB';
import DiscoveryMap, {
  MapBounds,
} from '@/features/components/map/DiscoveryMap';
import { EmptySearchSheet } from '@/features/components/map/EmptySearchSheet';
import { PropertyPreviewCard } from '@/features/components/map/FloatingPreviewCards';
import { MapListToggle } from '@/features/components/map/MapListToggle';
import MapOverlayUI from '@/features/components/map/MapOverlayUI';

export default function MapDashboardScreen() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentBounds, setCurrentBounds] = useState<MapBounds | null>(null);

  // State for the active category pill
  const [activeCategory, setActiveCategory] = useState('بيع');

  // State for the selected map feature
  const [selectedFeature, setSelectedFeature] = useState<any | null>(null);

  // Simulated search results count state to test empty search sheet
  const [searchResultsCount, setSearchResultsCount] = useState<number>(0);

  // Animation value for the bottom preview card
  const slideAnim = useRef(new Animated.Value(200)).current;

  const handleBoundsChanged = useCallback((bounds: MapBounds) => {
    setCurrentBounds(bounds);
    console.log('Map moved! Query backend with bounds:', bounds);
  }, []);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    // Simulate empty results when changing categories for testing
    setSearchResultsCount(0);
    console.log('Filter switched to:', category);
  };

  const handleMarkerPress = useCallback(
    (feature: any) => {
      setSelectedFeature(feature);
      console.log('Marker clicked! ID:', feature.properties?.id);

      // Slide the card up smoothly
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
    // Slide the card back down
    Animated.timing(slideAnim, {
      toValue: 200,
      duration: 200,
      useNativeDriver: true,
    }).start(() => {
      setSelectedFeature(null);
    });
  }, [slideAnim]);

  const handleClearFilters = () => {
    // Reset filters and refetch data
    console.log('Filters cleared, showing broader results');
    setSearchResultsCount(120);
  };

  const handleShowAll = () => {
    // Zoom map out to full country bounds and refetch
    console.log('Zooming out to show all properties');
    setSearchResultsCount(450);
  };

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* 1. Map Layer (Base) */}
      <DiscoveryMap
        onBoundsChanged={handleBoundsChanged}
        selectedId={selectedFeature?.properties?.id || null}
        onMarkerPress={handleMarkerPress}
      />

      {/* 2. Top Header Overlay (Search, Tabs, Dropdowns) */}
      <MapOverlayUI
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        onOpenFilters={() => console.log('Open Detailed Filters Sheet')}
      />

      {/* 3. Floating Action Buttons (Hidden if a preview card is open) */}
      {!selectedFeature && (
        <View pointerEvents="box-none" className="absolute inset-0 z-10">
          <AddPropertyFAB />
          <MapListToggle />
        </View>
      )}

      {/* 4. Bottom Context Area (Preview Card OR Empty State) */}
      <Animated.View
        pointerEvents="box-none"
        className="absolute bottom-[90px] left-0 right-0 z-20"
        style={{ transform: [{ translateY: selectedFeature ? slideAnim : 0 }] }}
      >
        {selectedFeature ? (
          // Show the property details if a marker is tapped
          <PropertyPreviewCard
            property={selectedFeature.properties}
            onClose={handleCloseCard}
          />
        ) : searchResultsCount === 0 ? (
          // Show the Empty Search Sheet if no properties are in the current viewport
          <EmptySearchSheet
            activeCategory={activeCategory}
            onModifyFilters={handleClearFilters}
            onShowAll={handleShowAll}
          />
        ) : null}
      </Animated.View>
    </View>
  );
}
