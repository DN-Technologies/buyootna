import { Feather, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { Image as ExpoImage } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Image,
  Linking,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import apiClient from '@/core/api/api';
import ContentContainer from '@/core/components/ContentContainer';
import PropertyActionBar from '@/core/components/PropertyActionBar';
import PropertyCard from '@/core/components/PropertyCard';
import PropertyListItem from '@/core/components/PropertyListItem';
import PropertySkeleton from '@/core/components/skeletons/PropertySkeleton';
import { PropertyDto } from '@/types/feed';

interface UserProfile {
  id: string;
  name: string;
  avatarUrl: string;
  rating: number;
  phone: string;
  joinedDate: string;
  role: 'INDIVIDUAL' | 'COMPANY' | 'OFFICE';
}

export default function UserProfileScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [properties, setProperties] = useState<PropertyDto[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [isLoadingProperties, setIsLoadingProperties] = useState(true);
  const [activeTab, setActiveTab] = useState<'listings' | 'reviews'>(
    'listings',
  );
  const [viewMode, setViewMode] = useState<'card' | 'list'>('list');

  // Load User Info & Properties
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
          params: { userId: id, limit: 100 },
        });
        setProperties(response.data.data || []);
      } catch (error) {
        console.error('Failed to load user properties:', error);
      } finally {
        setIsLoadingProperties(false);
      }
    };

    fetchProfileData();
    fetchUserProperties();
  }, [id]);

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
      // Direct call to start chat with lister
      const response = await apiClient.post('/chat/conversation', {
        participantId: userProfile.id,
      });
      router.push(`/chat/${response.data.id}`);
    } catch (error) {
      console.error('Failed to start chat conversation:', error);
      Alert.alert('خطأ', 'فشل بدء المحادثة');
    }
  };

  // Header render helpers
  const renderProfileHeader = () => {
    if (isLoadingProfile || !userProfile) {
      return (
        <View className="items-center py-10">
          <ActivityIndicator size="large" color="#15304D" />
        </View>
      );
    }

    return (
      <View className="mb-4">
        {/* Cover Image Placeholder */}
        <View className="mx-5 h-24 rounded-t-md bg-[#15304D]" />
        {/* Profile Card Overlay */}
        <View
          className="mx-5 -mt-10 rounded-b-md border border-gray-100 bg-white p-5 shadow-sm"
          style={{
            elevation: 2,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
          }}
        >
          {/* Overlapping Avatar (Positioned absolutely on the right) */}
          <View className="absolute -top-10 left-5 z-10 h-20 w-20 overflow-hidden rounded-2xl border-4 border-white bg-slate-100 shadow-sm">
            <Image
              source={{ uri: userProfile.avatarUrl }}
              className="h-full w-full"
              resizeMode="cover"
            />
          </View>

          {/* Spacer to push content below the absolute avatar */}
          <View className="h-10" />

          {/* Name, Rating & Status Badge Row (Explicitly right-to-left flexDirection) */}
          <View
            style={{ flexDirection: 'row' }}
            className="mt-3 items-start justify-between"
          >
            {/* Right side: Name & Rating (Explicitly right-aligned) */}
            <View>
              <View
                style={{ flexDirection: 'row' }}
                className="items-center gap-1"
              >
                <Text className="text-right font-cairo-bold text-lg text-[#111111]">
                  {userProfile.name}
                </Text>
                {userProfile.role !== 'INDIVIDUAL' && (
                  <MaterialIcons name="verified" size={16} color="#018B1B" />
                )}
              </View>

              <View
                style={{ flexDirection: 'row' }}
                className="mt-0.5 items-center gap-1"
              >
                <FontAwesome
                  name="star"
                  size={14}
                  color="#F59E0B"
                  className="relative -top-1"
                />
                <Text className="font-sans text-sm text-[#111111]">
                  {userProfile.rating}
                </Text>
                <Text className="mr-1 font-cairo text-xs text-[#6B6A6A]">
                  (214 تقييم)
                </Text>
              </View>
            </View>

            {/* Left side: Active Status Badge (Explicitly left-aligned layout) */}
            <View
              style={{ flexDirection: 'row' }}
              className="items-center gap-1 rounded-full px-3 py-1"
            >
              <View className="h-2 w-2 rounded-full bg-[#15A72B]" />
              <Text className="font-cairo text-xs leading-[24px] text-[#15A72B]">
                نشط الآن
              </Text>
            </View>
          </View>

          {/* Stats Bar Component (Explicitly right-to-left layout) */}
          <View
            style={{ flexDirection: 'row' }}
            className="mt-4 items-center justify-between rounded-xl bg-[#F8F9FC] p-4"
          >
            <View className="flex-1 items-center">
              <Text className="font-sans text-sm font-bold text-[#111111]">
                {properties.length}
              </Text>
              <Text className="mt-0.5 font-cairo text-[10px] text-[#6B6A6A]">
                الإعلانات
              </Text>
            </View>
            <View className="h-6 w-[1px] bg-slate-200" />
            <View className="flex-1 items-center">
              <Text className="font-sans text-sm font-bold text-[#111111]">
                2
              </Text>
              <Text className="mt-0.5 font-cairo text-[10px] text-[#6B6A6A]">
                العقارات المباعة
              </Text>
            </View>
            <View className="h-6 w-[1px] bg-slate-200" />
            <View className="flex-1 items-center">
              <Text className="font-cairo-bold text-[11px] text-[#111111]">
                30 دقيقة
              </Text>
              <Text className="mt-0.5 font-cairo text-[10px] text-[#6B6A6A]">
                سرعة الرد
              </Text>
            </View>
          </View>
        </View>

        {/* Dynamic Navigation Tabs */}
        <View className="mt-6 flex-row items-center border-b border-gray-200 px-5">
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
              className={`text-sm ${
                activeTab === 'listings'
                  ? 'font-cairo-bold text-[#15304D]'
                  : 'font-cairo-medium text-[#6B6A6A]'
              }`}
            >
              الإعلانات
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('reviews')}
            className={`flex-1 items-center border-b-2 pb-3 ${
              activeTab === 'reviews'
                ? 'border-[#15304D]'
                : 'border-transparent'
            }`}
          >
            <Text
              className={`text-sm ${
                activeTab === 'reviews'
                  ? 'font-cairo-bold text-[#15304D]'
                  : 'font-cairo-medium text-[#6B6A6A]'
              }`}
            >
              التقييمات
            </Text>
          </TouchableOpacity>
        </View>

        {/* Tab-specific Filters header */}
        {activeTab === 'listings' && properties.length > 0 && (
          <View className="mt-4 flex-row items-center justify-between px-5">
            {/* View Mode buttons */}
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
            <View className="flex-row items-center gap-1.5">
              <Feather name="sliders" size={16} color="#6B6A6A" />
              <Text className="font-cairo-semibold text-sm text-[#6B6A6A]">
                تصفية
              </Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderEmptyComponent = () => {
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
          data={activeTab === 'listings' ? properties : []}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={renderProfileHeader}
          ListEmptyComponent={renderEmptyComponent}
          contentContainerStyle={{
            paddingBottom: insets.bottom + 85,
          }}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View className="mt-2 px-5">
              {viewMode === 'list' ? (
                <PropertyListItem
                  id={item.id}
                  price={item.price}
                  companyName={item.companyName}
                  isFeatured={item.isFeatured}
                  category={item.type}
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
          )}
        />

        {/* Fixed Bottom Action Bar */}
        {userProfile && (
          <ContentContainer className="absolute bottom-0 z-50 w-full bg-white">
            <PropertyActionBar
              insets={insets}
              onWhatsapp={handleWhatsapp}
              onCall={handleCall}
              onChat={handleChat}
            />
          </ContentContainer>
        )}
      </ContentContainer>
    </View>
  );
}
