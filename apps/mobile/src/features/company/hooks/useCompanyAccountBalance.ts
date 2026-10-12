import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'expo-router';

import {
  COMPANY_SUBSCRIPTION_KEY,
  useCompanyPlans,
} from '@/features/company/hooks/useCompanyPlans';
import { useMyCompanyServices } from '@/features/company/hooks/useMyCompanyServices';
import { COMPANY_PLANS_ROUTE } from '@/features/company/utils/subscriptionRequired';
import { companySubscriptionsService } from '@/shared/api/companySubscriptions.service';

export const COMPANY_SUBSCRIPTION_HISTORY_KEY = [
  ...COMPANY_SUBSCRIPTION_KEY,
  'history',
];
// How many periods the balance screen shows before "عرض الكل"
const PREVIEW_ROWS = 3;

/**
 * What the company رصيد الحساب screen shows, which of its states applies:
 *  - trial:        the free trial is running
 *  - trial-ended:  it ran out and no plan was ever bought (or none started)
 *  - active:       a paid plan is running
 *  - expired:      the paid plan ran out
 */
export type CompanyBalanceView = 'trial' | 'trial-ended' | 'active' | 'expired';

export function useCompanyAccountBalance() {
  const router = useRouter();
  const {
    plans,
    subscription,
    processingPlanId,
    subscribe,
    canPurchaseInApp,
    isSubscriptionLoading,
    isSubscriptionError,
    refetch: refetchSubscription,
  } = useCompanyPlans();
  const { services, isLoading: servicesLoading } = useMyCompanyServices();

  const historyQuery = useQuery({
    queryKey: COMPANY_SUBSCRIPTION_HISTORY_KEY,
    queryFn: () => companySubscriptionsService.getHistory(),
    staleTime: 0,
  });

  const plan = subscription?.plan ?? null;
  let view: CompanyBalanceView = 'trial-ended';
  if (subscription?.status === 'TRIAL') view = 'trial';
  else if (subscription?.status === 'ACTIVE' && plan) view = 'active';
  else if (subscription?.status === 'EXPIRED' && plan) view = 'expired';

  const renew = () => {
    // Renewing buys the same plan again, if it is still sold
    const current = plans.find((p) => p.id === plan?.id);
    if (current) void subscribe(current);
    else router.push(COMPANY_PLANS_ROUTE as never);
  };

  return {
    view,
    subscription,
    plan,
    isLoading: isSubscriptionLoading,
    isError: isSubscriptionError || !subscription,
    history: (historyQuery.data ?? []).slice(0, PREVIEW_ROWS),
    // "You have a balance, add your first service"
    showAddFirstService:
      view === 'active' && !servicesLoading && services.length === 0,
    canPurchaseInApp,
    isRenewing: processingPlanId !== null,
    renew,
    browsePlans: () => router.push(COMPANY_PLANS_ROUTE as never),
    showAllHistory: () =>
      router.push('/company-subscription-history' as never),
    refetch: () => {
      refetchSubscription();
      void historyQuery.refetch();
    },
  };
}
