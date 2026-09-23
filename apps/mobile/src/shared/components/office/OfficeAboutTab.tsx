import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { WorkingHourItem } from '@/shared/components/company/CompanyWorkingHours';
import OfficeWorkingHours from '@/shared/components/office/OfficeWorkingHours';
import ReviewCardItem from '@/shared/components/profile/ReviewCardItem';
import ReviewsSummarySection from '@/shared/components/profile/ReviewsSummarySection';
import { ReviewItem, ReviewSummary } from '@/shared/components/profile/types';

interface OfficeAboutTabProps {
  licenseNumber?: string;
  workingHours?: WorkingHourItem[];
  reviewSummary: ReviewSummary;
  reviews: ReviewItem[];
  displayedReviews: ReviewItem[];
  visibleReviewsCount: number;
  onOpenSort: () => void;
  onOpenAddReview: () => void;
  onToggleLike: (reviewId: string) => void;
  onToggleDislike: (reviewId: string) => void;
  onShowMoreReviews: () => void;
}

export default function OfficeAboutTab({
  licenseNumber,
  workingHours,
  reviewSummary,
  reviews,
  displayedReviews,
  visibleReviewsCount,
  onOpenSort,
  onOpenAddReview,
  onToggleLike,
  onToggleDislike,
  onShowMoreReviews,
}: OfficeAboutTabProps) {
  return (
    <View>
      {/* License Number & Working Hours */}
      <OfficeWorkingHours
        licenseNumber={licenseNumber}
        schedule={workingHours}
      />

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
          />
        ))}
      </View>

      {/* Show More Reviews Button */}
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
    </View>
  );
}
