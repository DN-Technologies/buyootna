import { useRouter } from 'expo-router';
import {
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  StatusLine,
  TrialEndedNotice,
  TrialNotice,
} from '@/features/company/components/account-balance/BalanceNotices';
import CompanyBalanceSkeleton from '@/features/company/components/account-balance/CompanyBalanceSkeleton';
import CurrentPlanCard from '@/features/company/components/account-balance/CurrentPlanCard';
import SubscribePromo from '@/features/company/components/account-balance/SubscribePromo';
import SubscriptionHistorySection from '@/features/company/components/account-balance/SubscriptionHistory';
import CompanyFormHeader from '@/features/company/components/CompanyFormHeader';
import { useCompanyAccountBalance } from '@/features/company/hooks/useCompanyAccountBalance';

/** رصيد الحساب for a company: its trial or plan, and the plans it has bought. */
export default function CompanyAccountBalanceScreen() {
  const router = useRouter();
  const balance = useCompanyAccountBalance();
  const { view, subscription, plan, canPurchaseInApp } = balance;
  const hasPlan = (view === 'active' || view === 'expired') && plan !== null;

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      testID="company-account-balance-screen"
    >
      <CompanyFormHeader title="رصيد الحساب" onBack={() => router.back()} />

      {balance.isLoading ? (
        <CompanyBalanceSkeleton />
      ) : balance.isError ? (
        <View className="flex-1 items-center justify-center" style={{ gap: 12 }}>
          <Text className="font-cairo-medium text-sm text-[#6B6A6A]">
            تعذر تحميل رصيد الحساب
          </Text>
          <TouchableOpacity
            testID="company-balance-retry"
            onPress={balance.refetch}
            className="h-10 items-center justify-center rounded-full bg-[#15304D] px-6"
          >
            <Text className="font-cairo-semibold text-sm text-white">
              إعادة المحاولة
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 32,
            gap: hasPlan ? 24 : 60,
          }}
        >
          <View className="w-full" style={{ gap: 20 }}>
            <Text className="text-center font-cairo text-sm text-[#111111]">
              تابع رصيد إعلاناتك واستخدام الباقات الحالية.
            </Text>

            {view === 'trial' && (
              <TrialNotice
                daysLeft={subscription?.daysLeft ?? 0}
                endsAt={subscription?.endsAt ?? null}
              />
            )}
            {view === 'trial-ended' && subscription?.status === 'EXPIRED' && (
              <TrialEndedNotice canPurchase={canPurchaseInApp} />
            )}
            {balance.showAddFirstService && (
              <StatusLine testID="balance-add-service-notice" tone="success">
                لديك رصيد متاح ابدأ باضافة أول خدماتك.
              </StatusLine>
            )}
            {view === 'expired' && (
              <StatusLine testID="balance-expired-notice" tone="warning">
                {canPurchaseInApp
                  ? 'نفذت الباقة لديك. قم بشراء باقة لتتمكن من النشر.'
                  : 'نفذت الباقة لديك.'}
              </StatusLine>
            )}

            {hasPlan && plan && (
              <CurrentPlanCard
                plan={plan}
                endsAt={subscription?.endsAt ?? null}
                expired={view === 'expired'}
                canPurchase={canPurchaseInApp}
                isRenewing={balance.isRenewing}
                onBrowsePlans={balance.browsePlans}
                onRenew={balance.renew}
              />
            )}
          </View>

          {hasPlan ? (
            <SubscriptionHistorySection
              items={balance.history}
              onShowAll={balance.showAllHistory}
            />
          ) : (
            <SubscribePromo
              canPurchase={canPurchaseInApp}
              onBrowsePlans={balance.browsePlans}
            />
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
