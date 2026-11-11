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
import { useAuthStore } from '@/shared/store/useAuthStore';

async function fetchPlansData(isOffice: boolean) {
  const [plansRes, walletRes, promo] = await Promise.all([
    plansService.getPlans(isOffice ? 'OFFICE' : undefined).catch(() => []),
    plansService.getWallet().catch(() => ({ freeAdsRemaining: 0, slots: [] })),
    plansService.getPromo('PLAN'),
  ]);

  return { plans: plansRes, wallet: walletRes, promo };
}

export interface PlanTierState extends PlanTier {
  selectedOption: PlanOption;
}

export function usePlans() {
  // An office has its own plans (Figma 10180:31480)
  const isOffice = useAuthStore((s) => s.activeIdentity?.type === 'OFFICE');
  // Nothing picked yet: each tier's first package (1 ad, as in the Figma)
  const [selectedOptionIds, setSelectedOptionIds] = useState<
    Partial<Record<PlanTierId, string>>
  >({});
  // An office plan's picked package, by plan id
  const [officeSelection, setOfficeSelection] = useState<
    Record<string, string>
  >({});

  const {
    data = {
      plans: [],
      wallet: { freeAdsRemaining: 0, slots: [] },
      promo: null,
    },
    isLoading,
  } = useQuery({
    queryKey: ['plans', isOffice ? 'OFFICE' : 'INDIVIDUAL'],
    queryFn: () => fetchPlansData(isOffice),
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

  // An office plan's package, bought by id (its «1 اعلان مميز» has no
  // regular-ad count)
  const buyOfficePackage = (planSlug: string, packageId: string) => {
    router.push({
      pathname: '/checkout',
      params: { purpose: 'plan', planSlug, packageId },
    });
  };

  return {
    isOffice,
    officePlans: isOffice ? plans : [],
    officeSelection,
    selectOfficePackage: (planId: string, packageId: string) =>
      setOfficeSelection((prev) => ({ ...prev, [planId]: packageId })),
    buyOfficePackage,
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
