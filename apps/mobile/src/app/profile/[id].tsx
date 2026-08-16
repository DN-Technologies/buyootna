import { Feather } from '@expo/vector-icons';
import { BottomSheetModal } from '@gorhom/bottom-sheet';
import { Image as ExpoImage } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import {
  Alert,
  FlatList,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import apiClient from '@/shared/api/api';
import ContentContainer from '@/shared/components/ContentContainer';
import AddReviewSheet from '@/shared/components/profile/AddReviewSheet';
import {
  FilterBottomSheet,
  SortBottomSheet,
} from '@/shared/components/profile/ProfileFilterSheet';
import ProfileHeaderCard from '@/shared/components/profile/ProfileHeaderCard';
import ProfileTabNavigation from '@/shared/components/profile/ProfileTabNavigation';
import ReviewCardItem from '@/shared/components/profile/ReviewCardItem';
import ReviewsSummarySection from '@/shared/components/profile/ReviewsSummarySection';
import {
  ReviewItem,
  SEEDED_REVIEWS,
  UserProfile,
} from '@/shared/components/profile/types';
import PropertyActionBar from '@/shared/components/PropertyActionBar';
import PropertyCard from '@/shared/components/PropertyCard';
import PropertyListItem from '@/shared/components/PropertyListItem';
import PropertySkeleton from '@/shared/components/skeletons/PropertySkeleton';
import PublicProfileHeaderSkeleton from '@/shared/components/skeletons/PublicProfileHeaderSkeleton';
import { useAuthStore } from '@/shared/store/useAuthStore';
import { PropertyDto } from '@/types/feed';

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const currentUser = useAuthStore((state) => state.user);
  const identities = useAuthStore((state) => state.identities);
  // `id` here is actually the owning Identity's id (see property host.id),
  // not the User id, so compare against the current user's identities.
  const isOwnProfile =
    currentUser?.id === id || identities.some((identity) => identity.id === id);

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [reviews, setReviews] = useState<ReviewItem[]>(SEEDED_REVIEWS);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>(
    'listings',
  );
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');
  const [propertyFilter, setPropertyFilter] = useState('all');
  const [propertySort, setPropertySort] = useState('all');
  const [reviewSummary, setReviewSummary] = useState<{
    averageRating: number;
    totalRatingsCount: number;
    ratingBreakdown: { star: number; pct: string }[];
  }>({
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

  const addReviewSheetRef = useRef<BottomSheetModal>(null);
  const filterSheetRef = useRef<BottomSheetModal>(null);
  const sortSheetRef = useRef<BottomSheetModal>(null);

  // Load User Info, Properties & Reviews
  useEffect(() => {
    if (!id) return;

    const fetchProfileData = async () => {
      try {
        const response = await apiClient.get(`/users/${id}`);
        const user = response.data;

        let name = 'مستخدم بيوتنا';
        let avatarUrl = 'https://via.placeholder.com/150';

        if (user.role === 'COMPANY' && user.companyProfile) {
          name = user.companyProfile.name || name;
          avatarUrl = user.companyProfile.logoUrl || avatarUrl;
        } else if (user.role === 'OFFICE' && user.officeProfile) {
          name = user.officeProfile.name || name;
          avatarUrl = user.officeProfile.logoUrl || avatarUrl;
        } else if (user.name) {
          name = user.name;
          avatarUrl = user.avatarUrl || avatarUrl;
        } else {
          name = user.email ? user.email.split('@')[0] : 'مستخدم';
        }

        const date = new Date(user.createdAt);
        const joinedDate = `${date.getMonth() + 1}/${date.getFullYear()}`;

        setUserProfile({
          id: user.id,
          name,
          avatarUrl,
          rating: 4.5,
          phone: user.phone,
          joinedDate,
          role: user.role,
        });
      } catch (error) {
        console.error('Failed to load user profile:', error);
        Alert.alert('خطأ', 'فشل تحميل بيانات المستخدم');
      } finally {
        setIsLoadingProfile(false);
      }
    };

    const fetchUserProperties = async () => {
      try {
        const response = await apiClient.get('/properties', {
          params: { identityId: id, limit: 100 },
        });
        setProperties(response.data.data || []);
      } catch (error) {
        console.error('Failed to load user properties:', error);
      } finally {
        setIsLoadingProperties(false);
      }
    };

    const fetchUserReviews = async () => {
      try {
        const res = await apiClient.get(`/users/${id}/reviews`, {
          params: { sort: propertySort },
        });
        if (res.data?.data) {
          setReviews(res.data.data);
        }
      } catch (error) {
        console.error('Failed to load user reviews:', error);
      }
    };

    const fetchReviewSummary = async () => {
      try {
        const res = await apiClient.get(`/users/${id}/reviews/summary`);
        if (res.data) {
          setReviewSummary(res.data);
        }
      } catch (error) {
        console.error('Failed to load review summary:', error);
      }
    };

    fetchProfileData();
    fetchUserProperties();
    fetchUserReviews();
    fetchReviewSummary();
  }, [id, propertySort]);

  // Action Bar Handlers
  const handleWhatsapp = () => {
    if (!userProfile?.phone) {
      Alert.alert('تنبيه', 'لا يوجد رقم هاتف متاح');
      return;
    }
    let cleaned = userProfile.phone.replace(/[^0-9+]/g, '');
    if (
      cleaned.length === 8 &&
      !cleaned.startsWith('+') &&
      !cleaned.startsWith('965')
    ) {
      cleaned = `965${cleaned}`;
    } else if (cleaned.startsWith('+')) {
      cleaned = cleaned.substring(1);
    }
    const url = `whatsapp://send?phone=${cleaned}`;
    Linking.openURL(url).catch(() => {
      Linking.openURL(`https://wa.me/${cleaned}`).catch(() => {
        Alert.alert('خطأ', 'تعذر فتح تطبيق الواتساب');
      });
    });
  };

  const handleCall = () => {
    if (!userProfile?.phone) {
      Alert.alert('تنبيه', 'لا يوجد رقم هاتف متاح');
      return;
    }
    let cleaned = userProfile.phone.replace(/[^0-9+]/g, '');
    Linking.openURL(`tel:${cleaned}`).catch(() => {
      Alert.alert('خطأ', 'تعذر إجراء المكالمة الهاتفية');
    });
  };

  const handleChat = async () => {
    if (!userProfile) return;
    try {
      const response = await apiClient.post('/chat/conversation', {
        participantId: userProfile.id,
      });
      router.push(`/chat/${response.data.id}`);
    } catch (error) {
      console.error('Failed to start chat conversation:', error);
      Alert.alert('خطأ', 'فشل بدء المحادثة');
    }
  };

  const handleAddReview = () => {
    addReviewSheetRef.current?.present();
  };

  const handleReviewSubmit = async (commentText: string, rating: number) => {
    try {
      await apiClient.post(`/users/${id}/reviews`, {
        comment: commentText,
        rating,
      });
      Alert.alert('نجاح', 'تمت إضافة تقييمك بنجاح');

      // Re-fetch reviews & summary
      const [resReviews, resSummary] = await Promise.all([
        apiClient.get(`/users/${id}/reviews`, {
          params: { sort: propertySort },
        }),
        apiClient.get(`/users/${id}/reviews/summary`),
      ]);
      if (resReviews.data?.data) setReviews(resReviews.data.data);
      if (resSummary.data) setReviewSummary(resSummary.data);
    } catch (error: any) {
      const msg = error.response?.data?.message || 'فشل إضافة التقييم';
      Alert.alert(
        'خطأ',
        typeof msg === 'string' ? msg : msg[0] || 'فشل إضافة التقييم',
      );
    }
  };

  const handleToggleLike = async (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== reviewId) return r;
        const wasLiked = r.userLiked;
        return {
          ...r,
          userLiked: !wasLiked,
          likes: wasLiked ? r.likes - 1 : r.likes + 1,
          ...(wasLiked
            ? {}
            : {
                userDisliked: false,
                dislikes: r.userDisliked ? r.dislikes - 1 : r.dislikes,
              }),
        };
      }),
    );

    try {
      await apiClient.post(`/reviews/${reviewId}/like`);
    } catch (error) {
      console.error('Failed to toggle like:', error);
    }
  };

  const handleToggleDislike = async (reviewId: string) => {
    setReviews((prev) =>
      prev.map((r) => {
        if (r.id !== reviewId) return r;
        const wasDisliked = r.userDisliked;
        return {
          ...r,
          userDisliked: !wasDisliked,
          dislikes: wasDisliked ? r.dislikes - 1 : r.dislikes + 1,
          ...(wasDisliked
            ? {}
            : { userLiked: false, likes: r.userLiked ? r.likes - 1 : r.likes }),
        };
      }),
    );

    try {
      await apiClient.post(`/reviews/${reviewId}/dislike`);
    } catch (error) {
      console.error('Failed to toggle dislike:', error);
    }
  };

  const renderHeader = () => {
    if (isLoadingProfile || !userProfile) {
      return <PublicProfileHeaderSkeleton />;
    }

    return (
      <View className="mb-4">
        {/* Modular Header Card */}
        <ProfileHeaderCard
          userProfile={userProfile}
          propertiesCount={properties.length}
        />

        {/* Modular Navigation Tabs */}
        <ProfileTabNavigation
          activeTab={activeTab}
          onTabChange={setActiveTab}
        />

        {/* Tab-specific Controls */}
        {activeTab === 'listings' && properties.length > 0 && (
          <View className="mt-4 flex-row items-center justify-between px-5">
            <View className="flex-row items-center gap-1 rounded-xl bg-[#F5F7F9] p-1">
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setViewMode('list')}
                className={`h-8 flex-row items-center justify-center rounded-lg px-3 ${
                  viewMode === 'list' ? 'bg-[#15304D]' : 'bg-transparent'
                }`}
              >
                <Feather
                  name="list"
                  color={viewMode === 'list' ? '#FFFFFF' : '#6B6A6A'}
                  size={14}
                />
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => setViewMode('card')}
                className={`h-8 flex-row items-center justify-center rounded-lg px-3 ${
                  viewMode === 'card' ? 'bg-[#15304D]' : 'bg-transparent'
                }`}
              >
                <Feather
                  name="grid"
                  color={viewMode === 'card' ? '#FFFFFF' : '#6B6A6A'}
                  size={14}
                />
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => filterSheetRef.current?.present()}
              className="flex-row items-center gap-1.5"
            >
              <Feather name="sliders" size={16} color="#6B6A6A" />
              <Text className="font-cairo-semibold text-sm text-[#6B6A6A]">
                تصفية
              </Text>
            </TouchableOpacity>
          </View>
        )}

        {activeTab === 'reviews' && (
          <ReviewsSummarySection
            onAddReview={handleAddReview}
            onSortPress={() => sortSheetRef.current?.present()}
            averageRating={reviewSummary.averageRating}
            totalRatingsCount={reviewSummary.totalRatingsCount}
            ratingBreakdown={reviewSummary.ratingBreakdown}
            isOwnProfile={isOwnProfile}
          />
        )}
      </View>
    );
  };

  const renderEmpty = () => {
    if (isLoadingProperties) {
      return (
        <View className="mt-2 px-5">
          {[1, 2].map((key) => (
            <PropertySkeleton key={key} cardWidth="100%" />
          ))}
        </View>
      );
    }

    if (activeTab === 'reviews') {
      return (
        <View className="items-center justify-center px-5 py-20">
          <Feather name="star" size={48} color="#94A3B8" />
          <Text className="mt-4 font-cairo-bold text-base text-[#111111]">
            لا توجد تقييمات حالياً
          </Text>
          <Text className="mt-2 text-center font-cairo text-sm text-[#6B6A6A]">
            لم يقم أحد بتقييم هذا المستخدم بعد.
          </Text>
        </View>
      );
    }

    return (
      <View className="items-center justify-center px-5 py-20">
        <Feather name="home" size={48} color="#94A3B8" />
        <Text className="mt-4 font-cairo-bold text-base text-[#111111]">
          لا توجد إعلانات نشطة
        </Text>
        <Text className="mt-2 text-center font-cairo text-sm text-[#6B6A6A]">
          هذا المستخدم لم يقم بإضافة أي عقارات معروضة حالياً.
        </Text>
      </View>
    );
  };

  return (
    <View className="flex-1 bg-white">
      <ContentContainer className="flex-1">
        {/* Header Bar */}
        <View
          style={{ flexDirection: 'row', paddingTop: insets.top + 4 }}
          className="w-full flex-row items-center justify-between bg-white px-5 pb-4"
        >
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => router.back()}
            className="p-2"
          >
            <ExpoImage
              source={require('@/assets/icons/arrow-back.svg')}
              style={{ width: 10, height: 14, tintColor: '#111111' }}
              contentFit="contain"
            />
          </TouchableOpacity>

          <TouchableOpacity activeOpacity={0.8}>
            <Feather name="more-vertical" size={20} color="#111111" />
          </TouchableOpacity>
        </View>

        {/* Main Content Area */}
        <FlatList
          data={
            activeTab === 'listings'
              ? (properties as any[])
              : (reviews
                  .slice()
                  .sort((a, b) => {
                    if (propertySort === 'rating_desc') return b.rating - a.rating;
                    if (propertySort === 'rating_asc') return a.rating - b.rating;
                    return 0;
                  }) as any[])
          }
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderHeader}
          ListEmptyComponent={renderEmpty}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 85,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) =>
            activeTab === 'listings' ? (
              <View className="mt-2 px-5">
                {viewMode === 'list' ? (
                  <PropertyListItem
                    id={item.id}
                    price={item.price}
                    companyName={item.companyName}
                    isFeatured={item.isFeatured}
                    categoryLabel={item.categoryLabel}
                    beds={item.beds}
                    area={item.area}
                    location={item.location}
                    propertyIncome={item.propertyIncome}
                    onShowDetails={() => router.push(`/property/${item.id}`)}
                  />
                ) : (
                  <PropertyCard
                    id={item.id}
                    images={item.images}
                    price={item.price}
                    companyName={item.companyName}
                    isFeatured={item.isFeatured}
                    type={item.type}
                    area={item.area}
                    beds={item.beds}
                    baths={item.baths}
                    location={item.location}
                  />
                )}
              </View>
            ) : (
              <ReviewCardItem
                item={item as ReviewItem}
                onToggleLike={handleToggleLike}
                onToggleDislike={handleToggleDislike}
              />
            )
          }
        />

        {/* Fixed Bottom Action Bar */}
        {userProfile && !isOwnProfile && (
          <ContentContainer className="absolute bottom-0 z-50 w-full bg-white">
            <PropertyActionBar
              insets={insets}
              onWhatsapp={handleWhatsapp}
              onCall={handleCall}
              onChat={handleChat}
            />
          </ContentContainer>
        )}

        <AddReviewSheet ref={addReviewSheetRef} onSubmit={handleReviewSubmit} />

        <FilterBottomSheet
          ref={filterSheetRef}
          selectedValue={propertyFilter}
          onSelect={setPropertyFilter}
        />

        <SortBottomSheet
          ref={sortSheetRef}
          selectedValue={propertySort}
          onSelect={setPropertySort}
        />
      </ContentContainer>
    </View>
  );
}
