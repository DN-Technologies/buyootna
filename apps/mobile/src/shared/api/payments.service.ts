import apiClient from '@/shared/api/api';

export interface ChargeResponse {
  checkoutUrl: string | null;
  invoiceId: string;
  status: 'PAID' | 'PENDING';
}

/** A paid "feature this ad" option, priced by the server (admin-editable). */
export interface FeaturePackage {
  id: string;
  label: string;
  description: string;
  durationDays: number;
  price: number;
}

export interface PaymentStatusResponse {
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED';
  // What was bought and when it ends, for «تم الدفع بنجاح» (newer API)
  purpose?: CheckoutPurpose;
  planName?: string;
  planDetails?: string | null;
  endsAt?: string | null;
}

/** What the «الدفع» screen is paying for. */
export type CheckoutPurpose = 'plan' | 'subscription' | 'feature';

/** «طريقة الدفع»: each opens Tap's page on that method. */
export type PaymentMethod = 'apple_pay' | 'google_pay' | 'card' | 'knet';

/** «كود الخصم» and «طريقة الدفع», sent with any charge. */
export interface CheckoutChoice {
  method?: PaymentMethod;
  discountCode?: string;
}

export interface QuoteRequest {
  purpose: CheckoutPurpose;
  planSlug?: string;
  adsCount?: number;
  companyPlanId?: string;
  propertyId?: string;
  featurePackageId?: string;
  discountCode?: string;
}

/** The «الدفع» screen's card and «ملخص الدفع», priced by the server. */
export interface CheckoutQuote {
  title: string;
  subtitle: string;
  price: number;
  discount: number;
  total: number;
  currency: 'KWD';
  discountCode: string | null;
  methods: PaymentMethod[];
}

export const paymentsService = {
  createCharge: async (
    planSlug: string,
    appRedirectUrl: string,
    sourceId?: string,
    adsCount?: number,
    choice: CheckoutChoice = {},
  ): Promise<ChargeResponse> => {
    const response = await apiClient.post<ChargeResponse>('/payments/charge', {
      planSlug,
      adsCount,
      appRedirectUrl,
      sourceId,
      ...choice,
    });
    return response.data;
  },

  /** What the payment screen shows before paying (writes nothing). */
  quote: async (request: QuoteRequest): Promise<CheckoutQuote> => {
    const response = await apiClient.post<CheckoutQuote>(
      '/payments/quote',
      request,
    );
    return response.data;
  },

  getFeaturePackages: async (): Promise<FeaturePackage[]> => {
    const response = await apiClient.get<FeaturePackage[]>(
      '/payments/feature-packages',
    );
    return response.data;
  },

  createFeatureCharge: async (
    propertyId: string,
    featurePackageId: string,
    appRedirectUrl: string,
    choice: CheckoutChoice = {},
  ): Promise<ChargeResponse> => {
    const response = await apiClient.post<ChargeResponse>(
      '/payments/feature-charge',
      { propertyId, featurePackageId, appRedirectUrl, ...choice },
    );
    return response.data;
  },

  /** A company subscribing to a plan from GET /company-plans. */
  createSubscriptionCharge: async (
    companyPlanId: string,
    appRedirectUrl: string,
    choice: CheckoutChoice = {},
  ): Promise<ChargeResponse> => {
    const response = await apiClient.post<ChargeResponse>(
      '/payments/subscription-charge',
      { companyPlanId, appRedirectUrl, ...choice },
    );
    return response.data;
  },

  getPaymentStatus: async (
    invoiceId: string,
  ): Promise<PaymentStatusResponse> => {
    const response = await apiClient.get<PaymentStatusResponse>(
      `/payments/status/${invoiceId}`,
    );
    return response.data;
  },
};
