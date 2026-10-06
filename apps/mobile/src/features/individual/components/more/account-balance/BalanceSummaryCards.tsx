import { Text, View } from 'react-native';

import type { WalletBalanceCounts } from '@/shared/api/plans.service';

const CARDS: {
  key: keyof WalletBalanceCounts;
  label: string;
  cardClass: string;
  labelClass: string;
}[] = [
  {
    key: 'regular',
    label: 'عادي',
    cardClass: 'bg-[#F8F9FA]',
    labelClass: 'text-[#6B6A6A]',
  },
  {
    key: 'silver',
    label: 'فضي',
    cardClass: 'bg-[#F8F9FA]',
    labelClass: 'text-[#6B6A6A]',
  },
  {
    key: 'gold',
    label: 'ذهبي',
    cardClass: 'bg-[#FF9F1C]',
    labelClass: 'text-[#111111]',
  },
];

interface BalanceSummaryCardsProps {
  counts: WalletBalanceCounts;
}

export function BalanceSummaryCards({ counts }: BalanceSummaryCardsProps) {
  return (
    <View className="mx-5 mt-4 flex-row items-center gap-3">
      {CARDS.map(({ key, label, cardClass, labelClass }) => (
        <View key={key} className={`flex-1 rounded-[16px] p-4 ${cardClass}`}>
          <Text
            className="font-cairo-bold text-2xl text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            {counts[key] ?? 0}
          </Text>
          <Text
            className={`mt-1 font-cairo-semibold text-sm ${labelClass}`}
            style={{ writingDirection: 'rtl' }}
          >
            {label}
          </Text>
        </View>
      ))}
    </View>
  );
}
