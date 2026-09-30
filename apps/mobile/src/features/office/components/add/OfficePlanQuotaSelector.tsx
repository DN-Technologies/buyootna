import { Text, TouchableOpacity, View } from 'react-native';

export type OfficePlanType = 'silver' | 'normal';

export interface OfficePlanQuotaSelectorProps {
  selectedPlan: OfficePlanType;
  onSelectPlan: (plan: OfficePlanType) => void;
  silverQuota?: number;
  normalQuota?: number;
  testID?: string;
}

export function OfficePlanQuotaSelector({
  selectedPlan,
  onSelectPlan,
  silverQuota = 2,
  normalQuota = 20,
  testID = 'office-plan-quota-selector',
}: OfficePlanQuotaSelectorProps) {
  const isSilver = selectedPlan === 'silver';
  const isNormal = selectedPlan === 'normal';

  return (
    <View className="w-full flex-col gap-2" testID={testID}>
      {/* Title matching Figma 4494:141833 */}
      <Text className="text-right font-cairo-semibold text-base text-[#111111]">
        اختر نوع اعلانك
      </Text>

      {/* Plan Cards Row */}
      <View className="w-full flex-row gap-2.5">
        {/* Normal Option (عادي) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectPlan('normal')}
          className={`flex-1 flex-col items-end justify-center rounded-lg p-3 ${
            isNormal
              ? 'border-2 border-[#15304D] bg-[#F5F7F9]'
              : 'border border-[#E2E8F0] bg-[#F5F7F9]'
          }`}
          testID="plan-quota-normal"
        >
          <Text className="text-right font-cairo-medium text-xs text-[#111111]">
            لديك
          </Text>
          <Text className="text-right font-cairo-bold text-base text-[#111111]">
            {normalQuota} عادي
          </Text>
        </TouchableOpacity>

        {/* Silver Option (فضي) */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => onSelectPlan('silver')}
          className={`flex-1 flex-col items-end justify-center rounded-lg p-3 ${
            isSilver
              ? 'border-2 border-[#15304D] bg-[#F5F7F9]'
              : 'border border-[#E2E8F0] bg-[#F5F7F9]'
          }`}
          testID="plan-quota-silver"
        >
          <Text className="text-right font-cairo-medium text-xs text-[#111111]">
            لديك
          </Text>
          <Text className="text-right font-cairo-bold text-base text-[#111111]">
            {silverQuota} فضي
          </Text>
        </TouchableOpacity>
      </View>

      {/* Total remaining quota hint text */}
      <View className="mt-1 items-end">
        <Text
          className="font-cairo-medium text-xs text-[#6B6A6A]"
          testID="total-quota-hint"
        >
          {`${silverQuota + normalQuota} إعلانات متبقية في باقتك`}
        </Text>
      </View>
    </View>
  );
}

export default OfficePlanQuotaSelector;
