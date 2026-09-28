import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';

import type { FeaturePackage } from '@/shared/api/payments.service';

import FeaturePackageOption from './FeaturePackageOption';

interface FeaturePackageListProps {
  packages: FeaturePackage[];
  selectedPackageId: string | null;
  isLoading: boolean;
  isError: boolean;
  disabled?: boolean;
  onSelect: (id: string) => void;
  onRetry: () => void;
}

export default function FeaturePackageList({
  packages,
  selectedPackageId,
  isLoading,
  isError,
  disabled,
  onSelect,
  onRetry,
}: FeaturePackageListProps) {
  return (
    <>
      <Text
        className="mb-3 font-cairo-medium text-[14px] leading-[1.5] text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        اختر الباقة المناسبة لك
      </Text>

      {isLoading ? (
        <View className="items-center py-8">
          <ActivityIndicator color="#15304D" />
        </View>
      ) : isError || packages.length === 0 ? (
        <View className="items-center gap-2 py-6">
          <Text className="font-cairo text-[14px] text-[#6B6A6A]">
            {isError ? 'تعذر تحميل الباقات' : 'لا توجد باقات تمييز متاحة حالياً'}
          </Text>
          {isError && (
            <TouchableOpacity onPress={onRetry} activeOpacity={0.7}>
              <Text className="font-cairo-bold text-[14px] text-[#15304D] underline">
                إعادة المحاولة
              </Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <View className="gap-3">
          {packages.map((pkg) => (
            <FeaturePackageOption
              key={pkg.id}
              pkg={pkg}
              isSelected={pkg.id === selectedPackageId}
              disabled={disabled}
              onPress={onSelect}
            />
          ))}
        </View>
      )}
    </>
  );
}
