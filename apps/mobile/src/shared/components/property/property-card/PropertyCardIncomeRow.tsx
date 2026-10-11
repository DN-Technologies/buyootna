import { Text, View } from 'react-native';

import { formatNumber } from '@/shared/utils/formatNumber';

export default function PropertyCardIncomeRow({
  propertyIncome,
}: {
  propertyIncome?: number | null;
}) {
  if (typeof propertyIncome !== 'number' || propertyIncome <= 0) return null;

  return (
    <View className="mt-2 flex-row items-center justify-between border-t border-gray-100 pt-2">
      <Text className="font-cairo-bold text-sm text-[#111111]">
        مدخول العقار
      </Text>
      <Text className="font-cairo-bold text-base text-[#10B981]">
        {formatNumber(propertyIncome)} د.ك
      </Text>
    </View>
  );
}
