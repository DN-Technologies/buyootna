import { useQuery } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';

import { type FeaturePackage, paymentsService } from '@/shared/api/payments.service';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

// 'error': the request itself failed and an alert was already shown
export type FeatureCheckoutResult = 'success' | 'failed' | 'cancelled' | 'error';

// Where Tap's checkout sends the user back to (app/payment-callback.tsx)
const redirectUrl = () => Linking.createURL('payment-callback');

/** Reads `status` from the deep link Tap's checkout returned to. */
function statusFromUrl(url: string): string | null {
  const { queryParams } = Linking.parse(url);
  const status = queryParams?.status;
  return typeof status === 'string' ? status : null;
}

/**
 * Packages, selection and checkout for the "تمييز الإعلان" sheet. The price
 * is the server's; the ad is only featured once Tap confirms the payment.
 */
export function useFeatureAd(propertyId?: string) {
  const [selectedPackageId, setSelectedPackageId] = useState<string | null>(
    null,
  );
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    data: packages = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['featurePackages'],
    queryFn: paymentsService.getFeaturePackages,
    // Only once an ad is being featured, not on every My Activity visit
    enabled: !!propertyId,
  });

  const selectedPackage: FeaturePackage | undefined = packages.find(
    (p) => p.id === selectedPackageId,
  );

  const reset = () => {
    setSelectedPackageId(null);
    setIsProcessing(false);
  };

  // Charges the selected package; resolves once the payment is settled
  const checkout = async (): Promise<FeatureCheckoutResult> => {
    if (!propertyId || !selectedPackage || isProcessing) return 'cancelled';

    setIsProcessing(true);
    try {
      const appRedirectUrl = redirectUrl();
      const charge = await paymentsService.createFeatureCharge(
        propertyId,
        selectedPackage.id,
        appRedirectUrl,
      );
      if (charge.status === 'PAID') return 'success';
      if (!charge.checkoutUrl) {
        throw new Error('لم يتم استلام رابط الدفع من بوابة الدفع.');
      }

      const session = await WebBrowser.openAuthSessionAsync(
        charge.checkoutUrl,
        appRedirectUrl,
      );
      if (session.type === 'success') {
        return statusFromUrl(session.url) === 'success' ? 'success' : 'failed';
      }

      // Closed before landing back in the app: the payment may still have
      // gone through, so ask the server rather than assume it didn't
      const { status } = await paymentsService.getPaymentStatus(
        charge.invoiceId,
      );
      return status === 'PAID' ? 'success' : 'cancelled';
    } catch (error) {
      showAlert('خطأ', getApiErrorMessage(error, 'حدث خطأ أثناء معالجة الدفع.'));
      return 'error';
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    packages,
    isLoading,
    isError,
    refetch,
    selectedPackage,
    selectedPackageId,
    selectPackage: setSelectedPackageId,
    isProcessing,
    checkout,
    reset,
  };
}
