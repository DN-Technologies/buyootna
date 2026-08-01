import { Feather } from '@expo/vector-icons';
import Mapbox, { Camera, MapView, PointAnnotation } from '@rnmapbox/maps';
import {
  Alert,
  ImageBackground,
  Linking,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

// Initialize Mapbox with public access token
Mapbox.setAccessToken(
  process.env.EXPO_PUBLIC_MAPBOX_ACCESS_TOKEN ||
    'pk.eyJ1IjoiY29uc3R5b3Vzc2VmIiwiYSI6ImNtcmh2dTZ3azFrNzczMHNldzNyc2hia3gifQ.VteDtFkHHKEsyVL004WSkQ',
);

export interface MapPreviewProps {
  location: string;
  latitude?: number | null;
  longitude?: number | null;
  onPress?: () => void;
}

export default function MapPreview({
  location,
  latitude,
  longitude,
  onPress,
}: MapPreviewProps) {
  const hasCoords =
    typeof latitude === 'number' && typeof longitude === 'number';

  const handlePress = () => {
    if (onPress) {
      onPress();
      return;
    }

    if (hasCoords) {
      const latLng = `${latitude},${longitude}`;
      const label = encodeURIComponent(location);
      const url = Platform.select({
        ios: `maps://?q=${label}&ll=${latLng}`,
        android: `geo:0,0?q=${latLng}(${label})`,
      });

      if (url) {
        Linking.openURL(url).catch(() => {
          Alert.alert('خطأ', 'تعذر فتح تطبيق الخرائط');
        });
      }
    }
  };

  return (
    <View className="mb-6 px-5">
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        className="h-[160px] w-full items-center justify-center overflow-hidden rounded-3xl border border-gray-200 bg-gray-50"
      >
        {hasCoords ? (
          <View pointerEvents="none" className="absolute inset-0">
            <MapView
              style={StyleSheet.absoluteFillObject}
              styleURL="mapbox://styles/mapbox/light-v11"
              logoEnabled={false}
              compassEnabled={false}
              attributionEnabled={false}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
            >
              <Camera
                zoomLevel={13.5}
                centerCoordinate={[longitude!, latitude!]}
                animationMode="none"
              />
              <PointAnnotation
                id="property-pin"
                coordinate={[longitude!, latitude!]}
              >
                <View style={styles.pinContainer}>
                  <Feather name="home" size={16} color="#FFFFFF" />
                </View>
              </PointAnnotation>
            </MapView>
          </View>
        ) : (
          /* Static Map Background Image Fallback */
          <ImageBackground
            source={{
              uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
            }}
            style={StyleSheet.absoluteFillObject}
            blurRadius={1.5}
          />
        )}

        {/* Center Overlay Pill */}
        <View className="flex-row items-center rounded-full bg-white/95 px-5 py-2.5">
          <Text className="mr-2 font-cairo-bold text-sm text-[#15304D]">
            الموقع على الخريطة
          </Text>
          <Feather name="map-pin" size={16} color="#15304D" />
        </View>

        {/* Expand Icon - Bottom Left */}
        <View className="absolute bottom-3 left-3 h-8 w-8 items-center justify-center rounded-xl bg-[#15304D] shadow-sm">
          <Feather name="maximize-2" size={16} color="#fff" />
        </View>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  pinContainer: {
    height: 36,
    width: 36,
    borderRadius: 18,
    backgroundColor: '#15304D',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
});
