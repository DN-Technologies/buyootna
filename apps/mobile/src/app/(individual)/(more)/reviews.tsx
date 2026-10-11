import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useRouter } from 'expo-router';
import { useRef } from 'react';
import { RefreshControl, ScrollView, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import MyReviewListItem from '@/features/individual/components/reviews/MyReviewListItem';
import ReviewsEmptyState from '@/features/individual/components/reviews/ReviewsEmptyState';
import ReviewsHeader from '@/features/individual/components/reviews/ReviewsHeader';
import ReviewsIntro from '@/features/individual/components/reviews/ReviewsIntro';
import ReviewsLoadingState from '@/features/individual/components/reviews/ReviewsLoadingState';
import ReviewsSortButton from '@/features/individual/components/reviews/ReviewsSortButton';
import ReviewsSummaryCard from '@/features/individual/components/reviews/ReviewsSummaryCard';
import { useMyReviews } from '@/features/individual/hooks/useMyReviews';
import { SortBottomSheet } from '@/shared/components/profile/ProfileFilterSheet';

export default function ReviewsScreen() {
  const router = useRouter();
  const sortSheetRef = useRef<BottomSheetModal>(null);
  const {
    reviews,
    sortedReviews,
    summary,
    isLoading,
    refreshing,
    sortOption,
    setSortOption,
    refresh,
    toggleLike,
    toggleDislike,
  } = useMyReviews();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <ReviewsHeader onBack={() => router.back()} />

      {isLoading ? (
        <ReviewsLoadingState />
      ) : reviews.length === 0 ? (
        <ReviewsEmptyState refreshing={refreshing} onRefresh={refresh} />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={refresh}
              colors={['#15304D']}
            />
          }
        >
          <ReviewsIntro />
          <ReviewsSortButton onPress={() => sortSheetRef.current?.present()} />
          <ReviewsSummaryCard summary={summary} />

          <View className="mt-6 px-5">
            {sortedReviews.map((item) => (
              <MyReviewListItem
                key={item.id}
                item={item}
                onToggleLike={toggleLike}
                onToggleDislike={toggleDislike}
              />
            ))}
          </View>
        </ScrollView>
      )}

      <SortBottomSheet
        ref={sortSheetRef}
        selectedValue={sortOption}
        onSelect={(val) => {
          setSortOption(val);
          sortSheetRef.current?.dismiss();
        }}
      />
    </SafeAreaView>
  );
}
