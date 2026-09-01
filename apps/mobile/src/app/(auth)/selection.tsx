import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppLogo from '@/shared/components/AppLogo';
import SelectionCard from '@/shared/components/SelectionCard';
import { getIdentityHomeRoute } from '@/shared/navigation/getIdentityHomeRoute';
import { AccountType } from '@/types';

export default function AccountTypeSelectionScreen() {
  const [selectedType, setSelectedType] = useState<AccountType>(null);

  const handleStartRegistration = () => {
    if (selectedType === 'individual') {
      router.push({
        pathname: '/(auth)/individual-auth',
        params: { mode: 'signup' },
      } as any);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      {/* Header Back Button */}
      <View className="px-6 pt-2">
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.back()}
          className="mr-auto p-2 -ml-2"
          testID="selection-back-button"
        >
          <Image
            source={require('@/assets/icons/arrow-back.svg')}
            style={{ width: 12, height: 16 }}
          />
        </TouchableOpacity>
      </View>

      <View className="flex-1 px-6 pb-6 pt-4">
        {/* Header Section */}
        <View className="mb-10 items-center">
          <AppLogo width={80} height={80} />

          <Text className="mb-2 mt-3 text-center font-cairo-bold text-2xl text-[#111]">
            اختر نوع حسابك للبدء
          </Text>
          <Text className="leading-2 text-center font-cairo-medium text-base text-[#6B6A6A]">
            حدد الطريقة التي تناسبك لاستخدام التطبيق، سواء كنت فرد تبحث أو تنشر
            إعلان.
          </Text>
        </View>

        {/* Selection Cards */}
        <View className="flex-1">
          <SelectionCard
            title="فرد"
            description="للأشخاص الراغبين في إضافة إعلان بيع أو إيجار أو بدل لعقاراتهم الخاص."
            type="individual"
            isSelected={selectedType === 'individual'}
            onPress={() => setSelectedType('individual')}
          />
        </View>

        {/* Action Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={!selectedType}
          onPress={handleStartRegistration}
          className={`h-[48px] w-full items-center justify-center rounded-3xl ${
            selectedType ? 'bg-[#15304D]' : 'bg-[#A6A6A6]'
          }`}
        >
          <Text
            className={`font-cairo-semibold text-[14px] leading-[24px] ${
              selectedType ? 'text-white' : 'text-gray-500'
            }`}
          >
            بدء التسجيل
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.replace(getIdentityHomeRoute(null))} // Sends them straight to the app!
          className="mt-2 w-full items-center justify-center py-4"
        >
          <Text className="font-cairo-bold text-base text-[#6B6A6A] underline">
            تخطي والمتابعة كزائر
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}
