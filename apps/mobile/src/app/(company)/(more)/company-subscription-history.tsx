import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { FlatList, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SubscriptionHistoryRowSkeleton } from '@/features/company/components/account-balance/CompanyBalanceSkeleton';
import { SubscriptionHistoryRow } from '@/features/company/components/account-balance/SubscriptionHistory';
import CompanyFormHeader from '@/features/company/components/CompanyFormHeader';
import { COMPANY_SUBSCRIPTION_HISTORY_KEY } from '@/features/company/hooks/useCompanyAccountBalance';
import { companySubscriptionsService } from '@/shared/api/companySubscriptions.service';

/** سجل الباقات: every plan period the company has paid for. */
export default function CompanySubscriptionHistoryScreen() {
  const router = useRouter();
  const { data: history = [], isLoading } = useQuery({
    queryKey: COMPANY_SUBSCRIPTION_HISTORY_KEY,
    queryFn: () => companySubscriptionsService.getHistory(),
  });

  return (
    <SafeAreaView
      className="flex-1 bg-white"
      testID="company-subscription-history-screen"
    >
      <CompanyFormHeader title="سجل الباقات" onBack={() => router.back()} />

      {isLoading ? (
        <View
          testID="company-history-skeleton"
          className="px-4 pt-3"
          style={{ gap: 12 }}
        >
          {[1, 2, 3, 4].map((key) => (
            <SubscriptionHistoryRowSkeleton key={key} />
          ))}
        </View>
      ) : (
        <FlatList
          data={history}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => <SubscriptionHistoryRow item={item} />}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{
            paddingHorizontal: 16,
            paddingTop: 12,
            paddingBottom: 32,
            gap: 12,
          }}
          ListEmptyComponent={
            <Text className="py-16 text-center font-cairo-medium text-sm text-[#6B6A6A]">
              لا توجد باقات سابقة
            </Text>
          }
        />
      )}
    </SafeAreaView>
  );
}
