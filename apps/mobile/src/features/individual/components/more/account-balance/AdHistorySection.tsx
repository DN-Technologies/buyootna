import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

import type { PackageHistoryItem } from '@/shared/api/plans.service';

import { PackageHistoryRow } from './PackageHistoryRow';

interface AdHistorySectionProps {
  items: PackageHistoryItem[];
}

export function AdHistorySection({ items }: AdHistorySectionProps) {
  const router = useRouter();

  return (
    <View className="mt-6 px-5">
      {/* RTL is forced app-wide: title on the right, عرض الكل on the left */}
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="font-cairo-bold text-base text-[#111111]">
          سجل الاعلانات
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.push('/package-history')}
        >
          <Text className="font-cairo-semibold text-sm text-[#15304D]">
            عرض الكل
          </Text>
        </TouchableOpacity>
      </View>

      {items.map((item) => (
        <PackageHistoryRow key={item.id} item={item} />
      ))}
    </View>
  );
}
