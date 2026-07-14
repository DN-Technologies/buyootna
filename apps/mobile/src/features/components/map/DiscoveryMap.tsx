import Mapbox, { Camera, MapView } from '@rnmapbox/maps';
import { useCallback, useRef, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import MapLayers from '@/features/components/map/MapLayers';
import type { MapFeatureProperties } from '@/features/utils/mockGeoJSON';

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
  geoJSON: GeoJSON.FeatureCollection<GeoJSON.Point, MapFeatureProperties>;
  onBoundsChanged: (bounds: MapBounds) => void;
  selectedId: string | null;
  onMarkerPress: (feature: any) => void;
}

export default function DiscoveryMap({
  geoJSON,
  onBoundsChanged,
  selectedId,
  onMarkerPress,
}: DiscoveryMapProps) {
  const mapRef = useRef<MapView>(null);
  const [isMapReady, setIsMapReady] = useState(false);

  const emitBounds = useCallback(async () => {
    if (!mapRef.current) return;

    try {
      const bounds = await mapRef.current.getVisibleBounds();
      onBoundsChanged({
        ne: bounds[0],
        sw: bounds[1],
      });
    } catch (error) {
      console.warn('Failed to get map bounds:', error);
    }
  }, [onBoundsChanged]);

  const handleRegionDidChange = async () => {
    if (!isMapReady) return;
    await emitBounds();
  };

  const handleMapReady = async () => {
    setIsMapReady(true);
    await emitBounds();
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
        onDidFinishLoadingMap={handleMapReady}
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

        {/* Render High-Performance Vector Layers */}
        {isMapReady && (
          <MapLayers
            geoJSON={geoJSON}
            selectedId={selectedId}
            onMarkerPress={onMarkerPress}
          />
        )}
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
