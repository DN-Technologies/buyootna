import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import CompanySubmitButton from '../CompanySubmitButton';

/** «لا توجد خدمات بعد» (Figma 4410:169891). */
export default function ServicesEmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <View testID="services-empty" className="flex-1 items-center justify-center px-5 pb-24">
      <View className="w-full items-center gap-4">
        <View className="w-[265px] items-center gap-3">
          <Image
            source={require('@/assets/icons/services/empty-services.svg')}
            style={{ width: 112, height: 77 }}
            contentFit="contain"
          />
          <View className="w-full items-center gap-2">
            <Text className="text-center font-cairo-bold text-[16px] text-[#111111]" style={{ writingDirection: 'rtl' }}>
              لا توجد خدمات بعد
            </Text>
            <Text
              className="text-center font-cairo-semibold text-[14px] leading-[21px] tracking-[0.28px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
            >
              سوف تظهر خدماتك هنا فور اضافتها.
            </Text>
          </View>
        </View>
        <View className="w-full">
          <CompanySubmitButton label="إضافة خدمة" disabled={false} onPress={onAdd} />
        </View>
      </View>
    </View>
  );
}
