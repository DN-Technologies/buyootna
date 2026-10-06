import { RefreshControl, ScrollView, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
  AccountBalanceActions,
  AccountBalanceHeader,
  AccountBalanceSkeleton,
  AdHistorySection,
  BalanceSummaryCards,
  FreeAdsPromoBanner,
  useAccountBalance,
} from '@/features/individual/components/more/account-balance';

export default function AccountBalanceScreen() {
  const {
    freeAdsRemaining,
    balanceCounts,
    previewHistory,
    hasHistory,
    isLoading,
    refreshing,
    onRefresh,
  } = useAccountBalance();

  return (
    <SafeAreaView className="flex-1 bg-white" edges={['top', 'left', 'right']}>
      <AccountBalanceHeader />

      {isLoading ? (
        <AccountBalanceSkeleton />
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          // Room for the fixed actions + bottom inset below the last row
          contentContainerStyle={{ paddingBottom: 200 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={['#15304D']}
            />
          }
        >
          <Text
            className="mt-4 px-5 text-center font-cairo text-[14px] text-[#6B6A6A]"
            style={{ writingDirection: 'rtl' }}
          >
            تابع رصيد إعلاناتك واستخدام الباقات الحالية.
          </Text>

          {freeAdsRemaining > 0 && (
            <FreeAdsPromoBanner freeAdsRemaining={freeAdsRemaining} />
          )}

          <BalanceSummaryCards counts={balanceCounts} />

          {hasHistory && <AdHistorySection items={previewHistory} />}
        </ScrollView>
      )}

      {!isLoading && <AccountBalanceActions hasHistory={hasHistory} />}
    </SafeAreaView>
  );
}
