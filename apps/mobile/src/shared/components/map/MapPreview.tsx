import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useState } from 'react';
import {
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native';

import { MAPBOX_ACCESS_TOKEN } from '@/shared/components/map/picker/config';
import { showAlert } from '@/shared/utils/alert';
import { openUrlThrottled } from '@/shared/utils/openUrl';

// The preview can't be panned or zoomed (a tap opens the maps app), so it's
// a static Mapbox image rather than a live map: a live map fetched its tiles
// again on every visit to an ad, while the image is cached in memory and on
// disk and shows straight away on the next visit.
const PREVIEW_HEIGHT = 160;
// The card's side padding (px-5 on each side)
const PREVIEW_SIDE_PADDING = 40;
const PREVIEW_ZOOM = 13.5;

/** Static map of the area around a point, sized for the card. */
export function staticMapUrl(
  latitude: number,
  longitude: number,
  width: number,
): string {
  // Rounded so tiny float noise doesn't miss the cache (5 dp is about 1 m)
  const lng = longitude.toFixed(5);
  const lat = latitude.toFixed(5);
  // The Static Images API caps each side at 1280
  const w = Math.min(Math.max(Math.round(width), 100), 1280);
  return (
    'https://api.mapbox.com/styles/v1/mapbox/light-v11/static/' +
    `pin-s+15304d(${lng},${lat})/${lng},${lat},${PREVIEW_ZOOM},0/` +
    `${w}x${PREVIEW_HEIGHT}@2x` +
    `?attribution=false&logo=false&access_token=${MAPBOX_ACCESS_TOKEN}`
  );
}

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
  const { width: screenWidth } = useWindowDimensions();
  // Offline or a failed request: show the generic picture instead
  const [mapFailed, setMapFailed] = useState(false);

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
        openUrlThrottled(url).catch(() => {
          showAlert('خطأ', 'تعذر فتح تطبيق الخرائط');
        });
      }
    }
  };

  return (
    <View className="px-5">
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={handlePress}
        className="h-[160px] w-full items-center justify-center overflow-hidden rounded-3xl border border-gray-200 bg-gray-50"
      >
        {hasCoords && !mapFailed ? (
          <Image
            testID="map-preview-image"
            source={{
              uri: staticMapUrl(
                latitude!,
                longitude!,
                screenWidth - PREVIEW_SIDE_PADDING,
              ),
            }}
            style={StyleSheet.absoluteFillObject}
            contentFit="cover"
            cachePolicy="memory-disk"
            transition={150}
            onError={() => setMapFailed(true)}
          />
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
