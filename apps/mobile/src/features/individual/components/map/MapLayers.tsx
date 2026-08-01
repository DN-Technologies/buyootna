import {
  CircleLayer,
  Images,
  ShapeSource,
  SymbolLayer,
} from '@rnmapbox/maps';

import type { MapFeatureProperties } from '@/features/individual/utils/mockGeoJSON';

interface MapLayersProps {
  geoJSON: GeoJSON.FeatureCollection<GeoJSON.Point, MapFeatureProperties>;
  selectedId: string | null;
  onMarkerPress: (feature: any) => void;
}

export default function MapLayers({
  geoJSON,
  selectedId,
  onMarkerPress,
}: MapLayersProps) {

  const handlePress = (event: any) => {
    const feature = event.features[0];
    if (feature && feature.properties) {
      onMarkerPress(feature);
    }
  };

  return (
    <>
      {/* 1. Load Custom Marker Images into the Mapbox Engine */}
      <Images
        images={
          {
            // 'exchange-icon': exchangeIcon,
            // 'company-base': defaultCompanyIcon,
            // 'pill-bg': pillBg,
          }
        }
      />

      {/* 2. ShapeSource: The Data Engine */}
      <ShapeSource
        id="propertiesSource"
        shape={geoJSON}
        cluster={true}
        clusterRadius={50} // Distance in pixels to group points
        clusterMaxZoomLevel={14} // Stop clustering when zoomed in close
        onPress={handlePress} // Listen for taps on markers
      >
        {/* --- LAYER A: Dark Blue Clusters (18+, 801) --- */}
        <CircleLayer
          id="clusteredPoints"
          filter={['has', 'point_count']} // Only apply to cluster nodes
          style={{
            circleColor: '#15304D',
            circleRadius: [
              'step',
              ['get', 'point_count'],
              20, // base size
              100, // if point_count >= 100
              30, // size becomes 30
            ],
            circleStrokeWidth: 2,
            circleStrokeColor: '#FFFFFF',
          }}
        />
        <SymbolLayer
          id="clusterCount"
          filter={['has', 'point_count']}
          style={{
            // Mapbox expression: append '+' if cluster count is large, else just show number
            textField: [
              'format',
              ['get', 'point_count_abbreviated'],
              {},
              '+',
              {},
            ],
            textSize: 12,
            textColor: '#FFFFFF',
            textFont: ['Cairo Bold', 'Arial Unicode MS Bold'], // Ensure your custom font is loaded in Mapbox
          }}
        />

        {/* --- LAYER B: Sell / Rent (White Price Pills) --- */}
        <SymbolLayer
          id="unclusteredSellRent"
          filter={[
            'all',
            ['!', ['has', 'point_count']],
            ['in', ['get', 'type'], ['literal', ['sell', 'rent']]],
          ]}
          style={{
            textField: ['get', 'priceLabel'],
            textSize: 12,
            // Dynamic text color based on selection state
            textColor: [
              'case',
              ['==', ['get', 'id'], selectedId || ''],
              '#FFFFFF', // White text when selected
              '#15304D', // Default dark text
            ],
            // Dynamic halo/background color based on selection state
            textHaloColor: [
              'case',
              ['==', ['get', 'id'], selectedId || ''],
              '#D4AF37', // Gold for active
              '#FFFFFF', // White for default
            ],
            textHaloWidth: 3,
            iconImage: 'pill-bg', // Optional: Use a 9-slice stretchable background image for perfect pill shapes
            iconAllowOverlap: true,
          }}
        />

        {/* --- LAYER C: Exchange (بدل Icon) --- */}
        <SymbolLayer
          id="unclusteredExchange"
          filter={[
            'all',
            ['!', ['has', 'point_count']],
            ['==', ['get', 'type'], 'exchange'],
          ]}
          style={{
            iconImage: 'exchange-icon',
            iconSize: 1,
            iconAllowOverlap: true,
          }}
        />

        {/* --- LAYER D: Companies (Circular Logo & Rating) --- */}
        <SymbolLayer
          id="unclusteredCompanies"
          filter={[
            'all',
            ['!', ['has', 'point_count']],
            ['==', ['get', 'type'], 'company'],
          ]}
          style={{
            iconImage: 'company-base', // Dynamic resolution logic can be applied here based on ['get', 'logoId']
            iconSize: 1,
            textField: ['get', 'rating'],
            textSize: 10,
            textColor: [
              'case',
              ['==', ['get', 'id'], selectedId || ''],
              '#FFFFFF', // White text when selected
              '#15304D', // Default dark text
            ],
            textOffset: [0, 1.5], // Push the rating text below the circular company logo
            textHaloColor: [
              'case',
              ['==', ['get', 'id'], selectedId || ''],
              '#D4AF37', // Gold for active
              '#FFFFFF', // White for default
            ],
            textHaloWidth: 2,
          }}
        />
      </ShapeSource>
    </>
  );
}
