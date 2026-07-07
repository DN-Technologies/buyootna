import { Feather } from '@expo/vector-icons';
import {
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';

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

  return (
    <View className="mb-6 px-5">
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={onPress}
        className="h-[160px] w-full items-center justify-center overflow-hidden rounded-3xl border border-gray-200 bg-gray-50"
      >
        {hasCoords ? (
          <View pointerEvents="none" className="absolute inset-0">
            <MapView
              provider={PROVIDER_DEFAULT}
              initialRegion={{
                latitude: latitude!,
                longitude: longitude!,
                latitudeDelta: 0.015,
                longitudeDelta: 0.015,
              }}
              scrollEnabled={false}
              zoomEnabled={false}
              rotateEnabled={false}
              pitchEnabled={false}
              style={StyleSheet.absoluteFillObject}
            >
              <Marker
                coordinate={{ latitude: latitude!, longitude: longitude! }}
              />
            </MapView>
          </View>
        ) : (
          /* Static Map Background Image Fallback */
          <ImageBackground
            source={{
              uri: 'https://images.unsplash.com/photo-1524661135-423995f22d0b?auto=format&fit=crop&w=800&q=80',
            }} // Using a top-down city placeholder
            style={StyleSheet.absoluteFillObject}
            blurRadius={1.5}
          />
        )}

        {/* Center Overlay Pill */}
        <View className="flex-row items-center rounded-full bg-white/95 px-5 py-2.5 shadow-sm">
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
