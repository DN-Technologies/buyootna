import { Feather } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import PropertySkeleton from '@/shared/components/skeletons/PropertySkeleton';

interface ProfileEmptyStateProps {
  tab: 'listings' | 'reviews';
  isLoading?: boolean;
}

export default function ProfileEmptyState({
  tab,
  isLoading,
}: ProfileEmptyStateProps) {
  if (isLoading && tab === 'listings') {
    return (
      <View className="mt-2 px-5">
        {[1, 2].map((key) => (
          <PropertySkeleton key={key} cardWidth="100%" />
        ))}
      </View>
    );
  }

  if (tab === 'reviews') {
    return (
      <View className="items-center justify-center px-5 py-20">
        <Feather name="star" size={48} color="#94A3B8" />
        <Text className="mt-4 font-cairo-bold text-base text-[#111111]">
          لا توجد تقييمات حالياً
        </Text>
        <Text className="mt-2 text-center font-cairo text-sm text-[#6B6A6A]">
          لم يقم أحد بتقييم هذا المستخدم بعد.
        </Text>
      </View>
    );
  }

  return (
    <View className="items-center justify-center px-5 py-20">
      <Feather name="home" size={48} color="#94A3B8" />
      <Text className="mt-4 font-cairo-bold text-base text-[#111111]">
        لا توجد إعلانات نشطة
      </Text>
      <Text className="mt-2 text-center font-cairo text-sm text-[#6B6A6A]">
        هذا المستخدم لم يقم بإضافة أي عقارات معروضة حالياً.
      </Text>
    </View>
  );
}
