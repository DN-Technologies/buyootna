import { useLocalSearchParams, useRouter } from 'expo-router';
import { ScrollView, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import ListerProfileSnippet from '@/core/components/ListerProfileSnippet';
import MapPreview from '@/core/components/MapPreview';
import PropertyActionBar from '@/core/components/PropertyActionBar';
import PropertyDetailsBody from '@/core/components/PropertyDetailsBody';
import PropertyMediaHeader from '@/core/components/PropertyMediaHeader';
import PropertyOverview from '@/core/components/PropertyOverview';

export default function PropertyDetailsScreen() {
  // 1. Hook to get the dynamic ID from the URL
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const insets = useSafeAreaInsets();

  // --- Temporary Mock Data (Will replace with API fetch in later cards) ---
  const mockProperty = {
    id: id,
    type: 'SALE', // Try changing this to 'EXCHANGE' to see the fallback!
    images: [
      'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1600607687931-ce8309e0fb73?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80',
    ],
  };

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
          images={mockProperty.images}
          insets={insets}
          onBack={() => router.back()}
          isFavorite={true}
          onFavorite={() => console.log('Toggle Favorite')}
          onShare={() => console.log('Share Clicked')}
        />

        {/* --- Card 3: Property Specs --- */}
        <PropertyOverview
          type="SALE" // Change this to "EXCHANGE" to test the dynamic switch!
          title="شقة للبيع"
          price={150000}
          isFeatured={true}
          timeAgo="منذ ساعتين"
          views={50}
          area={200}
          location="السالمية، شارع 2، بناية 10، شقة 4"
          floor={4}
          beds={3}
          baths={2}
          requestYear="2021"
          requiredYear="2025"
        />

        {/* --- Card 4: Map Preview --- */}
        <View className="mt-4">
          <MapPreview
            location="السالمية، شارع 2، بناية 10، شقة 4"
            onPress={() => console.log('Open Full Map Modal')}
          />
        </View>

        {/* --- Card 5: Dynamic Details Sections --- */}
        <View className="mt-2">
          <PropertyDetailsBody
            type="SALE" // Change to RENT or EXCHANGE to test!
            description="شقة فاخرة للبيع في قلب السالمية. تتميز بتصميم معماري حديث وتشطيبات سوبر ديلوكس. الشقة تقع في الدور الـ 4 مما يوفر إطلالة بانورامية. موقع البرج حيوي جداً وقريب من المجمعات التجارية والخدمات الرئيسية."
            features={['شارع واحد', 'مصعد', 'جراج']}
            // Try changing type to 'EXCHANGE' to see this:
            exchangeRequirement="أرغب بالبدل في منطقة جابر الأحمد أو المنطقة العاشرة. يفضل زاوية أو شارع واحد. مستعد للتفاوض مع المواقع المميزة."
            // Try changing type to 'RENT' to see these:
            additionalCosts={`الكهرباء والماء: على المستأجر (غير مشمولة في الإيجار).\nالإنترنت: متوفر اشتراك فايبر (يتحمله المستأجر).`}
            rentTerms={`الفئة المستهدفة: عائلات فقط.\nمدة العقد: سنة واحدة (تجدد تلقائياً).\nالتأمين: مطلوب تأمين نصف شهر (مسترد عند الإخلاء).`}
          />
        </View>

        {/* --- Card 6: Lister/Host Profile Snippet --- */}
        <View className="mt-4 px-5">
          <ListerProfileSnippet
            name="نواف الجارحي"
            joinedDate="06/2026"
            rating={3.5}
            avatarUrl="https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=200&q=80"
            isVerified={true}
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
