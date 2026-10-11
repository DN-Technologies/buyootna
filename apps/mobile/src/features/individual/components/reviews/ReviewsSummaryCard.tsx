import { FontAwesome } from '@expo/vector-icons';
import { Text, View } from 'react-native';

import type { ReviewSummary } from '@/shared/components/profile/types';

/** The average with its stars, and a bar per star count (5 down to 1). */
export default function ReviewsSummaryCard({
  summary,
}: {
  summary: ReviewSummary;
}) {
  return (
    <View className="mx-5 mt-5 bg-white p-5">
      <View className="flex-row items-center justify-between">
        {/* Right side: rating progress bars (5 to 1) */}
        <View className="w-[62%]">
          {summary.ratingBreakdown.map((row) => (
            <View key={row.star} className="mb-1.5 flex-row items-center gap-2">
              <Text className="w-3 text-center font-cairo-semibold text-[13px] text-[#6B6A6A]">
                {row.star}
              </Text>
              <View className="h-[8px] flex-1 overflow-hidden rounded-full bg-[#E2E8F0]">
                <View
                  style={{ width: row.pct as any }}
                  className="h-full rounded-full bg-[#FFB400]"
                />
              </View>
            </View>
          ))}
        </View>

        {/* Left side: score and star rating */}
        <View className="items-center pl-2">
          <Text className="font-cairo-bold text-3xl text-[#111111]">
            {summary.averageRating.toFixed(1)}
          </Text>
          <View className="my-1 flex-row items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <FontAwesome
                key={star}
                name="star"
                size={14}
                color={
                  star <= Math.round(summary.averageRating)
                    ? '#FFB400'
                    : '#E2E8F0'
                }
              />
            ))}
          </View>
          <Text className="font-cairo-medium text-xs text-[#94A3B8]">
            {summary.totalRatingsCount} تقييم
          </Text>
        </View>
      </View>
    </View>
  );
}
