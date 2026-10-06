import { View } from 'react-native';

import BalanceSummarySkeleton from '@/shared/components/skeletons/BalanceSummarySkeleton';
import ListRowSkeleton from '@/shared/components/skeletons/ListRowSkeleton';

export function AccountBalanceSkeleton() {
  return (
    <View className="pt-4">
      <View className="mx-5 h-4 w-56 self-center rounded bg-slate-100" />
      <View className="mt-4">
        <BalanceSummarySkeleton />
      </View>
      <View className="mt-6 px-5">
        <View className="mb-4 h-4 w-24 self-center rounded bg-slate-200" />
        {[1, 2, 3].map((key) => (
          <ListRowSkeleton key={key} showIcon={false} />
        ))}
      </View>
    </View>
  );
}
