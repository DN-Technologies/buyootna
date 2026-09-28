import { Text, TouchableOpacity, View } from 'react-native';

import type { FeaturePackage } from '@/shared/api/payments.service';

interface FeaturePackageOptionProps {
  pkg: FeaturePackage;
  isSelected: boolean;
  disabled?: boolean;
  onPress: (id: string) => void;
}

export default function FeaturePackageOption({
  pkg,
  isSelected,
  disabled,
  onPress,
}: FeaturePackageOptionProps) {
  return (
    <TouchableOpacity
      testID={`package-option-${pkg.id}`}
      activeOpacity={0.8}
      disabled={disabled}
      onPress={() => onPress(pkg.id)}
      accessibilityState={{ selected: isSelected, disabled }}
      className={`rounded-[12px] border bg-white p-4 ${
        isSelected ? 'border-[#15304D]' : 'border-[#ECECEC]'
      }`}
    >
      {/* Top Row: Price (Left) & Title (Right) */}
      <View className="flex-row items-center justify-between">
        <Text
          className="font-cairo-semibold text-[16px] leading-[22px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          {pkg.label}
        </Text>
        <Text className="font-cairo-bold text-[16px] text-[#15304D]">
          {`${pkg.price} د.ك`}
        </Text>
      </View>

      {/* Bottom Row: Description */}
      {!!pkg.description && (
        <View className="mt-1">
          <Text
            className="font-cairo text-[14px] leading-[1.5] text-[#1C1D1F] opacity-80"
            style={{ writingDirection: 'rtl' }}
          >
            {pkg.description}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
