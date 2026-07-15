import apiClient from '@/core/api/api';

export type InvoiceStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED';

export interface InvoiceResponse {
  id: string;
  invoiceNo: string;
  planName: string;
  planDetails?: string | null;
  amount: number;
  status: InvoiceStatus;
  paidAt?: string | null;
  dueDate?: string | null;
  delayDays?: number | null;
  createdAt: string;
}

export const invoicesService = {
  getInvoices: async (): Promise<InvoiceResponse[]> => {
    const response = await apiClient.get<InvoiceResponse[]>('/invoices');
    return response.data;
  },
};
