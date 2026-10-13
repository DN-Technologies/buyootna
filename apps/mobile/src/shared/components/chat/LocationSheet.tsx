import { Feather } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useState } from 'react';
import {
  ActivityIndicator,
  Linking,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { ChatLocation } from '@/shared/api/chat.service';
import { MAPBOX_ACCESS_TOKEN } from '@/shared/components/map/picker/config';
import { RTL_TEXT } from '@/shared/utils/rtlText';

interface LocationSheetProps {
  onClose: () => void;
  onSend: (location: ChatLocation) => void;
  // Where the map starts (the chat's ad, when known)
  initialLat?: number;
  initialLng?: number;
}

/** "السالمية، قطعة 5" for a point (Mapbox, Arabic); null when unknown. */
export async function addressOf(lat: number, lng: number): Promise<string | null> {
  try {
    const res = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${lng},${lat}.json?access_token=${MAPBOX_ACCESS_TOKEN}&language=ar&limit=1`,
    );
    const data = await res.json();
    const place: string | undefined = data?.features?.[0]?.place_name;
    if (!place) return null;
    const parts = place.split(',').map((s) => s.trim());
    return parts.slice(0, 2).join('، ');
  } catch {
    return null;
  }
}

/** 📍 Send my current location, or a point picked on the map. */
export default function LocationSheet({
  onClose,
  onSend,
  initialLat,
  initialLng,
}: LocationSheetProps) {
  const insets = useSafeAreaInsets();
  const [locating, setLocating] = useState(false);
  const [showMap, setShowMap] = useState(false);
  // Shown inside the sheet: the app alert is a second Modal, and on iOS one
  // raised over this sheet never appears and then blocks every touch
  const [problem, setProblem] = useState<'denied' | 'failed' | null>(null);

  const sendCurrent = async () => {
    try {
      setLocating(true);
      setProblem(null);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setProblem('denied');
        return;
      }
      const { coords } = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      const label = await addressOf(coords.latitude, coords.longitude);
      onSend({
        latitude: coords.latitude,
        longitude: coords.longitude,
        label: label ?? 'موقعي الحالي',
      });
    } catch (error) {
      console.error('Current location failed:', error);
      setProblem('failed');
    } finally {
      setLocating(false);
    }
  };

  if (showMap) {
    // Loaded only when opened: it pulls in the native map SDK
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const MapPickerModal = require('@/shared/components/map/MapPickerModal').default;
    return (
      <MapPickerModal
        visible
        onClose={() => setShowMap(false)}
        initialLat={initialLat}
        initialLng={initialLng}
        onConfirm={(label: string, lat: number, lng: number) =>
          onSend({ latitude: lat, longitude: lng, label })
        }
      />
    );
  }

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <Pressable className="flex-1 justify-end bg-black/40" onPress={onClose}>
        <Pressable
          testID="location-sheet"
          className="rounded-t-3xl bg-white px-5 pt-3"
          style={{ paddingBottom: Math.max(insets.bottom, 16) + 8 }}
        >
          <View className="mb-3 h-1 w-10 self-center rounded-full bg-[#CBD5E1]" />
          <Text className="mb-2 font-cairo-bold text-base text-[#111111]" style={RTL_TEXT}>
            إرسال موقع
          </Text>
          <TouchableOpacity
            testID="location-current"
            disabled={locating}
            onPress={sendCurrent}
            className="flex-row items-center gap-3 border-b border-gray-100 py-3.5"
          >
            <View className="h-9 w-9 items-center justify-center rounded-full bg-[#DCFCE7]">
              {locating ? (
                <ActivityIndicator size="small" color="#166534" />
              ) : (
                <Feather name="navigation" size={18} color="#166534" />
              )}
            </View>
            <Text className="font-cairo-semibold text-[15px] text-[#111111]">موقعي الحالي</Text>
          </TouchableOpacity>
          <TouchableOpacity
            testID="location-map"
            disabled={locating}
            onPress={() => setShowMap(true)}
            className="flex-row items-center gap-3 py-3.5"
          >
            <View className="h-9 w-9 items-center justify-center rounded-full bg-[#E0E7FF]">
              <Feather name="map" size={18} color="#3730A3" />
            </View>
            <Text className="font-cairo-semibold text-[15px] text-[#111111]">اختر على الخريطة</Text>
          </TouchableOpacity>
          {problem && (
            <View testID="location-problem" className="mt-2 rounded-2xl bg-[#FEF2F2] px-4 py-3">
              <Text className="font-cairo-medium text-[13px] text-[#B91C1C]" style={RTL_TEXT}>
                {problem === 'denied'
                  ? 'صلاحية الوصول للموقع غير مفعّلة. فعّلها من الإعدادات أو اختر الموقع على الخريطة.'
                  : 'تعذر تحديد موقعك، حاول مرة أخرى أو اختر الموقع على الخريطة.'}
              </Text>
              {problem === 'denied' && (
                <TouchableOpacity
                  testID="location-open-settings"
                  onPress={() => void Linking.openSettings()}
                  className="mt-2 self-start"
                >
                  <Text className="font-cairo-bold text-[13px] text-[#15304D]">فتح الإعدادات</Text>
                </TouchableOpacity>
              )}
            </View>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
