import { Feather, FontAwesome, Ionicons } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useCallback, useEffect, useRef, useState } from 'react';
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

import { OfficeHeaderData,officeService } from '@/shared/api/office.service';
import { reviewsService } from '@/shared/api/reviews.service';
import { CompanyServiceItemData } from '@/shared/components/company/CompanyServicesTab';
import { WorkingHourItem } from '@/shared/components/company/CompanyWorkingHours';
import QuoteRequestModal from '@/shared/components/company/QuoteRequestModal';
import ContentContainer from '@/shared/components/ContentContainer';
import OfficeHeaderCard from '@/shared/components/office/OfficeHeaderCard';
import OfficeListingsTab from '@/shared/components/office/OfficeListingsTab';
import OfficeServicesTab from '@/shared/components/office/OfficeServicesTab';
import OfficeWorkingHours from '@/shared/components/office/OfficeWorkingHours';
import AddReviewSheet from '@/shared/components/profile/AddReviewSheet';
import {
  FilterBottomSheet,
  SortBottomSheet,
} from '@/shared/components/profile/ProfileFilterSheet';
import ReviewCardItem from '@/shared/components/profile/ReviewCardItem';
import ReviewsSummarySection from '@/shared/components/profile/ReviewsSummarySection';
import { ReviewItem, SEEDED_REVIEWS } from '@/shared/components/profile/types';
import { PropertyDto } from '@/types/feed';

type OfficeTab = 'about' | 'services' | 'listings';

