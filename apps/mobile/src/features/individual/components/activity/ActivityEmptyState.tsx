import { Text, View } from 'react-native';

import { ActivityFilterType } from '@/features/individual/components/activity/ActivityFilterPills';
import ActivityCardSkeleton from '@/shared/components/skeletons/ActivityCardSkeleton';

interface ActivityEmptyStateProps {
  isLoading: boolean;
  error: string | null;
  activeFilterId: ActivityFilterType;
}

export default function ActivityEmptyState({
  isLoading,
  error,
  activeFilterId,
}: ActivityEmptyStateProps) {
  if (isLoading) {
    return (
      <View>
        {[1, 2, 3].map((key) => (
          <ActivityCardSkeleton key={key} />
        ))}
      </View>
    );
  }

  if (error) {
    return (
      <View className="items-center py-10">
        <Text className="font-cairo-medium text-red-500">{error}</Text>
      </View>
    );
  }

  return (
    <View className="items-center py-10">
      <Text className="font-cairo-medium text-gray-400">
        {activeFilterId === 'ARCHIVED'
          ? 'لا توجد إعلانات مؤرشفة حالياً'
          : 'لا توجد إعلانات حالياً'}
      </Text>
    </View>
  );
}
