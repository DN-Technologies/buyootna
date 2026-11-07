import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { useState } from 'react';
import { Platform } from 'react-native';

import {
  type ChargeResponse,
  type CheckoutPurpose,
  type PaymentMethod,
  paymentsService,
  type PaymentStatusResponse,
} from '@/shared/api/payments.service';
import { showAlert } from '@/shared/utils/alert';
import { getApiErrorMessage } from '@/shared/utils/getApiErrorMessage';

import { checkoutSession } from './checkoutSession';
import { methodsForPlatform, successMessage } from './checkoutText';

/** What is being bought (the /checkout route's params). */
export interface CheckoutParams {
  purpose: CheckoutPurpose;
  planSlug?: string;
  adsCount?: number;
  companyPlanId?: string;
  propertyId?: string;
  featurePackageId?: string;
}

export type CheckoutResult =
  | { kind: 'success'; message: string }
  | { kind: 'failed' }
  | null;

const redirectUrl = () => Linking.createURL('payment-callback');

/** `status` on the deep link Tap's checkout returned to. */
function statusFromUrl(url: string): string | null {
  const status = Linking.parse(url).queryParams?.status;
  return typeof status === 'string' ? status : null;
}

const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * The «الدفع» screen (Figma 5557:142956): the server's quote, «كود الخصم»,
 * «طريقة الدفع», and paying on Tap's page opened on that method. The
 * outcome is shown in-app (Figma 5576:144549 / 5576:144886).
 */
export function useCheckout(params: CheckoutParams) {
  const queryClient = useQueryClient();
  const [codeInput, setCodeInput] = useState('');
  const [appliedCode, setAppliedCode] = useState<string | null>(null);
  const [codeError, setCodeError] = useState<string | null>(null);
  const [isApplyingCode, setIsApplyingCode] = useState(false);
  const [method, setMethod] = useState<PaymentMethod | null>(null);
  const [isPaying, setIsPaying] = useState(false);
  const [result, setResult] = useState<CheckoutResult>(null);

  const quoteKey = ['checkoutQuote', params, appliedCode] as const;
  const quoteQuery = useQuery({
    queryKey: quoteKey,
    queryFn: () =>
      paymentsService.quote({
        ...params,
        discountCode: appliedCode ?? undefined,
      }),
    retry: false,
  });
  const quote = quoteQuery.data;
  const methods = quote ? methodsForPlatform(quote.methods, Platform.OS) : [];

  // «تطبيق»: the server checks the code; its reason shows under the field
  const applyCode = async () => {
    const code = codeInput.trim();
    if (!code || isApplyingCode) return;
    setIsApplyingCode(true);
    setCodeError(null);
    try {
      const priced = await paymentsService.quote({ ...params, discountCode: code });
      queryClient.setQueryData(['checkoutQuote', params, priced.discountCode], priced);
      setAppliedCode(priced.discountCode);
    } catch (error) {
      setCodeError(getApiErrorMessage(error, 'تعذر تطبيق كود الخصم'));
    } finally {
      setIsApplyingCode(false);
    }
  };

  const removeCode = () => {
    setAppliedCode(null);
    setCodeInput('');
    setCodeError(null);
  };

  const changeCode = (text: string) => {
    setCodeInput(text);
    if (codeError) setCodeError(null);
  };

  const charge = (): Promise<ChargeResponse> => {
    const choice = { method: method ?? undefined, discountCode: appliedCode ?? undefined };
    const redirect = redirectUrl();
    switch (params.purpose) {
      case 'subscription':
        return paymentsService.createSubscriptionCharge(
          params.companyPlanId ?? '',
          redirect,
          choice,
        );
      case 'feature':
        return paymentsService.createFeatureCharge(
          params.propertyId ?? '',
          params.featurePackageId ?? '',
          redirect,
          choice,
        );
      default:
        return paymentsService.createCharge(
          params.planSlug ?? '',
          redirect,
          undefined,
          params.adsCount,
          choice,
        );
    }
  };

  // Tap's redirect fulfils the invoice before coming back; the webhook may
  // land a moment later, so a pending invoice is asked again a few times
  const confirmPaid = async (invoiceId: string) => {
    let status: PaymentStatusResponse = await paymentsService.getPaymentStatus(invoiceId);
    for (let attempt = 0; status.status !== 'PAID' && attempt < 4; attempt += 1) {
      await wait(1000);
      status = await paymentsService.getPaymentStatus(invoiceId);
    }
    // Wallet, subscription, featured ad and invoices all changed
    void queryClient.invalidateQueries();
    setResult({ kind: 'success', message: successMessage(params.purpose, status) });
  };

  // «اتمام الدفع»
  const pay = async () => {
    if (!method || isPaying || !quote) return;
    setIsPaying(true);
    setResult(null);
    checkoutSession.begin();
    try {
      const created = await charge();
      // Free, or a code covering the whole price: already paid
      if (created.status === 'PAID') {
        await confirmPaid(created.invoiceId);
        return;
      }
      if (!created.checkoutUrl) {
        throw new Error('لم يتم استلام رابط الدفع من بوابة الدفع.');
      }

      const session = await WebBrowser.openAuthSessionAsync(
        created.checkoutUrl,
        redirectUrl(),
      );
      if (session.type === 'success') {
        if (statusFromUrl(session.url) === 'success') {
          await confirmPaid(created.invoiceId);
        } else {
          setResult({ kind: 'failed' });
        }
        return;
      }

      // Closed before coming back: the payment may still have gone through
      const { status } = await paymentsService.getPaymentStatus(created.invoiceId);
      if (status === 'PAID') await confirmPaid(created.invoiceId);
    } catch (error) {
      showAlert('خطأ', getApiErrorMessage(error, 'حدث خطأ أثناء معالجة الدفع.'));
    } finally {
      setIsPaying(false);
      checkoutSession.end();
    }
  };

  return {
    quote,
    isLoading: quoteQuery.isLoading,
    loadError: quoteQuery.isError
      ? getApiErrorMessage(quoteQuery.error, 'تعذر تحميل تفاصيل الدفع')
      : null,
    reload: quoteQuery.refetch,
    codeInput,
    changeCode,
    appliedCode,
    codeError,
    isApplyingCode,
    applyCode,
    removeCode,
    methods,
    method,
    selectMethod: setMethod,
    isPaying,
    pay,
    result,
    dismissResult: () => setResult(null),
    retry: () => {
      setResult(null);
      void pay();
    },
  };
}
