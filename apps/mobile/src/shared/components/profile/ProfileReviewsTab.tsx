import { FlashList } from '@shopify/flash-list';
import { useMemo } from 'react';

import ProfileEmptyState from '@/shared/components/profile/ProfileEmptyState';
import ReviewCardItem from '@/shared/components/profile/ReviewCardItem';
import { ReviewItem } from '@/shared/components/profile/types';

interface ProfileReviewsTabProps {
  reviews: ReviewItem[];
  sort?: string;
  bottomInset?: number;
  renderHeader: () => React.ReactElement;
  onToggleLike: (reviewId: string) => void;
  onToggleDislike: (reviewId: string) => void;
}

export default function ProfileReviewsTab({
  reviews,
  sort = 'all',
  bottomInset = 0,
  renderHeader,
  onToggleLike,
  onToggleDislike,
}: ProfileReviewsTabProps) {
  const sortedReviews = useMemo(() => {
    return reviews.slice().sort((a, b) => {
      if (sort === 'rating_desc') return b.rating - a.rating;
      if (sort === 'rating_asc') return a.rating - b.rating;
      return 0;
    });
  }, [reviews, sort]);

  return (
    <FlashList
      key="reviews-list"
      data={sortedReviews}
      keyExtractor={(item) => item.id}
      ListHeaderComponent={renderHeader}
      ListEmptyComponent={<ProfileEmptyState tab="reviews" />}
      contentContainerStyle={{
        paddingBottom: bottomInset + 85,
      }}
      showsVerticalScrollIndicator={false}
      renderItem={({ item }) => (
        <ReviewCardItem
          item={item}
          onToggleLike={onToggleLike}
          onToggleDislike={onToggleDislike}
        />
      )}
    />
  );
}
