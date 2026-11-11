import { useQuery } from '@tanstack/react-query';
import { router } from 'expo-router';
import { useState } from 'react';

import {
  PLAN_TIERS,
  type PlanOption,
  type PlanTier,
  type PlanTierId,
} from '@/features/individual/components/plans/constants';
import {
  tierFeatures,
  tierOptions,
} from '@/features/individual/utils/planPricing';
import { plansService } from '@/shared/api/plans.service';

async function fetchPlansData() {
  const [plansRes, walletRes, promo] = await Promise.all([
    plansService.getPlans().catch(() => []),
    plansService.getWallet().catch(() => ({ freeAdsRemaining: 0, slots: [] })),
    plansService.getPromo('PLAN'),
  ]);

  return { plans: plansRes, wallet: walletRes, promo };
}

export interface PlanTierState extends PlanTier {
  selectedOption: PlanOption;
}

export function usePlans() {
  // Nothing picked yet: each tier's first package (1 ad, as in the Figma)
  const [selectedOptionIds, setSelectedOptionIds] = useState<
    Partial<Record<PlanTierId, string>>
  >({});

  const {
    data = {
      plans: [],
      wallet: { freeAdsRemaining: 0, slots: [] },
      promo: null,
    },
    isLoading,
  } = useQuery({
    queryKey: ['plans'],
    queryFn: fetchPlansData,
  });
  const { plans, wallet, promo } = data;

  const tiers: PlanTierState[] = PLAN_TIERS.map((tier) => {
    const options = tierOptions(tier, plans);
    return {
      ...tier,
      features: tierFeatures(tier, plans),
      options,
      selectedOption:
        options.find((o) => o.id === selectedOptionIds[tier.id]) ||
        options[0],
    };
  });

  const selectOption = (tier: PlanTierId, optionId: string) =>
    setSelectedOptionIds((prev) => ({ ...prev, [tier]: optionId }));

  // «الدفع» (Figma 5557:142956) takes over: «كود الخصم», the method, Tap,
  // and the outcome popup, which refreshes the wallet
  const buyPlan = (tier: PlanTierId, option: PlanOption) => {
    const targetSlug =
      plans.find(
        (p) =>
          p.slug === option.slug ||
          (tier === 'basic' && (p.slug === 'regular' || p.slug === 'basic')) ||
          (tier === 'gold' && p.slug === 'gold'),
      )?.slug || option.slug;

    router.push({
      pathname: '/checkout',
      params: {
        purpose: 'plan',
        planSlug: targetSlug,
        ...(option.adsCount ? { adsCount: String(option.adsCount) } : {}),
      },
    });
  };

  return {
    tiers,
    wallet,
    promo,
    isLoading,
    // Paying happens on «الدفع» now; the cards no longer wait here
    isProcessing: null as PlanTierId | null,
    selectOption,
    buyPlan,
  };
}
