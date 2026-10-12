import { Text, TouchableOpacity, View } from 'react-native';

import type { CompanySubscriptionHistoryItem } from '@/shared/api/companySubscriptions.service';
import { formatArabicDate } from '@/shared/utils/helpers/property';

/** One paid period: plan, end date, id; a green dot while it is running. */
export function SubscriptionHistoryRow({
  item,
}: {
  item: CompanySubscriptionHistoryItem;
}) {
  const active = item.status === 'ACTIVE';
  return (
    <View
      testID={`history-row-${item.id}`}
      className="w-full flex-row items-end rounded-lg bg-[#F9FAFE] p-4"
      style={{ gap: 12 }}
    >
      <View className="flex-1 flex-row items-start" style={{ gap: 10 }}>
        <View
          className={`mt-1.5 h-1.5 w-1.5 rounded-full ${
            active ? 'bg-[#018B1B]' : 'bg-[#9C1E28]'
          }`}
        />
        <View className="flex-1 items-start" style={{ gap: 6 }}>
          <Text
            className="font-cairo-semibold text-sm text-[#111111]"
            style={{ writingDirection: 'rtl', letterSpacing: 0.28 }}
          >
            {item.planName}
          </Text>
          <Text
            className="font-cairo-medium text-xs text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
          >
            تاريخ الانتهاء: {formatArabicDate(item.endsAt)}
          </Text>
        </View>
      </View>
      <Text className="font-cairo text-xs text-[#6B6A6A]">{item.displayId}</Text>
    </View>
  );
}

interface SubscriptionHistorySectionProps {
  items: CompanySubscriptionHistoryItem[];
  onShowAll: () => void;
}

/** سجل الباقات: the latest paid periods, with a way to the full list. */
export default function SubscriptionHistorySection({
  items,
  onShowAll,
}: SubscriptionHistorySectionProps) {
  if (items.length === 0) return null;

  return (
    <View testID="balance-history" className="w-full" style={{ gap: 10 }}>
      <View className="flex-row items-center justify-between">
        <Text className="font-cairo-bold text-base text-[#111111]">
          سجل الباقات
        </Text>
        <TouchableOpacity
          testID="balance-history-all"
          activeOpacity={0.7}
          onPress={onShowAll}
          className="h-7 justify-center px-2"
        >
          <Text
            className="font-cairo-semibold text-sm text-[#15304D]"
            style={{ letterSpacing: 0.28 }}
          >
            عرض الكل
          </Text>
        </TouchableOpacity>
      </View>
      <View style={{ gap: 12 }}>
        {items.map((item) => (
          <SubscriptionHistoryRow key={item.id} item={item} />
        ))}
      </View>
    </View>
  );
}
