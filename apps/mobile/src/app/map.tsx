import { useCallback, useState } from 'react';
import { View } from 'react-native';

import AddPropertyFAB from '@/features/components/map/AddPropertyFAB';
import DiscoveryMap, {
  MapBounds,
} from '@/features/components/map/DiscoveryMap';
import MapOverlayUI from '@/features/components/map/MapOverlayUI';

export default function MapDashboardScreen() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentBounds, setCurrentBounds] = useState<MapBounds | null>(null);

  // State for the active category pill
  const [activeCategory, setActiveCategory] = useState('بيع');

  const handleBoundsChanged = useCallback((bounds: MapBounds) => {
    setCurrentBounds(bounds);
    console.log('Map moved! Query backend with bounds:', bounds);
  }, []);

  const handleCategoryChange = (category: string) => {
    setActiveCategory(category);
    // In Card 3, changing this will trigger a fresh filter query to the backend
    console.log('Filter switched to:', category);
  };

  return (
    <View className="flex-1 bg-[#F8FAFC]">
      {/* 1. Map Layer (Base) */}
      <DiscoveryMap onBoundsChanged={handleBoundsChanged} />

      {/* 2. Top Header Overlay (Search, Tabs, Dropdowns) */}
      <MapOverlayUI
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        onOpenFilters={() => console.log('Open Detailed Filters Sheet')}
      />

      {/* 3. Bottom Left Overlay (FAB) */}
      <AddPropertyFAB />
    </View>
  );
}
