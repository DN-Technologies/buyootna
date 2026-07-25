import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import {
  Alert,
  Linking,
  ScrollView,
  Share,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { chatService } from '@/core/api/chat.service';
import { propertiesService } from '@/core/api/properties.service';
import AuthGuardSheet from '@/core/components/AuthGuardSheet';
import ContentContainer from '@/core/components/ContentContainer';
import ListerProfileSnippet from '@/core/components/ListerProfileSnippet';
import MapPreview from '@/core/components/MapPreview';
import PropertyActionBar from '@/core/components/PropertyActionBar';
import PropertyDetailsBody from '@/core/components/PropertyDetailsBody';
import PropertyMediaHeader from '@/core/components/PropertyMediaHeader';
import PropertyOverview from '@/core/components/PropertyOverview';
import PropertyDetailSkeleton from '@/core/components/skeletons/PropertyDetailSkeleton';
import {
  formatTimeAgo,
  getArabicCategoryLabel,
  getArabicTypeLabel,
} from '@/core/utils/helpers/property';
import { useAuthGuard } from '@/hooks/useAuthGuard';
import { useAuthStore } from '@/store/useAuthStore';
import { useFavoritesStore } from '@/store/useFavoritesStore';
import { PropertyDetailsDto } from '@/types/property';

export default function PropertyDetailsScreen() {
  // 1. Hook to get the dynamic ID from the URL
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { guardAction, authSheetRef } = useAuthGuard();
  const { user } = useAuthStore();

  // --- Real State Management ---
  const [property, setProperty] = useState<PropertyDetailsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Zustand Favorites Store
  const isFavorite = useFavoritesStore((state) =>
    state.isFavorited(id as string),
  );
  const toggleFavorite = useFavoritesStore((state) => state.toggleFavorite);

  const handleWhatsapp = () => {
    if (!property?.phoneNumber) {
      Alert.alert('تنبيه', 'لا يوجد رقم هاتف متاح لهذا الإعلان');
      return;
    }
    let cleaned = property.phoneNumber.replace(/[^0-9+]/g, '');
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
      const webUrl = `https://wa.me/${cleaned}`;
      Linking.openURL(webUrl).catch(() => {
        Alert.alert('خطأ', 'تعذر فتح تطبيق الواتساب');
      });
    });
  };

  const handleCall = () => {
    if (!property?.phoneNumber) {
      Alert.alert('تنبيه', 'لا يوجد رقم هاتف متاح لهذا الإعلان');
      return;
    }
    let cleaned = property.phoneNumber.replace(/[^0-9+]/g, '');
    const url = `tel:${cleaned}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('خطأ', 'تعذر إجراء المكالمة الهاتفية');
    });
  };

  const handleChat = () => {
    if (!property) return;
    guardAction(async () => {
      if (user && property.host && user.id === property.host.id) {
        Alert.alert('تنبيه', 'لا يمكنك بدء محادثة مع نفسك، هذا الإعلان خاص بك.');
        return;
      }
      try {
        const response = await chatService.createConversation(
          property.host.id,
          property.id,
        );
        router.push(`/chat/${response.id}`);
      } catch (error: any) {
        console.error('Failed to start chat conversation:', error);
        const backendMsg = error?.response?.data?.message;
        const msg = Array.isArray(backendMsg)
          ? backendMsg.join('\n')
          : backendMsg || 'تعذر بدء المحادثة مع البائع';
        Alert.alert('تنبيه', msg);
      }
    });
  };

  const handleShare = async () => {
    if (!property) return;
    const displayTitle = `${getArabicCategoryLabel(property.category)} ${getArabicTypeLabel(property.type)}`;
    try {
      await Share.share({
        title: displayTitle,
        message: `شاهد هذا العقار على بيوتنا:\n${displayTitle}\nالسعر: ${property.price} د.ك\nالموقع: ${property.location}\nالرابط: https://buyootna.cloud/property/${property.id}`,
      });
    } catch (error) {
      console.error('Error sharing property:', error);
    }
  };

  const handleFavoriteToggle = () => {
    if (!property) return;
    guardAction(async () => {
      await toggleFavorite(property.id);
    });
  };

  useEffect(() => {
    const fetchPropertyData = async () => {
      if (!id) return;

      try {
        // 1. Fetch the data to display the UI
        const data = await propertiesService.getPropertyById(id as string);

        // 2. Preload the first image in the background before showing the UI
        if (data.images && data.images.length > 0) {
          try {
            await Image.prefetch(data.images[0]);
          } catch (e) {
            console.warn('Prefetch failed:', e);
          }
        }

        setProperty(data);

        // 3. Silently ping the view counter in the background!
        propertiesService.incrementViews(id as string).catch(() => {
          // Ignore errors gracefully. If the ping fails, the app shouldn't crash.
        });
      } catch (error) {
        console.error('Failed to load property details:', error);
        setError('عذراً، هذا العقار غير موجود أو تم حذفه');
      } finally {
        setIsLoading(false);
      }
    };

    fetchPropertyData();
  }, [id]);

  // --- Loading State ---
  if (isLoading) {
    return <PropertyDetailSkeleton />;
  }

  // --- Error State ---
  if (error || !property) {
    return (
      <View className="flex-1 items-center justify-center bg-[#F8FAFC] px-6">
        <View className="mb-6 h-20 w-20 items-center justify-center rounded-full bg-red-50">
          <Feather name="alert-circle" size={32} color="#EF4444" />
        </View>
        <Text className="mb-2 text-center font-cairo-bold text-2xl text-[#111111]">
          عذراً، حدث خطأ ما
        </Text>
        <Text className="mb-8 px-4 text-center font-cairo-semibold text-base leading-6 text-[#6B6A6A]">
          {error || 'لم نتمكن من العثور على العقار المطلوب'}
        </Text>
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={() => router.back()}
          className="w-full items-center justify-center rounded-3xl bg-[#0B2239] py-4"
        >
          <Text className="font-cairo-bold text-lg text-white">
            الرجوع للخلف
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  const displayTitle = `${getArabicCategoryLabel(property.category)} ${getArabicTypeLabel(property.type)}`;

  return (
    <View className="flex-1 bg-white">
      {/* --- 1. Main Scrollable Content --- */}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }} // Space for the bottom bar
        showsVerticalScrollIndicator={false}
        bounces={false} // Prevents pulling the image down from the top on iOS
      >
        <ContentContainer>
          {/* --- Media Header (Scrolls with page) --- */}
          <PropertyMediaHeader
            images={
              property.images && property.images.length > 0
                ? property.images
                : []
            }
            insets={insets}
            onBack={() => router.back()}
            isFavorite={isFavorite}
            onFavorite={handleFavoriteToggle}
            onShare={handleShare}
          />

          {/* --- Card 3: Property Specs --- */}
          <PropertyOverview
            type={property.type}
            title={displayTitle}
            price={property.price}
            isFeatured={property.isFeatured}
            timeAgo={formatTimeAgo(property.createdAt)}
            views={property.views}
            area={property.areaSize ?? property.area}
            location={property.location}
            floor={property.floors}
            beds={property.beds}
            baths={property.baths}
            requestYear={property.requestYear?.toString()}
            requiredYear={property.requiredYear?.toString()}
            licenseNumber={property.licenseNumber}
            exchangeRequirement={
              property.type === 'EXCHANGE' ? property.description : undefined
            }
          />

          {/* --- Card 4: Map Preview --- */}
          <View className="mt-4">
            <MapPreview
              location={property.location}
              latitude={property.latitude}
              longitude={property.longitude}
            />
          </View>

          {/* --- Card 5: Dynamic Details Sections --- */}
          <View className="mt-2">
            <PropertyDetailsBody
              type={property.type}
              description={property.description}
              features={
                property.features && property.features.length > 0
                  ? property.features.map((f: any) =>
                      typeof f === 'string' ? f : f.label || f.name || f.id,
                    )
                  : []
              }
              exchangeRequirement={
                property.type === 'EXCHANGE'
                  ? property.description
                  : undefined
              }
              additionalCosts={
                property.type === 'RENT'
                  ? property.additionalExpenses || undefined
                  : undefined
              }
              rentTerms={
                property.type === 'RENT'
                  ? property.rentConditions || undefined
                  : undefined
              }
            />
          </View>

          {/* --- Card 6: Lister/Host Profile Snippet --- */}
          <View className="mt-4 px-5">
            <ListerProfileSnippet
              name={property.host.name}
              joinedDate={property.host.joinedDate}
              rating={property.host.rating}
              avatarUrl={property.host.avatarUrl}
              isVerified={property.host.isVerified}
              onPress={() => {
                if (
                  property.host.role === 'COMPANY' ||
                  property.host.role === 'OFFICE'
                ) {
                  Alert.alert('تنبيه', 'تفاصيل الشركة/المكتب ستكون متاحة قريباً');
                } else {
                  router.push(`/profile/${property.host.id}`);
                }
              }}
            />
          </View>

          {/* --- Ad Reference Number --- */}
          {property.referenceNumber && (
            <Text className="my-6 text-center font-cairo-semibold text-sm text-[#6B6A6A]">
              رقم المرجعي للاعلان: {property.referenceNumber}
            </Text>
          )}
        </ContentContainer>
      </ScrollView>

      {/* --- 3. Fixed Bottom Action Bar --- */}
      <ContentContainer className="absolute bottom-0 z-50 w-full bg-white">
        <PropertyActionBar
          insets={insets}
          onWhatsapp={handleWhatsapp}
          onCall={handleCall}
          onChat={handleChat}
        />
      </ContentContainer>

      {/* --- Auth Guard Bottom Sheet --- */}
      <AuthGuardSheet ref={authSheetRef} />
    </View>
  );
}
