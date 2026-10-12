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
}

export const paymentsService = {
  createCharge: async (
    planSlug: string,
    appRedirectUrl: string,
    sourceId?: string,
    adsCount?: number,
  ): Promise<ChargeResponse> => {
    const response = await apiClient.post<ChargeResponse>('/payments/charge', {
      planSlug,
      adsCount,
      appRedirectUrl,
      sourceId,
    });
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
  ): Promise<ChargeResponse> => {
    const response = await apiClient.post<ChargeResponse>(
      '/payments/feature-charge',
      { propertyId, featurePackageId, appRedirectUrl },
    );
    return response.data;
  },

  /** A company subscribing to a plan from GET /company-plans. */
  createSubscriptionCharge: async (
    companyPlanId: string,
    appRedirectUrl: string,
  ): Promise<ChargeResponse> => {
    const response = await apiClient.post<ChargeResponse>(
      '/payments/subscription-charge',
      { companyPlanId, appRedirectUrl },
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
