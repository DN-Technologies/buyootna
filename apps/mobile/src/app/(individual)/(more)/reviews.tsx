import { Feather, FontAwesome } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Image,
  RefreshControl,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import apiClient from '@/shared/api/api';
import { SortBottomSheet } from '@/shared/components/profile/ProfileFilterSheet';
import { ReviewItem } from '@/shared/components/profile/types';
import ReviewSkeleton, {
  ReviewSummarySkeleton,
} from '@/shared/components/skeletons/ReviewSkeleton';
import { useAuthStore } from '@/shared/store/useAuthStore';

interface ReviewSummaryData {
  averageRating: number;
  totalRatingsCount: number;
  ratingBreakdown: { star: number; pct: string }[];
}

export default function ReviewsScreen() {
  const router = useRouter();
  const user = useAuthStore((state) => state.user);

  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [sortOption, setSortOption] = useState('all');

  const [summary, setSummary] = useState<ReviewSummaryData>({
    averageRating: 0,
    totalRatingsCount: 0,
    ratingBreakdown: [
      { star: 5, pct: '0%' },
      { star: 4, pct: '0%' },
      { star: 3, pct: '0%' },
      { star: 2, pct: '0%' },
      { star: 1, pct: '0%' },
    ],
  });

  const sortSheetRef = useRef<BottomSheetModal>(null);

  const fetchReviews = useCallback(async () => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }
    try {
      const [reviewsRes, summaryRes] = await Promise.all([
        apiClient.get(`/users/${user.id}/reviews`, {
          params: { sort: sortOption },
        }),
        apiClient.get(`/users/${user.id}/reviews/summary`),
      ]);

      if (reviewsRes.data?.data) {
        setReviews(reviewsRes.data.data);
      }
      if (summaryRes.data) {
        setSummary(summaryRes.data);
      }
    } catch (e) {
      console.log('Error fetching reviews from backend:', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  }, [user?.id, sortOption]);

  useEffect(() => {
    setIsLoading(true);
    fetchReviews();
  }, [fetchReviews]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchReviews();
  }, [fetchReviews]);

  const handleToggleLike = async (reviewId: string) => {
    setReviews((prev) =>
      prev.map((item) => {
        if (item.id !== reviewId) return item;
        const isLiked = item.userLiked;
        const isDisliked = item.userDisliked;
        return {
          ...item,
          userLiked: !isLiked,
          userDisliked: false,
          likes: isLiked ? Math.max(0, item.likes - 1) : item.likes + 1,
          dislikes: isDisliked ? Math.max(0, item.dislikes - 1) : item.dislikes,
        };
      }),
    );
    try {
      await apiClient.post(`/reviews/${reviewId}/like`);
    } catch (e) {
      console.error('Failed to toggle like:', e);
    }
  };

  const handleToggleDislike = async (reviewId: string) => {
    setReviews((prev) =>
      prev.map((item) => {
        if (item.id !== reviewId) return item;
        const isLiked = item.userLiked;
        const isDisliked = item.userDisliked;
        return {
          ...item,
          userDisliked: !isDisliked,
          userLiked: false,
          dislikes: isDisliked
            ? Math.max(0, item.dislikes - 1)
            : item.dislikes + 1,
          likes: isLiked ? Math.max(0, item.likes - 1) : item.likes,
        };
      }),
    );
    try {
      await apiClient.post(`/reviews/${reviewId}/dislike`);
    } catch (e) {
      console.error('Failed to toggle dislike:', e);
    }
  };

  // Sort reviews array client-side if needed
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortOption === 'rating_desc') return b.rating - a.rating;
    if (sortOption === 'rating_asc') return a.rating - b.rating;
    if (sortOption === 'newest') return b.id.localeCompare(a.id);
    if (sortOption === 'oldest') return a.id.localeCompare(b.id);
    return 0;
  });

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      {/* 1. Header */}
      <View className="flex-row items-center justify-between border-b border-gray-50 px-5 py-4">
        <TouchableOpacity
          onPress={() => router.back()}
          className="h-8 w-8 items-center justify-center"
        >
          <Feather name="chevron-right" size={24} color="#111111" />
        </TouchableOpacity>
        <Text className="font-cairo-semibold text-lg text-[#111111]">
          التقييمات
        </Text>
        <View className="w-8" />
      </View>

      {isLoading ? (
        /* Loading Skeleton State */
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        >
          <Text
            className="mt-4 px-5 text-center font-cairo text-[14px] text-[#111]"
            style={{ writingDirection: 'rtl' }}
          >
            تابع آراء العملاء عنك وعن خدماتك.
          </Text>

          <ReviewSummarySkeleton />

          <View className="mt-6 px-5">
            <ReviewSkeleton />
            <ReviewSkeleton />
            <ReviewSkeleton />
          </View>
        </ScrollView>
      ) : reviews.length === 0 ? (
        /* Empty State */
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
              التقييمات والنجوم تظهر هنا فور تعاملك مع العملاء وتقييمهم لخدماتك
              أو عقاراتك داخل التطبيق.
            </Text>
          </View>
        </ScrollView>
      ) : (
        /* Content Loaded State */
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#15304D']}
            />
          }
        >
          {/* Subtitle intro */}
          <Text
            className="mt-4 px-5 text-center font-cairo text-[14px] text-[#111]"
            style={{ writingDirection: 'rtl' }}
          >
            تابع آراء العملاء عنك وعن خدماتك.
          </Text>

          {/* 2. Sort Button Row */}
          <View className="mt-4 px-5">
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => sortSheetRef.current?.present()}
              className="w-[114px] flex-row items-center gap-2 rounded-[12px] bg-[#F9FAFE] px-3 py-2"
            >
              <Feather name="sliders" size={16} color="#111111" />
              <Text className="font-cairo-semibold text-sm text-[#111111]">
                الترتيب حسب
              </Text>
            </TouchableOpacity>
          </View>

          {/* 3. Rating Summary Card */}
          <View className="mx-5 mt-5 bg-white p-5">
            <View className="flex-row items-center justify-between">
              {/* Right Side: Rating Progress Bars (5 to 1) */}
              <View className="w-[62%]">
                {summary.ratingBreakdown.map((row) => (
                  <View
                    key={row.star}
                    className="mb-1.5 flex-row items-center gap-2"
                  >
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

              {/* Left Side: Score & Star Rating */}
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

          {/* 4. Reviews List */}
          <View className="mt-6 px-5">
            {sortedReviews.map((item) => (
              <View
                key={item.id}
                className="mb-4 border-b border-gray-100 pb-4"
              >
                {/* Top user row */}
                <View className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-3">
                    <Image
                      source={{ uri: item.avatarUrl }}
                      className="h-[48px] w-[48px] rounded-full border border-gray-100"
                      resizeMode="cover"
                    />

                    <View>
                      <View className="mt-0.5 flex-row items-center gap-1">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <FontAwesome
                            key={star}
                            name="star"
                            size={12}
                            color={star <= item.rating ? '#FFB400' : '#E2E8F0'}
                          />
                        ))}
                      </View>
                      <Text className="font-cairo-semibold text-[14px] text-[#111111]">
                        {item.userName}
                      </Text>
                    </View>
                  </View>
                  <Text className="font-cairo text-xs text-[#6B6A6A]">
                    {item.timeAgo}
                  </Text>
                </View>

                {/* Comment text (a stars-only review has none) */}
                {!!item.comment && (
                  <Text
                    className="mt-3 font-cairo text-[14px] leading-6 text-[#6B6A6A]"
                    style={{ writingDirection: 'rtl' }}
                  >
                    {item.comment}
                  </Text>
                )}

                {/* Optional Reaction buttons */}
                {(item.likes !== undefined || item.dislikes !== undefined) && (
                  <View className="mt-3 flex-row items-center gap-5 border-t border-slate-50 pt-2.5">
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleToggleLike(item.id)}
                      className="flex-row items-center gap-1.5"
                    >
                      <Feather
                        name="thumbs-up"
                        size={16}
                        color={item.userLiked ? '#15304D' : '#94A3B8'}
                      />
                      <Text
                        className={`font-sans text-xs ${
                          item.userLiked
                            ? 'font-bold text-[#15304D]'
                            : 'text-[#94A3B8]'
                        }`}
                      >
                        ({item.likes ?? 0})
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => handleToggleDislike(item.id)}
                      className="flex-row items-center gap-1.5"
                    >
                      <Feather
                        name="thumbs-down"
                        size={16}
                        color={item.userDisliked ? '#EF4444' : '#94A3B8'}
                      />
                      <Text
                        className={`font-sans text-xs ${
                          item.userDisliked
                            ? 'font-bold text-[#EF4444]'
                            : 'text-[#94A3B8]'
                        }`}
                      >
                        ({item.dislikes ?? 0})
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            ))}
          </View>
        </ScrollView>
      )}

      {/* 5. Sort Bottom Sheet */}
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