export default function OfficeProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [office, setOffice] = useState<OfficeHeaderData | null>(null);
  const [services, setServices] = useState<CompanyServiceItemData[]>([]);
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [workingHours, setWorkingHours] = useState<WorkingHourItem[] | undefined>(
    undefined,
  );
  const [activeTab, setActiveTab] = useState<OfficeTab>('about');
  const [isLoading, setIsLoading] = useState(true);
  const [propertyFilter, setPropertyFilter] = useState('all');

  // Reviews state
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
  const filterSheetRef = useRef<BottomSheetModal>(null);
  const quoteModalRef = useRef<BottomSheetModal>(null);

  // Load office details & reviews
  const loadOfficeData = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    try {
      const data = await officeService.getOfficeDetails(String(id));
      setOffice(data);
      setServices(data.services || []);
      setProperties(data.properties || []);
      setWorkingHours(data.workingHours);

      const targetUserId = data.userId || String(id);
      try {
        const [sumRes, revRes] = await Promise.all([
          reviewsService.getSummary(targetUserId),
          reviewsService.getReviews(targetUserId, reviewSort),
        ]);
        if (sumRes) setReviewSummary(sumRes);
        if (revRes?.data?.length > 0) setReviews(revRes.data);
      } catch (revErr) {
        console.log('Error loading reviews for office:', revErr);
      }
    } catch (error) {
      console.error('Failed to load office details:', error);
      // Fallback mock office profile if API fails
      setOffice({
        id: String(id),
        name: 'المنار للعقارات',
        logoUrl:
          'https://images.unsplash.com/photo-1560179707-f14e90ef3623?q=80&w=400',
        isVerified: true,
        isActiveNow: true,
        rating: 3.5,
        reviewsCount: 214,
        bio: 'مكتب متخصص في بيع وتأجير العقارات السكنية والتجارية مع خدمات استشارية متكاملة.',
        location: 'السالمية • شمال غرب صليبيخات',
        licenseNumber: '2454685',
        listingsCount: 20,
        servicesCount: 2,
        responseTime: '30 دقيقة',
        instagramUrl: 'https://instagram.com',
        twitterUrl: 'https://x.com',
        phone: '+96512345678',
        whatsapp: '+96512345678',
      });
    } finally {
      setIsLoading(false);
    }
  }, [id, reviewSort]);

  useEffect(() => {
    loadOfficeData();
  }, [loadOfficeData]);

  const handleAddReview = async (comment: string, rating: number) => {
    const targetUserId = office?.userId || String(id);
    try {
      await reviewsService.addReview(targetUserId, rating, comment);
      Alert.alert('تم بنجاح', 'تم إضافة تقييمك بنجاح');

      const [sumRes, revRes] = await Promise.all([
        reviewsService.getSummary(targetUserId),
        reviewsService.getReviews(targetUserId, reviewSort),
      ]);
      if (sumRes) setReviewSummary(sumRes);
      if (revRes?.data?.length > 0) setReviews(revRes.data);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'تعذر إضافة التقييم';
      Alert.alert('خطأ', msg);
    }
  };

  const handleToggleLike = async (revId: string) => {
    setReviews((prev) =>
      prev.map((r) =>
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
    );
    try {
      await reviewsService.toggleLike(revId);
    } catch (error) {
      console.error('Error toggling like:', error);
    }
  };

  const handleToggleDislike = async (revId: string) => {
    setReviews((prev) =>
      prev.map((r) =>
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
    );
    try {
      await reviewsService.toggleDislike(revId);
    } catch (error) {
      console.error('Error toggling dislike:', error);
    }
  };

  const handleContactAction = (type: 'phone' | 'whatsapp' | 'chat') => {
    const phoneNumber = office?.phone || office?.whatsapp;
    if (type === 'phone') {
      if (phoneNumber) {
        Linking.openURL(`tel:${phoneNumber}`).catch(() => {
          Alert.alert('خطأ', 'تعذر إجراء المكالمة الهاتفية');
        });
      } else {
        Alert.alert('تنبيه', 'رقم الهاتف غير متوفر');
      }
    } else if (type === 'whatsapp') {
      if (phoneNumber) {
        const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
        Linking.openURL(`https://wa.me/${cleanNumber}`).catch(() => {
          Alert.alert('خطأ', 'تعذر فتح الواتساب');
        });
      } else {
        Alert.alert('تنبيه', 'رقم الواتساب غير متوفر');
      }
    } else {
      const chatTarget = office?.userId || id;
      router.push(`/chat/${chatTarget}`);
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
                { text: 'إبلاغ عن المكتب', style: 'destructive' },
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
        ) : !office ? (
          <View className="flex-1 items-center justify-center p-5">
            <Text className="font-cairo-bold text-base text-[#111111]">
              لم يتم العثور على المكتب
            </Text>
          </View>
        ) : (
          <ScrollView
            className="flex-1"
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 110 }}
          >
            <View className="px-5 pt-4">
              {/* ── 1. Office Header Card ── */}
              <OfficeHeaderCard office={office} />

              {/* ── 2. 3-Tab Navigation Switcher ── */}
              <View className="mb-6 flex-row items-center border-b border-gray-200">
                {/* Tab 1: About Office (عن المكتب) */}
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
                    عن المكتب
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

                {/* Tab 3: Listings / Ads (الإعلانات) */}
                <TouchableOpacity
                  activeOpacity={0.8}
                  onPress={() => setActiveTab('listings')}
                  className={`flex-1 items-center border-b-2 pb-3 ${
                    activeTab === 'listings'
                      ? 'border-[#15304D]'
                      : 'border-transparent'
                  }`}
                >
                  <Text
                    className={`font-cairo-bold text-base ${
                      activeTab === 'listings'
                        ? 'text-[#15304D]'
                        : 'text-[#6B6A6A]'
                    }`}
                  >
                    الإعلانات
                  </Text>
                </TouchableOpacity>
              </View>

              {/* ── 3. Tab Contents ── */}
              {activeTab === 'about' && (
                <View>
                  {/* License Number & Working Hours */}
                  <OfficeWorkingHours
                    licenseNumber={office.licenseNumber}
                    schedule={workingHours}
                  />

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

                  {/* Show More Reviews Button */}
                  {visibleReviewsCount < reviews.length && (
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() =>
                        setVisibleReviewsCount((prev) => prev + 3)
                      }
                      className="mt-6 self-center rounded-full border border-gray-200 bg-white px-6 py-2.5"
                    >
                      <Text className="font-cairo-semibold text-xs text-[#111111]">
                        عرض المزيد
                      </Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}

              {activeTab === 'services' && (
                <OfficeServicesTab
                  services={services}
                  onRequestQuote={() => quoteModalRef.current?.present()}
                />
              )}

              {activeTab === 'listings' && (
                <OfficeListingsTab
                  properties={properties}
                  onFilterPress={() => filterSheetRef.current?.present()}
                />
              )}
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
        <FilterBottomSheet
          ref={filterSheetRef}
          selectedValue={propertyFilter}
          onSelect={setPropertyFilter}
        />
        <QuoteRequestModal
          ref={quoteModalRef}
          companyName={office?.name || 'المكتب'}
          onRequestSubmitted={() => {}}
        />
      </ContentContainer>
    </SafeAreaView>
  );
}
