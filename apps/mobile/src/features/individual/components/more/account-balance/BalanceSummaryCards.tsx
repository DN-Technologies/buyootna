import { Text, View } from 'react-native';

import type { WalletBalanceCounts } from '@/shared/api/plans.service';

// Two tiers are sold: عادي and ذهبي. Silver is retired -- credits someone
// still holds count as ذهبي (see countOf), so no balance disappears.
const CARDS: {
  key: 'regular' | 'gold';
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
    key: 'gold',
    label: 'ذهبي',
    cardClass: 'bg-[#FF9F1C]',
    labelClass: 'text-[#111111]',
  },
];

interface BalanceSummaryCardsProps {
  counts: WalletBalanceCounts;
}

const countOf = (counts: WalletBalanceCounts, key: 'regular' | 'gold') =>
  key === 'gold'
    ? (counts.gold ?? 0) + (counts.silver ?? 0)
    : (counts.regular ?? 0);

export function BalanceSummaryCards({ counts }: BalanceSummaryCardsProps) {
  return (
    <View className="mx-5 mt-4 flex-row items-center gap-3">
      {CARDS.map(({ key, label, cardClass, labelClass }) => (
        <View key={key} className={`flex-1 rounded-[16px] p-4 ${cardClass}`}>
          <Text
            className="font-cairo-bold text-2xl text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            {countOf(counts, key)}
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
