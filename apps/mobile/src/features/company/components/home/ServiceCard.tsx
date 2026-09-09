import { Text, TouchableOpacity, View } from 'react-native';

import type { CompanyServiceItemData } from '@/shared/components/company/CompanyServicesTab';

const CARD_WIDTH = 204;

interface ServiceCardProps {
  service: CompanyServiceItemData;
  onPress?: () => void;
}

export default function ServiceCard({ service, onPress }: ServiceCardProps) {
  return (
    <View
      style={{ width: CARD_WIDTH }}
      className="rounded-md border border-[#ECECEC] bg-white pb-2 pt-4"
    >
      <View className="gap-4 px-4">
        <View className="items-end gap-2">
          <Text
            className="font-cairo-semibold text-[14px] leading-[21px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
            numberOfLines={1}
          >
            {service.title}
          </Text>
          <Text
            className="text-right font-cairo-medium text-[12px] leading-[17px] text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {service.description}
          </Text>
        </View>
        <View className="flex-row items-center justify-end">
          <TouchableOpacity activeOpacity={0.7} onPress={onPress}>
            <Text className="font-cairo-semibold text-[14px] leading-[21px] text-[#15304D]">
              إدارة الخدمة
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
