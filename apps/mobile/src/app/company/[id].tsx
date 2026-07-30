import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useLocalSearchParams, useRouter } from 'expo-router';
import  { useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Linking,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import CompanyGalleryTab from '@/core/components/company/CompanyGalleryTab';
import CompanyHeaderCard, {
  CompanyHeaderData,
} from '@/core/components/company/CompanyHeaderCard';
import CompanyServicesTab from '@/core/components/company/CompanyServicesTab';
import CompanyWorkingHours from '@/core/components/company/CompanyWorkingHours';
import QuoteRequestModal from '@/core/components/company/QuoteRequestModal';
import ContentContainer from '@/core/components/ContentContainer';
import AddReviewSheet from '@/core/components/profile/AddReviewSheet';
import {
  FilterBottomSheet,
  SortBottomSheet,
} from '@/core/components/profile/ProfileFilterSheet';
import ReviewCardItem from '@/core/components/profile/ReviewCardItem';
import ReviewsSummarySection from '@/core/components/profile/ReviewsSummarySection';
import { ReviewItem, SEEDED_REVIEWS } from '@/core/components/profile/types';

type CompanyTab = 'about' | 'services' | 'gallery';

const MOCK_COMPANY_DATA: CompanyHeaderData = {
  id: 'company-1',
  name: 'دار العقار الحديث',
  logoUrl:
    'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=400',
  isVerified: true,
  isActiveNow: true,
  rating: 3.5,
  reviewsCount: 214,
  bio: 'مكتب متخصص في بيع وتأجير العقارات السكنية والتجارية مع خدمات استشارية متكاملة.',
  location: 'السالماية • شمال غرب صليبخات',
  servicesCount: 2,
  projectsCount: 3,
  responseTime: '30 دقيقة',
  instagramUrl: 'https://instagram.com',
  twitterUrl: 'https://x.com',
};

export default function CompanyProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [company, setCompany] = useState<CompanyHeaderData>(MOCK_COMPANY_DATA);
  const [activeTab, setActiveTab] = useState<CompanyTab>('about');
  const [isLoading, setIsLoading] = useState(false);

  // Reviews state (reused from profile)
  const [reviews, setReviews] = useState<ReviewItem[]>(SEEDED_REVIEWS);
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(3);
  const [reviewSort, setReviewSort] = useState('all');
  const [reviewSummary, setReviewSummary] = useState({
    averageRating: 4.5,
    totalRatingsCount: 100,
    ratingBreakdown: [
      { star: 5, pct: '85%' },
      { star: 4, pct: '50%' },
      { star: 3, pct: '30%' },
      { star: 2, pct: '18%' },
      { star: 1, pct: '8%' },
    ],
  });

  // Modal references
  const addReviewSheetRef = useRef<BottomSheetModal>(null);
  const sortSheetRef = useRef<BottomSheetModal>(null);
  const quoteModalRef = useRef<BottomSheetModal>(null);

  // Fetch company info
  useEffect(() => {
    if (!id) return;
    setIsLoading(true);
    // Simulate API fetch
    const timer = setTimeout(() => {
      setCompany((prev) => ({
        ...prev,
        id: String(id),
      }));
      setIsLoading(false);
    }, 400);
    return () => clearTimeout(timer);
  }, [id]);

  const handleAddReview = (comment: string, rating: number) => {
    const created: ReviewItem = {
      id: Date.now().toString(),
      userName: 'مستخدم بيوتنا',
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
      rating,
      comment,
      timeAgo: 'الآن',
      likes: 0,
      dislikes: 0,
    };
    setReviews((prev) => [created, ...prev]);
  };

  const handleToggleLike = (revId: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === revId
          ? {
              ...r,
              likes: r.userLiked ? r.likes - 1 : r.likes + 1,
              userLiked: !r.userLiked,
            }
          : r,
      ),
    );
  };

  const handleToggleDislike = (revId: string) => {
    setReviews((prev) =>
      prev.map((r) =>
        r.id === revId
          ? {
              ...r,
              dislikes: r.userDisliked ? r.dislikes - 1 : r.dislikes + 1,
              userDisliked: !r.userDisliked,
            }
          : r,
      ),
    );
  };

  const handleContactAction = (type: 'phone' | 'whatsapp' | 'chat') => {
    if (type === 'phone') {
      Linking.openURL('tel:+96512345678').catch(() => {
        Alert.alert('خطأ', 'تعذر إجراء المكالمة الهاتفية');
      });
    } else if (type === 'whatsapp') {
      Linking.openURL('https://wa.me/96512345678').catch(() => {
        Alert.alert('خطأ', 'تعذر فتح الواتساب');
      });
    } else {
      router.push(`/chat/company-${id || '1'}`);
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
          <View className="flex-1 items-center justify-center">
            <ActivityIndicator size="large" color="#15304D" />
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
                    <Text className="font-cairo-semibold text-[14px] text-[#6B6A6A]"
                    >
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
                <CompanyServicesTab
                  onRequestQuote={() => quoteModalRef.current?.present()}
                />
              )}

              {activeTab === 'gallery' && <CompanyGalleryTab />}
            </View>
          </ScrollView>
        )}

        {/* ── 4. Fixed Bottom Contact Bar ── */}
        <View
          style={{ paddingBottom: Math.max(insets.bottom, 12) }}
          className="absolute bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-5 pt-3"
        >
          <View className="flex-row items-center justify-between gap-3">
            {/* Phone Call */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleContactAction('phone')}
              className="h-12 flex-1 items-center justify-center rounded-full border border-[#15304D] bg-white"
            >
              <Ionicons name="call-outline" size={20} color="#15304D" />
            </TouchableOpacity>

            {/* WhatsApp */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleContactAction('whatsapp')}
              className="h-12 flex-1 items-center justify-center rounded-full border border-[#22C55E] bg-white"
            >
              <FontAwesome name="whatsapp" size={22} color="#22C55E" />
            </TouchableOpacity>

            {/* Chat / Message */}
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => handleContactAction('chat')}
              className="h-12 flex-1 items-center justify-center rounded-full border border-[#B28648] bg-white"
            >
              <Ionicons name="chatbubble-outline" size={20} color="#B28648" />
            </TouchableOpacity>
          </View>
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
          companyName={company.name}
          onRequestSubmitted={() => {}}
        />
      </ContentContainer>
    </SafeAreaView>
  );
}
