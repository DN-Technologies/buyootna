import { Feather } from '@expo/vector-icons';
import {
  Alert,
  Linking,
  Modal,
  Platform,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import MapView, { Marker, PROVIDER_DEFAULT } from 'react-native-maps';
import { SafeAreaView } from 'react-native-safe-area-context';

interface MapViewModalProps {
  visible: boolean;
  onClose: () => void;
  latitude: number;
  longitude: number;
  title: string;
  address: string;
}

export default function MapViewModal({
  visible,
  onClose,
  latitude,
  longitude,
  title,
  address,
}: MapViewModalProps) {
  const handleOpenInMaps = () => {
    const encodedLabel = encodeURIComponent(title);
    const url = Platform.select({
      ios: `maps:0,0?q=${encodedLabel}@${latitude},${longitude}`,
      android: `geo:${latitude},${longitude}?q=${latitude},${longitude}(${encodedLabel})`,
    });
    if (url) {
      Linking.openURL(url).catch(() => {
        Alert.alert('خطأ', 'تعذر فتح تطبيق الخرائط');
      });
    }
  };

  const initialRegion = {
    latitude,
    longitude,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  };

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 bg-white">
        {/* Map View */}
        <MapView
          provider={PROVIDER_DEFAULT}
          initialRegion={initialRegion}
          className="flex-1"
        >
          <Marker
            coordinate={{ latitude, longitude }}
            title={title}
            description={address}
          />
        </MapView>

        {/* Back Button (Floating top right/left depending on layout, we place on top right in RTL) */}
        <SafeAreaView className="absolute right-4 top-4" edges={['top']}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={onClose}
            className="h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg"
          >
            <Feather name="x" size={24} color="#15304D" />
          </TouchableOpacity>
        </SafeAreaView>

        {/* Bottom Card */}
        <SafeAreaView
          className="absolute bottom-6 left-6 right-6"
          edges={['bottom']}
        >
          <View className="rounded-3xl border border-gray-100 bg-white p-5 shadow-2xl">
            <Text
              className="mb-1 text-right font-cairo-bold text-base text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              {title}
            </Text>

            <View className="mb-5 flex-row items-center justify-end">
              <Text
                className="mr-2 flex-1 text-right font-cairo-medium text-sm text-[#6B6A6A]"
                style={{ writingDirection: 'rtl' }}
              >
                {address}
              </Text>
              <Feather name="map-pin" size={16} color="#15304D" />
            </View>

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleOpenInMaps}
              className="w-full flex-row items-center justify-center rounded-full bg-[#15304D] py-3.5"
            >
              <Text className="mr-2 font-cairo-bold text-sm text-white">
                الفتح في الخرائط
              </Text>
              <Feather name="external-link" size={16} color="white" />
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </View>
    </Modal>
  );
}
