import { useQuery, useQueryClient } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';
import { Platform } from 'react-native';

import {
  type CompanyPlan,
  companySubscriptionsService,
} from '@/shared/api/companySubscriptions.service';

export const COMPANY_SUBSCRIPTION_KEY = ['company-subscription'];

// Apple requires its own in-app purchase for anything sold inside an iOS
// app, and forbids pointing users to another way to pay. So on iOS the
// plans are shown without prices or a subscribe button, and the screen says
// only that subscribing isn't available in the app -- never where it is.
export const canPurchaseInApp = () => Platform.OS !== 'ios';

/**
 * The company الباقات screen: the plans, where the company's subscription
 * stands, and subscribing.
 */
export function useCompanyPlans() {
  const queryClient = useQueryClient();
  const [processingPlanId, setProcessingPlanId] = useState<string | null>(null);

  const plansQuery = useQuery({
    queryKey: ['company-plans'],
    queryFn: () => companySubscriptionsService.getPlans(),
  });
  const subscriptionQuery = useQuery({
    queryKey: COMPANY_SUBSCRIPTION_KEY,
    queryFn: () => companySubscriptionsService.getMine(),
    staleTime: 0,
  });

  const refresh = () => {
    void queryClient.invalidateQueries({ queryKey: COMPANY_SUBSCRIPTION_KEY });
    void queryClient.invalidateQueries({ queryKey: ['companyDashboard'] });
  };

  // «الدفع» (Figma 5557:142956): «كود الخصم», the method, Tap, and the
  // outcome popup, which refreshes the subscription
  const subscribe = (plan: CompanyPlan) => {
    if (!canPurchaseInApp() || processingPlanId) return;
    router.push({
      pathname: '/checkout',
      params: { purpose: 'subscription', companyPlanId: plan.id },
    });
  };

  return {
    plans: plansQuery.data ?? [],
    subscription: subscriptionQuery.data ?? null,
    isSubscriptionLoading: subscriptionQuery.isLoading,
    isSubscriptionError: subscriptionQuery.isError,
    isLoading: plansQuery.isLoading,
    isError: plansQuery.isError,
    refetch: () => {
      void plansQuery.refetch();
      void subscriptionQuery.refetch();
    },
    processingPlanId,
    subscribe,
    canPurchaseInApp: canPurchaseInApp(),
  };
}
