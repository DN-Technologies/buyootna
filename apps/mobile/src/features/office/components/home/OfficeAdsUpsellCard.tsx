import { Feather } from '@expo/vector-icons';
import { Text, TouchableOpacity, View } from 'react-native';

import { AdFreeIcon } from '@/assets/icons/office-home';

interface OfficeAdsUpsellCardProps {
  // buy: no package and no free ad left (Figma 4494:141157);
  // start: can publish but has no ads yet (Figma 4494:140906)
  variant: 'buy' | 'start';
  onPress: () => void;
}

const COPY = {
  buy: {
    body: 'اشترك في باقة الإعلانات للوصول إلى المزيد من العملاء وعرض عقاراتك داخل التطبيق',
    cta: 'اشتر باقة اعلانات',
  },
  start: {
    body: 'ابدأ الآن بإضافة أول عقار لعرضه داخل التطبيق والوصول إلى العملاء المهتمين.',
    cta: 'ابدأ بإضافة أول إعلان لك',
  },
};

const PERKS = [
  'نشر العقارات بسهولة.',
  'ظهور أكبر داخل التطبيق.',
  'استقبال رسائل من العملاء.',
];

// اعلانات المكتب when the office has no ads to show
export default function OfficeAdsUpsellCard({
  variant,
  onPress,
}: OfficeAdsUpsellCardProps) {
  const copy = COPY[variant];

  return (
    <View className="gap-4 rounded-[8px] bg-[#15304D] p-4">
      {/* RTL: the gold icon (first) on the right, the copy beside it */}
      <View className="flex-row items-start gap-3">
        <View className="pt-1.5">
          <View className="h-8 w-8 items-center justify-center rounded-full bg-[#FFB400]">
            <AdFreeIcon />
          </View>
        </View>
        <View className="flex-1 items-start">
          <Text
            className="font-cairo-bold text-[16px] text-white"
            style={{ writingDirection: 'rtl' }}
          >
            ابدأ بنشر إعلاناتك العقارية
          </Text>
          <Text
            className="w-full font-cairo-medium text-[12px] leading-[17px] text-white"
            style={{ writingDirection: 'rtl' }}
          >
            {copy.body}
          </Text>
        </View>
      </View>

      {variant === 'buy' && (
        <View className="gap-3">
          <View className="h-px w-full bg-white/40" />
          <View className="gap-2">
            {PERKS.map((perk) => (
              <View key={perk} className="flex-row items-center gap-2">
                <Feather name="check" size={16} color="#FFB400" />
                <Text
                  className="flex-1 font-cairo text-[14px] leading-[21px] text-white"
                  style={{ writingDirection: 'rtl' }}
                >
                  {perk}
                </Text>
              </View>
            ))}
          </View>
        </View>
      )}

      <TouchableOpacity
        activeOpacity={0.85}
        onPress={onPress}
        className="h-10 w-full items-center justify-center rounded-[24px] bg-white"
        accessibilityRole="button"
        accessibilityLabel={copy.cta}
      >
        <Text
          className="font-cairo-semibold text-[14px] text-[#15304D]"
          style={{ writingDirection: 'rtl' }}
        >
          {copy.cta}
        </Text>
      </TouchableOpacity>
    </View>
  );
}
