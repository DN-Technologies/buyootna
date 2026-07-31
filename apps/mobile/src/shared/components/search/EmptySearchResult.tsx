import { Image } from 'expo-image';
import { Text, TouchableOpacity, View } from 'react-native';

export interface EmptySearchResultProps {
  title?: string;
  subtitle?: string;
  onActivateAlert: () => void;
  onExploreNow: () => void;
}

export default function EmptySearchResult({
  title = 'لا توجد نتائج مطابقة لبحثك',
  subtitle = 'فعل التنبيه ليصلك إشعار عند توفر عقارات بهذه المواصفات.',
  onActivateAlert,
  onExploreNow,
}: EmptySearchResultProps) {
  return (
    <View className="flex-1 items-center justify-center px-5 pt-20">
      {/* Magnifying Glass Illustration */}
      <View className="mb-6 items-center justify-center">
        <Image
          source={require('@/assets/icons/search/result-search-icon.svg')}
          style={{ width: 112, height: 77 }}
          contentFit="contain"
        />
      </View>

      {/* Text Content */}
      <Text className="text-center font-cairo-bold text-lg text-[#111111]">
        {title}
      </Text>
      <Text className="mb-4 px-4 text-center font-cairo-medium text-sm leading-6 text-[#6B6A6A]">
        {subtitle}
      </Text>

      {/* Buttons Container */}
      <View className="w-full space-y-3 space-y-reverse">
        {/* Button 1: Activate Alerts (Outlined) */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onActivateAlert}
          className="h-12 w-full items-center justify-center rounded-[24px] border border-[#B28648] bg-white"
        >
          <Text className="font-cairo-semibold text-sm leading-[20px] text-[#B28648]">
            تفعيل التنبيهات
          </Text>
        </TouchableOpacity>

        {/* Button 2: Explore Now (Solid Dark Blue) */}
        <TouchableOpacity
          activeOpacity={0.7}
          onPress={onExploreNow}
          className="mt-3 h-12 w-full items-center justify-center rounded-[24px] bg-[#15304D]"
        >
          <Text className="font-cairo-semibold text-sm leading-[20px] text-white">
            استكشف الآن
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}
