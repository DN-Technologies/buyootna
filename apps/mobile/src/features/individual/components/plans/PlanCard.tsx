import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import type { PlanOption } from './constants';
import PlanOptionItem from './PlanOptionItem';
import RecommendedBadge from './RecommendedBadge';

export interface PlanCardProps {
  title: string;
  features: string[];
  options: PlanOption[];
  selectedOptionId: string;
  recommended?: boolean;
  isProcessing: boolean;
  onSelectOption: (optionId: string) => void;
  onBuy: () => void;
}

export default function PlanCard({
  title,
  features,
  options,
  selectedOptionId,
  recommended = false,
  isProcessing,
  onSelectOption,
  onBuy,
}: PlanCardProps) {
  return (
    <View
      className={
        recommended
          ? 'relative mt-2 rounded-2xl border border-[#D06400] bg-white p-5'
          : 'rounded-2xl border border-[#ECECEC] bg-white p-5'
      }
    >
      {recommended && <RecommendedBadge />}

      <Text
        className="font-cairo-bold text-[17px] leading-[22px] text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        {title}
      </Text>

      <View className="my-3 h-[1px] bg-[#ECECEC]" />

      {/* Features List */}
      <View className="mb-6 gap-2">
        {features.map((feat, idx) => (
          <View key={idx} className="flex-row items-center gap-2">
            <Feather name="check" size={16} color="#018B1B" />
            <Text className="font-cairo text-sm leading-[22px] text-[#111111]">
              {feat}
            </Text>
          </View>
        ))}
      </View>

      {/* Package Options Grid */}
      <View className="flex-row gap-2">
        {options.map((opt) => (
          <PlanOptionItem
            key={opt.id}
            option={opt}
            isSelected={selectedOptionId === opt.id}
            onSelect={() => onSelectOption(opt.id)}
          />
        ))}
      </View>

      {/* Buy Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onBuy}
        disabled={isProcessing}
        className="mt-3.5 h-12 w-full items-center justify-center rounded-[24px] bg-[#15304D]"
        style={{ opacity: isProcessing ? 0.6 : 1 }}
      >
        <Text className="font-cairo-semibold leading-[22px] text-sm text-white">
          {isProcessing ? 'جاري التحميل...' : 'اشتر الان'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
