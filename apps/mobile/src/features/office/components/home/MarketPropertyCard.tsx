import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { AreaIcon, LocationIcon } from '@/assets/icons/home/property';
import SafeLinearGradient from '@/shared/components/ui/SafeLinearGradient';
import { formatNumber } from '@/shared/utils/formatNumber';

import { MarketProperty } from '../../types';

interface MarketPropertyCardProps {
  property: MarketProperty;
  onPress?: () => void;
}

export default function MarketPropertyCard({
  property,
  onPress,
}: MarketPropertyCardProps) {
  const isExchange = property.exchangeRequirements !== undefined;
  const formattedPrice =
    typeof property.price === 'number'
      ? formatNumber(property.price)
      : property.price;

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={onPress}
      className="w-[247px] justify-between rounded-[6px] border border-[#ECECEC] bg-[#FEFEFE] p-3 shadow-sm"
      accessibilityRole="button"
      accessibilityLabel={property.title}
    >
      <View>
        {/* Header: Title & Optional Featured Tag */}
        <View className="flex-row items-center justify-between pb-2">
          {property.isFeatured ? (
            <SafeLinearGradient
              colors={['#FF8D28', '#FACC15']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              className="items-center justify-center rounded-br-[10px] rounded-tl-[4px] rounded-tr-[10px] px-2.5 py-0.5"
            >
              <Text
                className="font-cairo text-[11px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                مميز
              </Text>
            </SafeLinearGradient>
          ) : (
            <View />
          )}

          <Text
            className="font-cairo-semibold text-[14px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            {property.title}
          </Text>
        </View>

        {/* Price Row */}
        <View className="items-end pb-2">
          {property.price === 'السعر غير معلن' ? (
            <Text
              className="font-cairo-semibold text-[16px] text-[#15304D]"
              style={{ writingDirection: 'rtl' }}
            >
              السعر غير معلن
            </Text>
          ) : (
            <View className="flex-row items-baseline justify-end gap-1">
              <Text
                className="font-cairo-semibold text-[22px] leading-[26px] text-[#15304D]"
                style={{ writingDirection: 'rtl' }}
              >
                {formattedPrice}
              </Text>
              <Text
                className="font-cairo-bold text-[12px] text-[#15304D]"
                style={{ writingDirection: 'rtl' }}
              >
                {property.currency || 'د.ك'}
              </Text>
            </View>
          )}
        </View>

        {/* Exchange requirements if applicable */}
        {isExchange && property.exchangeRequirements && (
          <View className="mb-2 flex-row items-center justify-end gap-2">
            <View className="flex-row items-center gap-1">
              <Text
                className="font-cairo-medium text-[13px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                {property.exchangeRequirements.target}
              </Text>
              <Feather name="repeat" size={12} color="#15304D" />
            </View>
            <Text className="font-cairo-medium text-[13px] text-[#111111]">
              مع
            </Text>
            <View className="flex-row items-center gap-1">
              <Text
                className="font-cairo-medium text-[13px] text-[#111111]"
                style={{ writingDirection: 'rtl' }}
              >
                {property.exchangeRequirements.source}
              </Text>
              <Feather name="repeat" size={12} color="#15304D" />
            </View>
          </View>
        )}

        {/* Specs: Location & Space */}
        <View className="flex-row items-center justify-end gap-3 pb-1">
          {/* Space */}
          <View className="flex-row items-center gap-1">
            <Text
              className="font-cairo text-[13px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              {property.space}
            </Text>
            <AreaIcon size={14} color="#15304D" />
          </View>

          {/* Location */}
          <View className="flex-row items-center gap-1">
            <Text
              className="font-cairo text-[13px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              {property.location}
            </Text>
            <LocationIcon size={14} color="#15304D" />
          </View>
        </View>

        {/* Property Income (if present) */}
        {property.propertyIncome !== undefined &&
          property.propertyIncome !== null && (
            <View className="mt-2 border-t border-[#ECECEC] pt-2">
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-baseline gap-1">
                  <Text
                    className="font-cairo-bold text-[15px] text-[#018B1B]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    {property.propertyIncome}
                  </Text>
                </View>
                <Text
                  className="font-cairo text-[13px] text-[#111111]"
                  style={{ writingDirection: 'rtl' }}
                >
                  مدخول العقار
                </Text>
              </View>
            </View>
          )}
      </View>

      {/* Button: تفاصيل */}
      <TouchableOpacity
        onPress={onPress}
        activeOpacity={0.8}
        className="mt-3 h-7 w-full items-center justify-center rounded-[4px] bg-[#F9FAFE]"
        accessibilityRole="button"
        accessibilityLabel="تفاصيل العقار"
      >
        <Text
          className="font-cairo-semibold text-[13px] text-[#15304D]"
          style={{ writingDirection: 'rtl' }}
        >
          تفاصيل
        </Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );
}
