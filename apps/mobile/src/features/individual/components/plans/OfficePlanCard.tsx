import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { isBundlePlan, officeOptions } from '@/features/individual/utils/officePlans';
import type { PlanItem } from '@/shared/api/plans.service';

import PlanOptionItem from './PlanOptionItem';

interface OfficePlanCardProps {
  plan: PlanItem;
  selectedPackageId: string | undefined;
  onSelectPackage: (packageId: string) => void;
  onBuy: (packageId: string) => void;
}

/**
 * An office's plan (Figma 10180:31480): الاساسية offers one regular or one
 * featured ad; a bundle (العادية, الفضية) shows its price under its name.
 */
export default function OfficePlanCard({
  plan,
  selectedPackageId,
  onSelectPackage,
  onBuy,
}: OfficePlanCardProps) {
  const bundle = isBundlePlan(plan);
  const options = officeOptions(plan);
  const selected =
    options.find((o) => o.packageId === selectedPackageId) ?? options[0];

  return (
    <View
      testID={`office-plan-${plan.slug}`}
      className="rounded-xl border border-[#ECECEC] bg-white p-6"
    >
      {bundle ? (
        <View>
          <Text
            className="font-cairo-semibold text-base leading-[22px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            {plan.name}
          </Text>
          <Text
            className="font-cairo-bold text-xl text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            {`${plan.packages?.[0]?.price ?? plan.price} دينار كويتي`}
          </Text>
        </View>
      ) : (
        <Text
          className="font-cairo-bold text-[17px] leading-[22px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          {`الباقة ${plan.name}`}
        </Text>
      )}

      <View className="my-3 h-[1px] bg-[#ECECEC]" />

      <View className="mb-10 gap-2">
        {plan.features.map((feat) => (
          <View key={feat} className="flex-row items-center gap-2">
            <Feather name="check" size={16} color="#018B1B" />
            <Text className="font-cairo text-sm leading-[21px] text-[#111111]">
              {feat}
            </Text>
          </View>
        ))}
      </View>

      {!bundle && (
        <View className="mb-3.5 flex-row gap-2">
          {options.map((opt) => (
            <PlanOptionItem
              key={opt.id}
              option={opt}
              isSelected={selected?.id === opt.id}
              onSelect={() => onSelectPackage(opt.id)}
            />
          ))}
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.8}
        disabled={!selected}
        onPress={() => selected?.packageId && onBuy(selected.packageId)}
        className="h-12 w-full items-center justify-center rounded-[24px] bg-[#15304D]"
      >
        <Text className="font-cairo-semibold text-sm leading-[22px] text-white">
          اشتر الان
        </Text>
      </TouchableOpacity>
    </View>
  );
}
