import { Text, View } from 'react-native';

import type { PackageHistoryItem } from '@/shared/api/plans.service';

interface PackageHistoryRowProps {
  item: PackageHistoryItem;
}

// RTL is forced app-wide, so flex-row children run right → left: the first
// child (title block) sits on the right, the ID on the left.
export function PackageHistoryRow({ item }: PackageHistoryRowProps) {
  return (
    <View className="mb-3 flex-row items-center justify-between rounded-2xl bg-[#F8F9FA] p-4">
      {/* Start (right): Title & Expiry */}
      <View className="items-start">
        <View className="flex-row items-center gap-2">
          <View
            className={`h-2 w-2 rounded-full ${
              item.status === 'ACTIVE' ? 'bg-[#10B981]' : 'bg-[#EF4444]'
            }`}
          />
          <Text className="font-cairo-semibold text-sm text-[#111111]">
            {item.planName}
          </Text>
        </View>
        <Text className="mt-1 font-cairo text-xs text-[#6B6A6A]">
          {item.dateText}
        </Text>
      </View>

      {/* End (left): Display ID */}
      <Text className="font-cairo text-xs text-[#94A3B8]">{item.displayId}</Text>
    </View>
  );
}
