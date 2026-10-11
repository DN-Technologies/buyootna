import { Image as ExpoImage } from 'expo-image';
import { RefreshControl, ScrollView, Text, View } from 'react-native';

interface ReviewsEmptyStateProps {
  refreshing: boolean;
  onRefresh: () => void;
}

export default function ReviewsEmptyState({
  refreshing,
  onRefresh,
}: ReviewsEmptyStateProps) {
  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          colors={['#15304D']}
        />
      }
    >
      <View className="items-center justify-center px-6 text-center">
        <View className="mb-6 items-center justify-center">
          <ExpoImage
            source={require('@/assets/icons/reviews/star-reviews-icon.svg')}
            style={{ width: 112, height: 77 }}
            contentFit="contain"
          />
        </View>
        <Text className="font-cairo-bold text-[16px] text-[#111111]">
          سجل تقييماتك فارغ حالياً
        </Text>
        <Text
          className="px-4 text-center font-cairo-semibold text-[14px] leading-6 text-[#6B6A6A]"
          style={{ writingDirection: 'rtl' }}
        >
          التقييمات والنجوم تظهر هنا فور تعاملك مع العملاء وتقييمهم لخدماتك أو
          عقاراتك داخل التطبيق.
        </Text>
      </View>
    </ScrollView>
  );
}
