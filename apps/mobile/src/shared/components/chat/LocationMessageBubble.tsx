import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { ReactNode } from 'react';
import { Alert, Linking, Platform, Text, TouchableOpacity, View } from 'react-native';

import { ChatLocation } from '@/shared/api/chat.service';
import { MAPBOX_ACCESS_TOKEN } from '@/shared/components/map/picker/config';
import { mapLinks } from '@/shared/utils/chatProposals';

interface LocationMessageBubbleProps {
  location: ChatLocation;
  isMine: boolean;
  timestamp: string;
  quote?: ReactNode;
}

const WIDTH = 260;
const HEIGHT = 150;

/** A static map image of the pin (no live map view inside the list). */
export function staticMapUrl(lat: number, lng: number) {
  const pin = `pin-l+15304d(${lng},${lat})`;
  return `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${pin}/${lng},${lat},15/${WIDTH}x${HEIGHT}@2x?access_token=${MAPBOX_ACCESS_TOKEN}`;
}

/** Opens the pin in Apple Maps / Google Maps. */
export function openInMaps(location: ChatLocation) {
  const links = mapLinks(location.latitude, location.longitude, location.label);
  const open = (url: string) => void Linking.openURL(url);
  if (Platform.OS !== 'ios') {
    open(links.google);
    return;
  }
  Alert.alert('فتح الموقع', location.label ?? undefined, [
    { text: 'خرائط Apple', onPress: () => open(links.apple) },
    { text: 'خرائط Google', onPress: () => open(links.google) },
    { text: 'إلغاء', style: 'cancel' },
  ]);
}

/** 📍 A map pin: preview image + address; tap to open in Maps. */
export default function LocationMessageBubble({
  location,
  isMine,
  timestamp,
  quote,
}: LocationMessageBubbleProps) {
  return (
    <View className={`mb-4 w-full flex-row ${isMine ? 'justify-start' : 'justify-end'}`}>
      <View className={`max-w-[85%] ${isMine ? 'items-start' : 'items-end'}`}>
        {quote}
        <TouchableOpacity
          testID="location-bubble"
          activeOpacity={0.9}
          onPress={() => openInMaps(location)}
          className="overflow-hidden rounded-md border border-[#ECECEC] bg-white"
          style={{ width: WIDTH }}
        >
          <Image
            source={{ uri: staticMapUrl(location.latitude, location.longitude) }}
            style={{ width: WIDTH, height: HEIGHT }}
            className="bg-gray-100"
            contentFit="cover"
          />
          <View className="flex-row items-center gap-2 px-3 py-2.5">
            <Feather name="map-pin" size={16} color="#15304D" />
            <Text
              numberOfLines={2}
              className="flex-1 font-cairo-semibold text-[13px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              {location.label || 'موقع'}
            </Text>
          </View>
        </TouchableOpacity>
        <Text className="mt-1 px-1 font-cairo text-[11px] text-[#94A3B8]">{timestamp}</Text>
      </View>
    </View>
  );
}
