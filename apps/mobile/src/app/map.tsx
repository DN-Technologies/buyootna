import { useCallback, useState } from 'react';
import { View } from 'react-native';

import DiscoveryMap, {
  MapBounds,
} from '@/features/components/map/DiscoveryMap';

export default function MapDashboardScreen() {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [currentBounds, setCurrentBounds] = useState<MapBounds | null>(null);

  // Callback to handle map movements
  const handleBoundsChanged = useCallback((bounds: MapBounds) => {
    setCurrentBounds(bounds);

    // In Card 3, we will trigger our API call here:
    // fetchPropertiesInBounds(bounds.sw, bounds.ne);
    console.log('Map moved! New bounds to query:', bounds);
  }, []);

  return (
    // Note: We don't use SafeAreaView for the Map wrapper so it bleeds beautifully under the notch
    <View className="flex-1 bg-white">
      {/* 
        This is where our floating UI (Search bar, Pills, Dropdowns) will go in Card 2 
        It will be position: 'absolute' layered over the map 
      */}

      {/* The Core Mapbox Map */}
      <DiscoveryMap onBoundsChanged={handleBoundsChanged} />
    </View>
  );
}
