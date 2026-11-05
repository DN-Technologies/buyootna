import { useLocalSearchParams } from 'expo-router';

import CheckoutScreen from '@/features/checkout/CheckoutScreen';
import type { CheckoutPurpose } from '@/shared/api/payments.service';

/**
 * «الدفع»: /checkout?purpose=plan&planSlug=…&adsCount=…,
 * purpose=subscription&companyPlanId=…, or
 * purpose=feature&propertyId=…&featurePackageId=….
 */
export default function CheckoutRoute() {
  const params = useLocalSearchParams<{
    purpose?: string;
    planSlug?: string;
    adsCount?: string;
    companyPlanId?: string;
    propertyId?: string;
    featurePackageId?: string;
  }>();
  const purpose: CheckoutPurpose =
    params.purpose === 'subscription' || params.purpose === 'feature'
      ? params.purpose
      : 'plan';
  const adsCount = Number(params.adsCount);

  return (
    <CheckoutScreen
      params={{
        purpose,
        planSlug: params.planSlug,
        adsCount: Number.isFinite(adsCount) && adsCount > 0 ? adsCount : undefined,
        companyPlanId: params.companyPlanId,
        propertyId: params.propertyId,
        featurePackageId: params.featurePackageId,
      }}
    />
  );
}
