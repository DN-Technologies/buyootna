import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

interface PropertyMapFieldProps {
  mapLocation: string | null;
  mapLocationLabel: string | null;
  onPress: () => void;
  onClear: () => void;
}

export default function PropertyMapField({
  mapLocation,
  mapLocationLabel,
  onPress,
  onClear,
}: PropertyMapFieldProps) {
  const hasLocation = !!(mapLocationLabel || mapLocation);

  return (
    <View className="mb-6 w-full">
      <Text
        className="mb-2 font-cairo-semibold text-sm text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        الموقع على الخريطة <Text className="text-red-500">*</Text>
      </Text>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        className="h-12 flex-row items-center justify-between rounded-xl border border-[#ECECEC] bg-white px-4"
      >
        {/* Location Text */}
        <Text
          className={`flex-1 font-cairo text-[14px] ${hasLocation ? 'text-[#111111]' : 'text-[#94A3B8]'}`}
          style={{ writingDirection: 'rtl' }}
          numberOfLines={1}
        >
          {mapLocationLabel || mapLocation || 'حدد الموقع على الخريطة'}
        </Text>

        {/* Map Icon or Clear Button */}
        {hasLocation ? (
          <TouchableOpacity onPress={onClear} className="p-1">
            <Feather name="x-circle" size={18} color="#94A3B8" />
          </TouchableOpacity>
        ) : (
          <View className="p-1">
            <Feather name="map-pin" size={18} color="#15304D" />
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}
