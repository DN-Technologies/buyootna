import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface LocationConfirmCardProps {
  addressLabel: string;
  centerCoords: [number, number]; // [lng, lat]
  isLoadingAddress: boolean;
  onConfirm: () => void;
}

export function LocationConfirmCard({
  addressLabel,
  centerCoords,
  isLoadingAddress,
  onConfirm,
}: LocationConfirmCardProps) {
  const insets = useSafeAreaInsets();
  return (
    <View
      className="absolute left-5 right-5"
      style={{ bottom: Math.max(insets.bottom, 12) + 8 }}
    >
      <View className="rounded-3xl border border-gray-100 bg-white p-5 shadow-2xl">
        {/* Card Header */}
        <View className="mb-3 flex-row items-center justify-between">
          <Text
            className="font-cairo-bold text-base text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            موقع العقار المحدد
          </Text>
          <View className="flex-row items-center gap-1 rounded-full bg-blue-50 px-2.5 py-0.5">
            <Feather name="check-circle" size={12} color="#15304D" />
            <Text className="font-cairo-medium text-xs text-[#15304D]">
              Mapbox GPS
            </Text>
          </View>
        </View>

        {/* Address Display Box */}
        <View className="mb-4 min-h-[54px] flex-row items-center justify-between rounded-2xl border border-gray-100 bg-gray-50 p-3.5">
          <Feather name="map-pin" size={18} color="#15304D" className="mr-2" />
          {isLoadingAddress ? (
            <View className="flex-1 flex-row items-center">
              <Text className="mr-2 font-cairo text-xs text-gray-500">
                جاري جلب تفاصيل الموقع...
              </Text>
              <ActivityIndicator size="small" color="#15304D" />
            </View>
          ) : (
            <View className="flex-1">
              <Text
                className="font-cairo-semibold text-sm text-[#111111]"
                style={{ writingDirection: 'rtl' }}
                numberOfLines={2}
              >
                {addressLabel}
              </Text>
              <Text className="mt-0.5 text-right font-cairo text-[10px] text-gray-400">
                {centerCoords[1].toFixed(5)}°N, {centerCoords[0].toFixed(5)}°E
              </Text>
            </View>
          )}
        </View>

        {/* Confirm Location Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onConfirm}
          disabled={isLoadingAddress}
          className={`w-full items-center justify-center rounded-2xl py-4 shadow-lg ${
            isLoadingAddress ? 'bg-[#15304D]/60' : 'bg-[#15304D]'
          }`}
        >
          <Text className="font-cairo-bold text-base text-white">
            تأكيد موقع العقار
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
