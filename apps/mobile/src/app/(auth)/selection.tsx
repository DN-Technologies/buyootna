import { useRouter } from 'expo-router';
import { useState } from 'react';
import { Text, TouchableOpacity,View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import SelectionCard from '@/components/SelectionCard';
import AppLogo from '@/core/components/AppLogo';
import { AccountType } from '@/types';

export default function AccountTypeSelectionScreen() {
  const router = useRouter();
  const [selectedType, setSelectedType] = useState<AccountType>(null);

  const handleStartRegistration = () => {
    if (selectedType === 'individual') {
      router.push('/(auth)/individual-auth');
    } else if (selectedType === 'company') {
      router.push('/(auth)/company-auth');
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <View className="flex-1 px-6 pb-6 pt-12">
        {/* Header Section */}
        <View className="mb-10 items-center">
          <AppLogo width={75} height={100} dark={true} />

          <Text className="mb-2 mt-3 text-center font-cairo-bold text-2xl text-[#111]">
            اختر نوع حسابك للبدء
          </Text>
          <Text className="leading-2 text-center font-cairo-medium text-base text-[#6B6A6A]">
            حدد الطريقة التي تناسبك لاستخدام التطبيق، سواء كنت فرد تبحث أو تنشر
            إعلان، شركة تعرض مشاريعها وخدماتها، أو مالك عقار.
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

          <SelectionCard
            title="شركة"
            description="للمكاتب العقارية والهندسية أو محلات المقاولات التي تقدم خدمات بيع، تسويق، تصميم."
            type="company"
            isSelected={selectedType === 'company'}
            onPress={() => setSelectedType('company')}
          />
        </View>

        {/* Action Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          disabled={!selectedType}
          onPress={handleStartRegistration}
          className={`w-full items-center justify-center rounded-3xl py-4 ${
            selectedType ? 'bg-[#0B2239]' : 'bg-[#A6A6A6]'
          }`}
        >
          <Text
            className={`text-lg font-bold ${
              selectedType ? 'text-white' : 'text-gray-500'
            }`}
          >
            بدء التسجيل
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => router.replace('/(main)/home')} // Sends them straight to the app!
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
