import Mapbox, { Camera, MapView } from '@rnmapbox/maps';
import { useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

// Initialize Mapbox with PUBLIC token
Mapbox.setAccessToken(
  'pk.eyJ1IjoiY29uc3R5b3Vzc2VmIiwiYSI6ImNtcmh2dTZ3azFrNzczMHNldzNyc2hia3gifQ.VteDtFkHHKEsyVL004WSkQ',
);

// Kuwait Coordinates (Longitude, Latitude)
const INITIAL_COORDINATES = [47.9774, 29.3759];

export interface MapBounds {
  ne: number[]; // North East [lnt, lat]
  sw: number[]; // South West [lnt, lat]
}

interface DiscoveryMapProps {
  onBoundsChanged: (bounds: MapBounds) => void;
}

export default function DiscoveryMap({ onBoundsChanged }: DiscoveryMapProps) {
  const mapRef = useRef<MapView>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  // Triggered whenver the user finishes moving/zooming the map
  const handleRegionDidChange = async () => {
    if (!mapRef.current || !isMapReady) return;

    try {
      // Extract the visible bounding box to pass to the backend for data fetching
      const bounds = await mapRef.current.getVisibleBounds();
      onBoundsChanged({
        ne: bounds[0], // Top Right corner
        sw: bounds[1], // Bottom Left corner
      });
    } catch (error) {
      console.warn('Failed to get map bounds:', error);
    }
  };

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        // Replace with your custom Mapbox Studio Style URL to match the Figma UI
        styleURL="mapbox://styles/mapbox/light-v11"
        logoEnabled={false} // Clean UI requirement
        compassEnabled={false}
        attributionEnabled={false}
        onDidFinishLoadingMap={() => setIsMapReady(true)}
        onRegionDidChange={handleRegionDidChange}
      >
        <Camera
          zoomLevel={11}
          minZoomLevel={8} // Prevent zooming out to see the whole world
          maxZoomLevel={18} // Prevent zooming into street level
          centerCoordinate={INITIAL_COORDINATES}
          animationMode="flyTo"
          animationDuration={2000}
        />

        {/* We will add ShapeSource and SymbolLayers here in Card 3 */}
      </MapView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC', // Match the ocean/background color of the map
  },
  map: {
    flex: 1,
  },
});
