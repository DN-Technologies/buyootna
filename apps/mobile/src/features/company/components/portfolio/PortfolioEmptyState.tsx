import { Image } from 'expo-image';
import { Text, View } from 'react-native';

import CompanySubmitButton from '../CompanySubmitButton';

interface PortfolioEmptyStateProps {
  // No project matches the search (Figma 4410:169639) rather than none at all (4410:169578)
  noMatches: boolean;
  onAdd: () => void;
}

export default function PortfolioEmptyState({
  noMatches,
  onAdd,
}: PortfolioEmptyStateProps) {
  return (
    <View
      testID={noMatches ? 'portfolio-no-matches' : 'portfolio-empty'}
      className="flex-1 items-center justify-center px-5 pb-24"
    >
      <View className="w-full items-center gap-4">
        <View className="w-[265px] items-center gap-3">
          <Image
            source={
              noMatches
                ? require('@/assets/icons/portfolio/no-results.svg')
                : require('@/assets/icons/portfolio/empty-projects.svg')
            }
            style={{ width: 112, height: 77 }}
            contentFit="contain"
          />
          <View className="w-full items-center gap-2">
            <Text
              className="text-center font-cairo-bold text-[16px] text-[#111111]"
              style={{ writingDirection: 'rtl' }}
            >
              {noMatches
                ? 'لا توجد أي مشاريع مطابقة للبحث'
                : 'لا توجد مشاريع في معرضك حاليا'}
            </Text>
            <Text
              className="text-center font-cairo-semibold text-[14px] leading-[21px] tracking-[0.28px] text-[#6B6A6A]"
              style={{ writingDirection: 'rtl' }}
            >
              {noMatches
                ? 'جرّب تعديل المسمى أو توسيع نطاق البحث.'
                : 'سوف تظهر مشاريعك هنا فور اضافتها.'}
            </Text>
          </View>
        </View>
        {!noMatches && (
          <View className="w-full">
            <CompanySubmitButton label="إضافة مشروع" disabled={false} onPress={onAdd} />
          </View>
        )}
      </View>
    </View>
  );
}
