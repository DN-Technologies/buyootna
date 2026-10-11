import { Text, View } from 'react-native';

import { FeatureIcon } from '@/assets/icons/activity';
import { SafeLinearGradient as LinearGradient } from '@/shared/components/ui/SafeLinearGradient';

// What featuring an ad gets you
export default function FeatureAdBenefitsBanner() {
  return (
    <LinearGradient
      colors={['#FF8D28', '#FACC15']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={{
        borderRadius: 8,
        padding: 12,
        marginBottom: 12,
      }}
    >
      <View className="flex-row items-start gap-3">
        <View className="pt-1">
          <FeatureIcon size={24} color="#000000" />
        </View>
        <View className="flex-1 justify-center py-1">
          <Text
            className="font-cairo-semibold text-[14px] leading-[1.5] tracking-[0.28px] text-[#111111] w-full"
            style={{ writingDirection: 'rtl' }}
          >
            ميز اعلانك حتى:
          </Text>
          <Text
            className="font-cairo-medium text-[12px] leading-[18px] text-[#111111] w-full"
            style={{ writingDirection: 'rtl' }}
          >
            <Text className="leading-[1.2]">يظهر أعلى القائمة </Text>
            <Text className="font-cairo-bold leading-[1.2]">• </Text>
            <Text className="leading-[1.2]">يعرض في الصفحة الرئيسية </Text>
            <Text className="font-cairo-bold leading-[1.2]">• </Text>
            <Text className="leading-[1.2]">يحصد شارة إعلان مميز </Text>
            <Text className="font-cairo-bold leading-[1.2]">• </Text>
            <Text className="leading-[1.2]">تصلك مشاهدات أكثر.</Text>
          </Text>
        </View>
      </View>
    </LinearGradient>
  );
}
