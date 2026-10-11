import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import RequirementMark from '@/shared/components/ui/RequirementMark';

export interface RequestQuoteAddressFieldProps {
  addressLabel: string;
  onPress: () => void;
}

export default function RequestQuoteAddressField({
  addressLabel,
  onPress,
}: RequestQuoteAddressFieldProps) {
  return (
    <View className="mb-6 w-full">
      <Text
        className="mb-2 font-cairo-medium text-sm text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        العنوان
        <RequirementMark required />
      </Text>
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPress}
        className="h-12 flex-row items-center justify-between rounded-xl border border-gray-200 bg-white px-4"
      >
        <Text
          numberOfLines={1}
          className={`flex-1 leading-[22px] font-cairo text-[13px] ${
            addressLabel ? 'text-[#111111]' : 'text-[#979797]'
          }`}
          style={{ writingDirection: 'rtl' }}
        >
          {addressLabel || 'حدد عنوانك على الخريطة'}
        </Text>
        <Feather name="map-pin" size={18} color="#15304D" />
      </TouchableOpacity>
    </View>
  );
}
