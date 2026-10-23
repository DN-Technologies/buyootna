import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import CompanyWorkingHours from '@/shared/components/company/CompanyWorkingHours';
import ReviewCardItem from '@/shared/components/profile/ReviewCardItem';
import ReviewsSummarySection from '@/shared/components/profile/ReviewsSummarySection';
import { ReviewItem, ReviewSummary } from '@/shared/components/profile/types';
import { useReviewReport } from '@/shared/hooks/useReviewReport';

interface CompanyAboutTabProps {
  reviewSummary: ReviewSummary;
  reviews: ReviewItem[];
  displayedReviews: ReviewItem[];
  visibleReviewsCount: number;
  onOpenSort: () => void;
  onOpenAddReview: () => void;
  onToggleLike: (reviewId: string) => void;
  onToggleDislike: (reviewId: string) => void;
  onShowMoreReviews: () => void;
  // مواعيد العمل as the company set them
  workingHours?: unknown;
}

export default function CompanyAboutTab({
  reviewSummary,
  reviews,
  displayedReviews,
  visibleReviewsCount,
  onOpenSort,
  onOpenAddReview,
  onToggleLike,
  onToggleDislike,
  onShowMoreReviews,
  workingHours,
}: CompanyAboutTabProps) {
  const { reportReview, reportSheet } = useReviewReport();

  return (
    <View>
      {/* Working Hours */}
      <CompanyWorkingHours hours={workingHours} />

      {/* Reviews Section Header & Toolbar */}
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="font-cairo-semibold text-[14px] text-[#6B6A6A]">
          التقييمات
        </Text>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onOpenSort}
          className="flex-row items-center gap-1.5"
        >
          <Feather name="sliders" size={14} color="#6B6A6A" />
          <Text className="font-cairo-medium text-xs text-[#6B6A6A]">
            الترتيب حسب
          </Text>
        </TouchableOpacity>
      </View>

      {/* Rating Breakdown & Share Opinion Button */}
      <ReviewsSummarySection
        averageRating={reviewSummary.averageRating}
        totalRatingsCount={reviewSummary.totalRatingsCount}
        ratingBreakdown={reviewSummary.ratingBreakdown}
        onAddReview={onOpenAddReview}
        onSortPress={onOpenSort}
      />

      {/* Reviews List */}
      <View className="mt-4 space-y-4">
        {displayedReviews.map((rev) => (
          <ReviewCardItem
            key={rev.id}
            item={rev}
            onToggleLike={onToggleLike}
            onToggleDislike={onToggleDislike}
            onReport={reportReview}
          />
        ))}
      </View>

      {/* Show More Button */}
      {visibleReviewsCount < reviews.length && (
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={onShowMoreReviews}
          className="mt-6 self-center rounded-full border border-gray-200 bg-white px-6 py-2.5"
        >
          <Text className="font-cairo-semibold text-xs text-[#111111]">
            عرض المزيد
          </Text>
        </TouchableOpacity>
      )}
      {reportSheet}
    </View>
  );
}
