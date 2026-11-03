import { Text, View } from 'react-native';

import ActivityCardSkeleton from '@/shared/components/skeletons/ActivityCardSkeleton';

/** Loading cards, an error, or a line saying there's nothing (no Figma frame). */
export default function OfficeEmptyState({
  loading = false,
  error,
  message,
}: {
  loading?: boolean;
  error?: string | null;
  message: string;
}) {
  if (loading) {
    return (
      <View testID="office-properties-loading">
        {[1, 2, 3].map((key) => (
          <ActivityCardSkeleton key={key} />
        ))}
      </View>
    );
  }
  return (
    <View className="items-center py-10">
      <Text
        className={`font-cairo-medium ${error ? 'text-red-500' : 'text-gray-400'}`}
        style={{ writingDirection: 'rtl' }}
      >
        {error || message}
      </Text>
    </View>
  );
}
