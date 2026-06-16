import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { propertiesService } from '@/core/api/properties.service';
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
import { PropertyDetailsDto } from '@/types/property';

export default function PropertyDetailsScreen() {
  // 1. Hook to get the dynamic ID from the URL
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // --- Real State Management ---
  const [property, setProperty] = useState<PropertyDetailsDto | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        {/* --- Media Header (Scrolls with page) --- */}
        <PropertyMediaHeader
          images={
            property.images && property.images.length > 0
              ? property.images
              : ['https://via.placeholder.com/600x400']
          }
          insets={insets}
          onBack={() => router.back()}
          isFavorite={true}
          onFavorite={() => console.log('Toggle Favorite')}
          onShare={() => console.log('Share Clicked')}
        />

        {/* --- Card 3: Property Specs --- */}
        <PropertyOverview
          type={property.type}
          title={displayTitle}
          price={property.price}
          isFeatured={property.isFeatured}
          timeAgo={formatTimeAgo(property.createdAt)}
          views={property.views}
          area={property.area}
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
            onPress={() => console.log('Open Full Map Modal')}
          />
        </View>

        {/* --- Card 5: Dynamic Details Sections --- */}
        <View className="mt-2">
          <PropertyDetailsBody
            type={property.type}
            description={property.description}
            features={['شارع واحد', 'مصعد', 'جراج']} // fallback features
            exchangeRequirement={undefined}
            additionalCosts={
              property.type === 'RENT'
                ? 'الكهرباء والماء: على المستأجر (غير مشمولة في الإيجار).\nالإنترنت: متوفر اشتراك فايبر (يتحمله المستأجر).'
                : undefined
            }
            rentTerms={
              property.type === 'RENT'
                ? 'الفئة المستهدفة: عائلات فقط.\nمدة العقد: سنة واحدة (تجدد تلقائياً).\nالتأمين: مطلوب تأمين نصف شهر (مسترد عند الإخلاء).'
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
            onPress={() => console.log('Navigate to Host Profile')}
          />
        </View>
      </ScrollView>

      {/* --- 3. Fixed Bottom Action Bar --- */}
      <PropertyActionBar
        insets={insets}
        onWhatsapp={() => console.log('WhatsApp Clicked')}
        onCall={() => console.log('Call Clicked')}
        onChat={() => console.log('Chat Clicked')}
      />
    </View>
  );
}
