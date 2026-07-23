import apiClient from '@/core/api/api';

export interface ChargeResponse {
  checkoutUrl: string | null;
  invoiceId: string;
  status: 'PAID' | 'PENDING';
}

export interface PaymentStatusResponse {
  status: 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED';
}

export const paymentsService = {
  createCharge: async (
    planSlug: string,
    appRedirectUrl: string,
    sourceId?: string,
  ): Promise<ChargeResponse> => {
    const response = await apiClient.post<ChargeResponse>('/payments/charge', {
      planSlug,
      appRedirectUrl,
      sourceId,
    });
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
