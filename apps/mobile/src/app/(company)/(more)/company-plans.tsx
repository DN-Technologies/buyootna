import { useRouter } from 'expo-router';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import CompanyFormHeader from '@/features/company/components/CompanyFormHeader';
import CompanyPlanCard from '@/features/company/components/plans/CompanyPlanCard';
import { useCompanyPlans } from '@/features/company/hooks/useCompanyPlans';
import PlanCardSkeleton from '@/shared/components/skeletons/PlanCardSkeleton';

const formatDate = (iso: string) => {
  const date = new Date(iso);
  const pad = (value: number) => String(value).padStart(2, '0');
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
};

/**
 * iOS only. Says that subscribing isn't possible in the app and when the
 * company's cover ends -- and nothing about where to subscribe: App Store
 * rules forbid pointing users to another way to pay.
 */
function InAppPurchaseNotice({ endsAt }: { endsAt: string | null }) {
  const stillCovered = endsAt !== null && new Date(endsAt) > new Date();
  return (
    <View
      testID="in-app-purchase-notice"
      className="rounded-lg bg-[#F5F7F9] p-3"
      style={{ gap: 4 }}
    >
      <Text
        className="font-cairo-medium leading-[22px] text-sm text-[#111111]"
        style={{ writingDirection: 'rtl' }}
      >
        لا يمكن الاشتراك أو تجديد الباقة من داخل التطبيق.
      </Text>
      {stillCovered && (
        <Text
          testID="subscription-ends"
          className="font-cairo text-xs text-[#6B6A6A]"
          style={{ writingDirection: 'rtl' }}
        >
          اشتراكك الحالي سارٍ حتى {formatDate(endsAt)}.
        </Text>
      )}
    </View>
  );
}

/** الباقات for a company: the subscription plans and the one it is on. */
export default function CompanyPlansScreen() {
  const router = useRouter();
  const {
    plans,
    subscription,
    isLoading,
    isError,
    refetch,
    processingPlanId,
    subscribe,
    canPurchaseInApp,
  } = useCompanyPlans();

  return (
    <SafeAreaView className="flex-1 bg-white" testID="company-plans-screen">
      <CompanyFormHeader title="الباقات" onBack={() => router.back()} />

      <ScrollView
        className="flex-1"
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{
          paddingHorizontal: 16,
          // Room for the tag that sits on a highlighted card's top border
          paddingTop: 16,
          paddingBottom: 32,
          gap: 24,
        }}
      >
        {isLoading ? (
          [1, 2, 3].map((key) => <PlanCardSkeleton key={key} />)
        ) : isError ? (
          <View className="items-center py-16" style={{ gap: 12 }}>
            <Text className="font-cairo-medium text-sm text-[#6B6A6A]">
              تعذر تحميل الباقات
            </Text>
            <TouchableOpacity
              testID="company-plans-retry"
              onPress={refetch}
              className="h-10 items-center justify-center rounded-full bg-[#15304D] px-6"
            >
              <Text className="font-cairo-semibold text-sm text-white">
                إعادة المحاولة
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            {!canPurchaseInApp && (
              <InAppPurchaseNotice endsAt={subscription?.endsAt ?? null} />
            )}
            {plans.map((plan) => (
              <CompanyPlanCard
                key={plan.id}
                plan={plan}
                isCurrent={subscription?.currentPlanId === plan.id}
                isProcessing={processingPlanId === plan.id}
                disabled={processingPlanId !== null}
                purchasable={canPurchaseInApp}
                onSubscribe={subscribe}
              />
            ))}
          </>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
