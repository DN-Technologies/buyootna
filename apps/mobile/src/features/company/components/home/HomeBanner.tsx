import { useRouter } from 'expo-router';
import type { ReactNode } from 'react';
import { Platform, Text, TouchableOpacity, View } from 'react-native';

import { HeadsetIcon, PartyPopperIcon } from '@/assets/icons/company-home';
import type { CompanyDashboardData } from '@/features/company/hooks/useCompanyHome';
import { COMPANY_PLANS_ROUTE } from '@/features/company/utils/subscriptionRequired';

interface HomeBannerProps {
  billing?: CompanyDashboardData['billing'];
  activeServicesCount: number;
}

interface NoticeProps {
  testID: string;
  icon: ReactNode;
  title: string;
  subtitle: string;
  onPressPlans: () => void;
}

// Figma 4410:163309: light notice with an "استعرض الباقات" link
const Notice = ({ testID, icon, title, subtitle, onPressPlans }: NoticeProps) => (
  <View testID={testID} className="gap-1 rounded-[8px] bg-[#F9FAFE] p-3">
    <View className="flex-row items-start gap-3">
      {icon}
      <View className="flex-1 items-start gap-1 py-[6px]">
        <Text
          className="font-cairo-semibold text-[14px] leading-[21px] text-[#111111]"
          style={{ writingDirection: 'rtl', letterSpacing: 0.28 }}
        >
          {title}
        </Text>
        <Text
          className="font-cairo-medium text-[13px] leading-[18px] text-[#6B6A6A]"
          style={{ writingDirection: 'rtl' }}
        >
          {subtitle}
        </Text>
      </View>
    </View>
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={onPressPlans}
      className="flex-row justify-end px-1 py-[6px]"
    >
      <Text
        className="font-cairo-bold text-[14px] leading-[21px] text-[#15304D]"
        style={{ letterSpacing: -0.408 }}
      >
        استعرض الباقات
      </Text>
    </TouchableOpacity>
  </View>
);

interface PromoProps {
  testID: string;
  subtitle: string;
  actionLabel: string;
  onPress: () => void;
}

// Figma 4410:163696 / 4410:163928: grey card with a full-width button
const Promo = ({ testID, subtitle, actionLabel, onPress }: PromoProps) => (
  <View testID={testID} className="gap-4 rounded-[8px] bg-[#F5F7F9] p-4">
    <View className="flex-row items-start gap-3">
      <View className="pt-[6px]">
        <View className="h-8 w-8 items-center justify-center rounded-full bg-[#FFB400]">
          <HeadsetIcon size={20} color="#111111" strokeWidth={1} />
        </View>
      </View>
      <View className="flex-1 items-start">
        <Text
          className="font-cairo-bold text-[16px] leading-[30px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          ابدأ بنشر خدماتك وتلقي العروض
        </Text>
        <Text
          className="font-cairo-medium text-[12px] leading-[17px] text-[#111111]"
          style={{ writingDirection: 'rtl' }}
        >
          {subtitle}
        </Text>
      </View>
    </View>
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      className="h-10 w-full items-center justify-center rounded-[24px] bg-[#15304D]"
    >
      <Text
        className="font-cairo-semibold text-[14px] leading-[21px] text-white"
        style={{ letterSpacing: 0.28 }}
      >
        {actionLabel}
      </Text>
    </TouchableOpacity>
  </View>
);

/**
 * The one card between the figures and the requests. In order: an overdue
 * invoice, the trial countdown, no plan yet, a plan but no services yet.
 * A company with a plan and services sees nothing here, as in Figma.
 */
export default function HomeBanner({
  billing,
  activeServicesCount,
}: HomeBannerProps) {
  const router = useRouter();
  const openPlans = () => router.push(COMPANY_PLANS_ROUTE as never);

  // Still loading: don't flash "no plan" at a subscribed company
  if (!billing) return null;

  let content: ReactNode = null;

  if (billing.hasOverdueInvoice) {
    content = (
      <Notice
        testID="home-banner-overdue"
        icon={<Text className="text-[26px] leading-[32px]">⚠️</Text>}
        title="لديك فاتورة متأخرة السداد"
        subtitle="يرجى سداد الفاتورة لتجنب إيقاف الخدمة."
        onPressPlans={openPlans}
      />
    );
  } else if (billing.trialDaysLeft != null) {
    content = (
      <Notice
        testID="home-banner-trial"
        icon={<PartyPopperIcon />}
        title="أنت تستخدم النسخة التجريبية"
        subtitle={`يتبقى ${billing.trialDaysLeft} يومًا للاستمتاع بجميع المميزات.`}
        onPressPlans={openPlans}
      />
    );
  } else if (!billing.hasActivePlan) {
    content = (
      <Promo
        testID="home-banner-plans"
        // No call to subscribe on iOS (App Store rules)
        subtitle={
          Platform.OS === 'ios'
            ? 'أضف خدماتك لزيادة فرص ظهورك للعملاء واستقبال الطلبات.'
            : 'قم بالاشتراك في باقة وأضف خدماتك لزيادة فرص ظهورك للعملاء واستقبال الطلبات.'
        }
        actionLabel="استعرض الباقات"
        onPress={openPlans}
      />
    );
  } else if (activeServicesCount === 0) {
    content = (
      <Promo
        testID="home-banner-add-service"
        subtitle="أكمل بيانات شركتك وأضف خدماتك لزيادة فرص ظهورك للعملاء واستقبال الطلبات."
        actionLabel="اضافة خدمة"
        onPress={() => router.push('/(company)/(more)/add-service')}
      />
    );
  }

  return content ? <View className="px-4">{content}</View> : null;
}
