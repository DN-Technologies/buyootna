import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Platform } from 'react-native';

import {
  type CompanyPlan,
  companySubscriptionsService,
} from '@/shared/api/companySubscriptions.service';
import { paymentsService } from '@/shared/api/payments.service';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

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

  const subscribe = async (plan: CompanyPlan) => {
    if (!canPurchaseInApp() || processingPlanId) return;

    setProcessingPlanId(plan.id);
    try {
      const charge = await paymentsService.createSubscriptionCharge(
        plan.id,
        // Tap's checkout comes back to app/payment-callback.tsx
        Linking.createURL('payment-callback'),
      );

      if (charge.status === 'PAID') {
        showAlert('نجاح', 'تم تفعيل اشتراكك بنجاح!');
        refresh();
        return;
      }
      if (!charge.checkoutUrl) {
        throw new Error('لم يتم استلام رابط الدفع من بوابة الدفع.');
      }
      await WebBrowser.openBrowserAsync(charge.checkoutUrl);
      // Back from the checkout, paid or not
      refresh();
    } catch (error) {
      showAlert(
        'خطأ',
        getApiErrorMessage(
          error,
          error instanceof Error
            ? error.message
            : 'حدث خطأ أثناء معالجة الدفع.',
        ),
      );
    } finally {
      setProcessingPlanId(null);
    }
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
