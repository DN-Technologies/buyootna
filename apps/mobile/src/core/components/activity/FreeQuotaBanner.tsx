import React from 'react';
import { Text, TouchableOpacity, View } from 'react-native';

interface FreeQuotaBannerProps {
  freeAdsRemaining: number;
  onPressAction: () => void;
}

export default function FreeQuotaBanner({
  freeAdsRemaining,
  onPressAction,
}: FreeQuotaBannerProps) {
  return (
    <View className="mb-6">
      <View className="flex-row items-center justify-between rounded-lg bg-[#F8FAFC] p-4">
        <Text className="relative -top-3 mr-4 text-3xl">🎉</Text>
        <View className="flex-1">
          <Text
            className="font-cairo-semibold text-[14px] text-[#15304D]"
            style={{ writingDirection: 'rtl' }}
          >
            {freeAdsRemaining > 0 ? 'أعلن عن عقارك مجاناً' : 'متبقي لديك 0 إعلان مجاني'}
          </Text>
          <Text
            className="font-cairo text-[12px] leading-5 text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
          >
            {freeAdsRemaining > 0
              ? 'متبقي لديك 1 إعلان مجاني جاهز للنشر الآن. استغل الفرصة واجذب المشترين.'
              : 'استهلكت إعلانك المجاني، رقي حسابك الآن لنشر عدد غير محدود من العقارات.'}
          </Text>
        </View>
      </View>

      {/* Action Button */}
      <TouchableOpacity
        activeOpacity={0.8}
        onPress={onPressAction}
        className="mt-10 h-[50px] w-full items-center justify-center rounded-full bg-[#15304D]"
      >
        <Text className="font-cairo-semibold text-[14px] leading-[24px] text-white">
          {freeAdsRemaining > 0 ? 'أنشئ إعلانك المجاني الآن' : 'اشتر باقة إعلانات'}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
