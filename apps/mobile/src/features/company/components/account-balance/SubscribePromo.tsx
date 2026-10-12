import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

interface SubscribePromoProps {
  // False on iOS, where the app shows the plans but can't sell them
  canPurchase: boolean;
  onBrowsePlans: () => void;
}

/** "حافظ على نمو شركتك": shown while the company has never bought a plan. */
export default function SubscribePromo({
  canPurchase,
  onBrowsePlans,
}: SubscribePromoProps) {
  return (
    <View
      testID="balance-subscribe-promo"
      className="w-full items-center"
      style={{ gap: 16 }}
    >
      <View className="w-full items-center" style={{ gap: 12 }}>
        <Image
          source={require('@/assets/icons/company-balance/sparkles.svg')}
          style={{ width: 112, height: 78 }}
          contentFit="contain"
        />
        <View className="w-full items-center" style={{ gap: 8 }}>
          <Text className="text-center font-cairo-bold text-base text-[#111111]">
            حافظ على نمو شركتك
          </Text>
          <Text
            className="px-2.5 text-center font-cairo-semibold text-sm leading-[21px] text-[#6B6A6A]"
            style={{ letterSpacing: 0.28 }}
          >
            {canPurchase
              ? 'اشترك في إحدى الباقات واستمر في استقبال الطلبات، عرض أعمالك، وإدارة نشاطك دون انقطاع.'
              : 'استمر في استقبال الطلبات، عرض أعمالك، وإدارة نشاطك دون انقطاع.'}
          </Text>
        </View>
      </View>

      <TouchableOpacity
        testID="balance-browse-plans"
        activeOpacity={0.85}
        onPress={onBrowsePlans}
        className="h-11 w-full items-center justify-center rounded-full bg-[#15304D]"
      >
        <Text
          className="font-cairo-semibold text-sm text-white"
          style={{ letterSpacing: 0.28 }}
        >
          استعرض الباقات
        </Text>
      </TouchableOpacity>
    </View>
  );
}
