import { ScrollView, View } from 'react-native';

import ReviewSkeleton, {
  ReviewSummarySkeleton,
} from '@/shared/components/skeletons/ReviewSkeleton';

import ReviewsIntro from './ReviewsIntro';

export default function ReviewsLoadingState() {
  return (
    <ScrollView
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 40 }}
    >
      <ReviewsIntro />

      <ReviewSummarySkeleton />

      <View className="mt-6 px-5">
        <ReviewSkeleton />
        <ReviewSkeleton />
        <ReviewSkeleton />
      </View>
    </ScrollView>
  );
}
