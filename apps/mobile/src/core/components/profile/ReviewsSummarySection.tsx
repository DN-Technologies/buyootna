import { Feather, FontAwesome } from '@expo/vector-icons';
import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface ReviewsSummarySectionProps {
  onAddReview: () => void;
  onSortPress?: () => void;
  totalRatingsCount?: number;
  averageRating?: number;
}

export default function ReviewsSummarySection({
  onAddReview,
  onSortPress,
  totalRatingsCount = 100,
  averageRating = 4.5,
}: ReviewsSummarySectionProps) {
  const ratingBreakdown = [
    { star: 5, pct: '85%' },
    { star: 4, pct: '50%' },
    { star: 3, pct: '30%' },
    { star: 2, pct: '18%' },
    { star: 1, pct: '8%' },
  ];

  return (
    <View className="mt-4 px-5">
      {/* Sort row */}
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={onSortPress}
        className="flex-row items-center gap-1.5"
      >
        <Feather name="sliders" size={16} color="#111111" />
        <Text className="font-cairo-semibold text-sm text-[#111111]">
          الترتيب حسب
        </Text>
      </TouchableOpacity>

      {/* Share your opinion / Add review button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onAddReview}
        className="mt-4 w-full items-center justify-center rounded-full border border-[#E2E8F0] bg-white py-3.5"
      >
        <Text className="font-cairo-medium text-[16px] leading-[24px] text-[#111111]">
          شارك برأيك
        </Text>
      </TouchableOpacity>

      {/* Rating Summary Card */}
      <View className="mt-6">
        <Text
          className="font-cairo-bold text-base text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          ملخص التقييم
        </Text>

        <View className="mt-3 flex-row items-center justify-between">
          {/* Progress bars (Right side: 5 to 1) */}
          <View className="w-[75%]">
            {ratingBreakdown.map((row) => (
              <View key={row.star} className="mb-1 flex-row items-center gap-2">
                <Text className="w-3 text-center font-sans text-[14px] font-medium text-[#6B6A6A]">
                  {row.star}
                </Text>
                <View
                  className="h-[8px] flex-1 overflow-hidden bg-[#E2E8F0]"
                  style={{
                    borderTopLeftRadius: 0,
                    borderBottomLeftRadius: 0,
                    borderTopRightRadius: 999,
                    borderBottomRightRadius: 999,
                  }}
                >
                  <View
                    style={{
                      width: row.pct as any,
                      borderTopLeftRadius: 0,
                      borderBottomLeftRadius: 0,
                      borderTopRightRadius: 999,
                      borderBottomRightRadius: 999,
                    }}
                    className="h-full bg-[#FFB400]"
                  />
                </View>
              </View>
            ))}
          </View>

          {/* Score badge (Left side) */}
          <View className="items-center">
            <View className="flex-row items-center gap-1.5">
              <FontAwesome
                name="star"
                size={18}
                color="#FFB400"
                className="relative -top-1"
              />
              <Text className="font-cairo-medium text-2xl font-bold text-[#111111]">
                {averageRating}
              </Text>
            </View>
            <Text className="font-cairo text-xs text-[#6B6A6A]">
              {totalRatingsCount} تقييم
            </Text>
          </View>
        </View>
      </View>

      <View className="my-5 h-[1px] bg-slate-100" />
    </View>
  );
}
