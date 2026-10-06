import { Image as ExpoImage } from 'expo-image';
import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

interface FreeAdsPromoBannerProps {
  freeAdsRemaining: number;
}

export function FreeAdsPromoBanner({ freeAdsRemaining }: FreeAdsPromoBannerProps) {
  const router = useRouter();

  return (
    <View className="mx-5 mt-4 rounded-[8px] border border-[#ECECEC] bg-white p-3">
      <View className="flex-row items-center justify-between">
        <View className="mr-3">
          <ExpoImage
            source={require('@/assets/icons/reviews/emojione_party-popper-icon.svg')}
            style={{ width: 32, height: 32 }}
            contentFit="contain"
          />
        </View>
        <View className="flex-1">
          <Text
            className="font-cairo-semibold text-[14px] text-[#15304D]"
            style={{ writingDirection: 'rtl' }}
          >
            أعلن عن عقارك مجاناً
          </Text>
          <Text
            className="mt-1.5 font-cairo text-[13px] leading-5 text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
          >
            متبقي لديك {freeAdsRemaining} إعلان مجاني جاهز للنشر الآن. استغل
            الفرصة واجذب المشترين.
          </Text>
        </View>
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => router.push('/add-listing')}
        className="mt-3"
      >
        <Text className="text-right font-cairo-bold text-[14px] text-[#15304D]">
          أنشئ إعلانك المجاني الآن
        </Text>
      </TouchableOpacity>
    </View>
  );
}
