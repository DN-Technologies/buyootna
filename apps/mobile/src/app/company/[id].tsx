import { Feather } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { companyService } from '@/shared/api/company.service';
import { reviewsService } from '@/shared/api/reviews.service';
import CompanyGalleryTab from '@/shared/components/company/CompanyGalleryTab';
import CompanyHeaderCard from '@/shared/components/company/CompanyHeaderCard';
import CompanyServicesTab from '@/shared/components/company/CompanyServicesTab';
import CompanyWorkingHours from '@/shared/components/company/CompanyWorkingHours';
import QuoteRequestModal from '@/shared/components/company/QuoteRequestModal';
import ContentContainer from '@/shared/components/ContentContainer';
import AddReviewSheet from '@/shared/components/profile/AddReviewSheet';
import { SortBottomSheet } from '@/shared/components/profile/ProfileFilterSheet';
import ReviewCardItem from '@/shared/components/profile/ReviewCardItem';
import ReviewsSummarySection from '@/shared/components/profile/ReviewsSummarySection';
import { ReviewItem } from '@/shared/components/profile/types';
import CompanyDetailSkeleton from '@/shared/components/skeletons/CompanyDetailSkeleton';

type CompanyTab = 'about' | 'services' | 'gallery';

const DEFAULT_REVIEW_SUMMARY = {
  averageRating: 0,
  totalRatingsCount: 0,
  ratingBreakdown: [
    { star: 5, pct: '0%' },
    { star: 4, pct: '0%' },
    { star: 3, pct: '0%' },
    { star: 2, pct: '0%' },
    { star: 1, pct: '0%' },
  ],
};

