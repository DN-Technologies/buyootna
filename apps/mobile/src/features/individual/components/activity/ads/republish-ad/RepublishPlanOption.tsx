import { Text, TouchableOpacity, View } from 'react-native';

import { SafeLinearGradient } from '@/shared/components/ui/SafeLinearGradient';

import type { RepublishPlanType } from './republishCredits';

interface RepublishPlanOptionProps {
  planType: RepublishPlanType;
  title: string;
  balanceLabel: string;
  isSelected: boolean;
  onPress: (planType: RepublishPlanType) => void;
}

const CARD_CLASS =
  'h-[74px] flex-row items-start justify-between rounded-[8px] p-3';

// Same box as CARD_CLASS: the gradient isn't a NativeWind component, so it
// has to be sized with style or it collapses
const GRADIENT_CARD_STYLE = {
  height: 74,
  flexDirection: 'row',
  alignItems: 'flex-start',
  justifyContent: 'space-between',
  borderRadius: 8,
  padding: 12,
} as const;

function Radio({ checked }: { checked: boolean }) {
  return checked ? (
    <View className="h-4 w-4 items-center justify-center rounded-full border-[1.5px] border-[#111111]">
      <View className="h-2 w-2 rounded-full bg-[#111111]" />
    </View>
  ) : (
    <View className="h-4 w-4 rounded-full border-[1.5px] border-[#CBD5E1]" />
  );
}

// One selectable card: the featured one turns into the orange gradient when
// picked, the regular one gets a navy border
export default function RepublishPlanOption({
  planType,
  title,
  balanceLabel,
  isSelected,
  onPress,
}: RepublishPlanOptionProps) {
  const content = (
    <>
      <Radio checked={isSelected} />
      <View className="flex-1 mx-2">
        <Text
          className="font-cairo-semibold text-[14px] leading-[20px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          {title}
        </Text>
        <Text
          className="font-cairo-medium text-[12px] leading-[18px] text-[#6B6A6A]"
          style={{ writingDirection: 'rtl' }}
        >
          {balanceLabel}
        </Text>
      </View>
    </>
  );

  return (
    <TouchableOpacity
      testID={`republish-option-${planType.toLowerCase()}`}
      activeOpacity={0.8}
      onPress={() => onPress(planType)}
      accessibilityState={{ selected: isSelected }}
      className="flex-1"
    >
      {isSelected && planType === 'FEATURED' ? (
        <SafeLinearGradient
          colors={['#FF8D28', '#FACC15']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={GRADIENT_CARD_STYLE}
        >
          {content}
        </SafeLinearGradient>
      ) : (
        <View
          className={`${CARD_CLASS} border-2 bg-[#F5F7F9] ${
            isSelected ? 'border-[#15304D]' : 'border-transparent'
          }`}
        >
          {content}
        </View>
      )}
    </TouchableOpacity>
  );
}
