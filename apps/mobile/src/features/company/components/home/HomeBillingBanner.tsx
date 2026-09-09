import { useRouter } from 'expo-router';
import { Text, TouchableOpacity, View } from 'react-native';

import type { CompanyDashboardData } from '@/features/company/hooks/useCompanyHome';

interface HomeBillingBannerProps {
  billing?: CompanyDashboardData['billing'];
  onPressPlans?: () => void;
}

export default function HomeBillingBanner({
  billing,
  onPressPlans,
}: HomeBillingBannerProps) {
  const router = useRouter();

  const handlePlansPress = onPressPlans || (() => router.push('/plans'));

  const isOverdue = billing?.hasOverdueInvoice;
  const hasActivePlan = billing?.hasActivePlan;

  const title = isOverdue
    ? 'لديك فاتورة متأخرة السداد'
    : hasActivePlan
      ? `باقتك النشطة: ${billing.activePlanName}`
      : 'لم يتم تفعيل أي باقة اشتراك بعد';

  const subtitle = isOverdue
    ? 'يرجى سداد الفاتورة لتجنب إيقاف الخدمة.'
    : hasActivePlan
      ? `متبقي ${billing.adsRemaining} إعلان في هذه الباقة.`
      : 'استعرض باقاتنا لنشر المزيد من الإعلانات والاستفادة من كافة المميزات.';

  const icon = isOverdue ? '⚠️' : '🎉';

  return (
    <View
      className={`mt-4 rounded-md border p-4 ${
        isOverdue
          ? 'border-[#F1B8B8] bg-[#FDF3F3]'
          : 'border-[#ECECEC] bg-[#F9FAFE]'
      }`}
    >
      <View className="flex-row items-start justify-between">
        <View className="flex-1 items-start">
          <Text
            className="font-cairo-bold text-[15px] leading-[22px] text-[#111111]"
            style={{ writingDirection: 'rtl' }}
          >
            {title}
          </Text>
          <Text
            className="mt-1 font-cairo-medium text-[12px] text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
          >
            {subtitle}
          </Text>
        </View>
        <Text className="text-2xl">{icon}</Text>
      </View>

      <TouchableOpacity
        onPress={handlePlansPress}
        className="mt-4 flex-row justify-end"
      >
        <Text className="font-cairo-bold text-[14px] text-[#15304D]">
          استعرض الباقات
        </Text>
      </TouchableOpacity>
    </View>
  );
}