export default function CompanyProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<CompanyTab>('about');
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(3);
  const [reviewSort, setReviewSort] = useState('all');

  // Modal references
  const addReviewSheetRef = useRef<BottomSheetModal>(null);
  const sortSheetRef = useRef<BottomSheetModal>(null);
  const quoteModalRef = useRef<BottomSheetModal>(null);

  const {
    data: company,
    isLoading,
    isError: companyError,
  } = useQuery({
    queryKey: ['company', id],
    queryFn: () => companyService.getCompanyDetails(String(id)),
    enabled: !!id,
  });

  useEffect(() => {
    if (companyError) {
      Alert.alert('خطأ', 'تعذر تحميل بيانات الشركة');
    }
  }, [companyError]);

  const services = company?.services ?? [];
  const projects = company?.projects ?? [];
  const targetUserId = company?.userId || String(id);
  const reviewsQueryKey = ['companyReviews', targetUserId, reviewSort];

  const { data: reviewsData, refetch: refetchReviews } = useQuery({
    queryKey: reviewsQueryKey,
    queryFn: async () => {
      const [sumRes, revRes] = await Promise.all([
        reviewsService.getSummary(targetUserId),
        reviewsService.getReviews(targetUserId, reviewSort),
      ]);
      return { summary: sumRes, reviews: revRes.data || [] };
    },
    enabled: !!company,
  });

  const reviewSummary = reviewsData?.summary ?? DEFAULT_REVIEW_SUMMARY;
  const reviews = reviewsData?.reviews ?? [];

  const handleAddReview = async (comment: string, rating: number) => {
    try {
      await reviewsService.addReview(targetUserId, rating, comment);
      Alert.alert('تم بنجاح', 'تم إضافة تقييمك بنجاح');
      refetchReviews();
    } catch (error: any) {
      const msg = error.response?.data?.message || 'تعذر إضافة التقييم';
      Alert.alert('خطأ', msg);
    }
  };

  const handleToggleLike = async (revId: string) => {
    queryClient.setQueryData(reviewsQueryKey, (prev: typeof reviewsData) =>
      prev
        ? {
            ...prev,
            reviews: prev.reviews.map((r: ReviewItem) =>
              r.id === revId
                ? {
                    ...r,
                    likes: r.userLiked ? r.likes - 1 : r.likes + 1,
                    userLiked: !r.userLiked,
                    dislikes: r.userDisliked ? r.dislikes - 1 : r.dislikes,
                    userDisliked: false,
                  }
                : r,
            ),
          }
        : prev,
    );
    try {
      await reviewsService.toggleLike(revId);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleToggleDislike = async (revId: string) => {
    queryClient.setQueryData(reviewsQueryKey, (prev: typeof reviewsData) =>
      prev
        ? {
            ...prev,
            reviews: prev.reviews.map((r: ReviewItem) =>
              r.id === revId
                ? {
                    ...r,
                    dislikes: r.userDisliked ? r.dislikes - 1 : r.dislikes + 1,
                    userDisliked: !r.userDisliked,
                    likes: r.userLiked ? r.likes - 1 : r.likes,
                    userLiked: false,
                  }
                : r,
            ),
          }
        : prev,
    );
    try {
      await reviewsService.toggleDislike(revId);
    } catch (error) {
      console.error('Error toggling dislike:', error);
    }
  };

  const displayedReviews = reviews.slice(0, visibleReviewsCount);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <ContentContainer className="flex-1">
        {/* ── Top Navigation Header ── */}
        <View className="flex-row items-center justify-between border-b border-gray-100 px-5 py-3">
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => router.back()}
            className="h-9 w-9 items-center justify-center rounded-full bg-[#F8FAFC]"
          >
            <Feather name="chevron-right" size={22} color="#111111" />
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              Alert.alert('خيارات', '', [
                { text: 'مشاركة الملف الشخصي', onPress: () => {} },
                { text: 'إبلاغ عن الشركة', style: 'destructive' },
                { text: 'إلغاء', style: 'cancel' },
              ]);
            }}
            className="h-9 w-9 items-center justify-center rounded-full bg-[#F8FAFC]"
          >
            <Feather name="more-vertical" size={20} color="#111111" />
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <CompanyDetailSkeleton />
        ) : !company ? (
          <View className="flex-1 items-center justify-center p-5">
            <Text className="font-cairo-bold text-base text-[#111111]">
              لم يتم العثور على الشركة
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 110 }}
          >
            <View className="px-5 pt-4">
              {/* ── 1. Company Header Card ── */}
              <CompanyHeaderCard company={company} />

              {/* ── 2. 3-Tab Navigation Switcher ── */}
              <View className="mb-6 flex-row items-center border-b border-gray-200">
                {/* Tab 1: About Company (عن الشركة) */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setActiveTab('about')}
                  className={`flex-1 items-center border-b-2 pb-3 ${
                    activeTab === 'about'
                      ? 'border-[#15304D]'
                      : 'border-transparent'
                  }`}
                >
                  <Text
                    className={`font-cairo-bold text-base ${
                      activeTab === 'about'
                        ? 'text-[#15304D]'
                        : 'text-[#6B6A6A]'
                    }`}
                  >
                    عن الشركة
                  </Text>
                </TouchableOpacity>

                {/* Tab 2: Services (الخدمات) */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setActiveTab('services')}
                  className={`flex-1 items-center border-b-2 pb-3 ${
                    activeTab === 'services'
                      ? 'border-[#15304D]'
                      : 'border-transparent'
                  }`}
                >
                  <Text
                    className={`font-cairo-bold text-base ${
                      activeTab === 'services'
                        ? 'text-[#15304D]'
                        : 'text-[#6B6A6A]'
                    }`}
                  >
                    الخدمات
                  </Text>
                </TouchableOpacity>

                {/* Tab 3: Gallery / Portfolio (المعرض) */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setActiveTab('gallery')}
                  className={`flex-1 items-center border-b-2 pb-3 ${
                    activeTab === 'gallery'
                      ? 'border-[#15304D]'
                      : 'border-transparent'
                  }`}
                >
                  <Text
                    className={`font-cairo-bold text-base ${
                      activeTab === 'gallery'
                        ? 'text-[#15304D]'
                        : 'text-[#6B6A6A]'
                    }`}
                  >
                    المعرض
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ── 3. Tab Contents ── */}
              {activeTab === 'about' && (
                <View>
                  {/* Working Hours */}
                  <CompanyWorkingHours />

                  {/* Reviews Section Header & Toolbar */}
                  <View className="mb-4 flex-row items-center justify-between">
                    <Text className="font-cairo-semibold text-[14px] text-[#6B6A6A]">
                      التقييمات
                    </Text>
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => sortSheetRef.current?.present()}
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
                    onAddReview={() => addReviewSheetRef.current?.present()}
                    onSortPress={() => sortSheetRef.current?.present()}
                  />

                  {/* Reviews List */}
                  <View className="mt-4 space-y-4">
                    {displayedReviews.map((rev) => (
                      <ReviewCardItem
                        key={rev.id}
                        item={rev}
                        onToggleLike={handleToggleLike}
                        onToggleDislike={handleToggleDislike}
                      />
                    ))}
                  </View>

                  {/* Show More Button */}
                  {visibleReviewsCount < reviews.length && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() =>
                        setVisibleReviewsCount((prev) => prev + 3)
                      }
                      className="mt-6 self-center rounded-full border border-gray-200 px-6 py-2.5 bg-white"
                    >
                      <Text className="font-cairo-semibold text-xs text-[#111111]">
                        عرض المزيد
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {activeTab === 'services' && (
                <CompanyServicesTab services={services} />
              )}

              {activeTab === 'gallery' && (
                <CompanyGalleryTab projects={projects} />
              )}
            </View>
          </ScrollView>
        )}

        {/* ── 4. Fixed Bottom Quote Request Bar ── */}
        <View
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
          className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-5 pt-3"
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => quoteModalRef.current?.present()}
            className="h-12 w-full items-center justify-center rounded-full bg-[#15304D]"
          >
            <Text className="font-cairo-bold text-base leading-[24px] text-white">
              طلب عرض سعر
            </Text>
          </TouchableOpacity>
        </View>

        {/* ── 5. Modals & Sheets ── */}
        <AddReviewSheet
          ref={addReviewSheetRef}
          onSubmit={handleAddReview}
        />
        <SortBottomSheet
          ref={sortSheetRef}
          selectedValue={reviewSort}
          onSelect={setReviewSort}
        />
        <QuoteRequestModal
          ref={quoteModalRef}
          companyName={company?.name || ''}
          companySubtitle={company?.bio}
          companyLogoUrl={company?.logoUrl}
          services={services.length ? services : undefined}
          onRequestSubmitted={() => {}}
        />
      </ContentContainer>
    </SafeAreaView>
  );
}
