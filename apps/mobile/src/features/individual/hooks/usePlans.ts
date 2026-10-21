import { useQuery } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';

import {
  PLAN_TIERS,
  type PlanOption,
  type PlanTier,
  type PlanTierId,
} from '@/features/individual/components/plans/constants';
import { withApiPrice } from '@/features/individual/utils/planPricing';
import { paymentsService } from '@/shared/api/payments.service';
import { plansService } from '@/shared/api/plans.service';
import { showAlert } from '@/shared/utils/alert';
import { paymentErrorMessage } from '@/shared/utils/paymentErrorMessage';

async function fetchPlansData() {
  const [plansRes, walletRes] = await Promise.all([
    plansService.getPlans().catch(() => []),
    plansService.getWallet().catch(() => ({ freeAdsRemaining: 0, slots: [] })),
  ]);

  return { plans: plansRes, wallet: walletRes };
}

export interface PlanTierState extends PlanTier {
  selectedOption: PlanOption;
}

export function usePlans() {
  const [isProcessing, setIsProcessing] = useState<PlanTierId | null>(null);
  const [selectedOptionIds, setSelectedOptionIds] = useState<
    Record<PlanTierId, string>
  >({ basic: 'basic-2', gold: 'gold-1' });

  const {
    data = { plans: [], wallet: { freeAdsRemaining: 0, slots: [] } },
    isLoading,
    refetch,
  } = useQuery({
    queryKey: ['plans'],
    queryFn: fetchPlansData,
  });
  const { plans, wallet } = data;

  const tiers: PlanTierState[] = PLAN_TIERS.map((tier) => {
    const options = tier.options.map((opt) => withApiPrice(opt, plans));
    return {
      ...tier,
      options,
      selectedOption:
        options.find((o) => o.id === selectedOptionIds[tier.id]) ||
        options[0],
    };
  });

  const selectOption = (tier: PlanTierId, optionId: string) =>
    setSelectedOptionIds((prev) => ({ ...prev, [tier]: optionId }));

  const buyPlan = async (tier: PlanTierId, option: PlanOption) => {
    if (isProcessing) return;

    setIsProcessing(tier);
    try {
      const targetSlug =
        plans.find(
          (p) =>
            p.slug === option.slug ||
            (tier === 'basic' && (p.slug === 'regular' || p.slug === 'basic')) ||
            (tier === 'gold' && p.slug === 'gold'),
        )?.slug || option.slug;

      const appRedirectUrl = Linking.createURL('payment-callback');
      const charge = await paymentsService.createCharge(
        targetSlug,
        appRedirectUrl,
        undefined,
        option.adsCount,
      );

      if (charge.status === 'PAID') {
        showAlert('نجاح', 'تم تفعيل الباقة بنجاح!');
        refetch();
        return;
      }

      if (!charge.checkoutUrl) {
        throw new Error('لم يتم استلام رابط الدفع من بوابة الدفع.');
      }

      await WebBrowser.openBrowserAsync(charge.checkoutUrl);
    } catch (error: any) {
      console.error('Payment Error:', error);
      showAlert('خطأ', paymentErrorMessage(error));
    } finally {
      setIsProcessing(null);
    }
  };

  return {
    tiers,
    wallet,
    isLoading,
    isProcessing,
    selectOption,
    buyPlan,
  };
}
