import apiClient from '@/shared/api/api';

export type ServiceInvoiceSort = 'newest' | 'oldest';

export interface ServiceInvoiceItem {
  name: string;
  price: number;
  qty: number;
}

/** A فاتورة خدمة, as both the client and the issuing company see it. */
export interface ServiceInvoice {
  id: string;
  invoiceNo: string;
  title: string;
  clientName: string;
  // Whether it reaches a client's account in the app
  linkedToClient: boolean;
  warrantyMonths: string | null;
  issueDate: string;
  items: ServiceInvoiceItem[];
  subtotal: number;
  discount: number;
  total: number;
  paidAt: string | null;
  createdAt: string;
  company: { name: string; logoUrl: string | null; specialty: string | null };
}

/** A client the company can invoice: one of its accepted requests. */
export interface InvoiceableClient {
  requestId: string;
  title: string;
  clientName: string;
  acceptedAt: string;
}

export interface ServiceInvoiceQuery {
  search?: string;
  sort?: ServiceInvoiceSort;
}

// Drops empty values so the API applies its defaults
const params = ({ search, sort }: ServiceInvoiceQuery) => ({
  ...(search?.trim() ? { search: search.trim() } : {}),
  ...(sort ? { sort } : {}),
});

export const serviceInvoicesService = {
  /** Invoices companies addressed to the signed-in persona. */
  list: async (query: ServiceInvoiceQuery = {}): Promise<ServiceInvoice[]> => {
    const response = await apiClient.get<ServiceInvoice[]>(
      '/service-invoices',
      { params: params(query) },
    );
    return response.data;
  },

  get: async (id: string): Promise<ServiceInvoice> => {
    const response = await apiClient.get<ServiceInvoice>(
      `/service-invoices/${id}`,
    );
    return response.data;
  },

  /** Removes it from this client's list only; the company keeps it. */
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/service-invoices/${id}`);
  },

  /** The invoices the signed-in company issued. */
  listIssued: async (
    query: ServiceInvoiceQuery = {},
  ): Promise<ServiceInvoice[]> => {
    const response = await apiClient.get<ServiceInvoice[]>(
      '/users/profile/invoices',
      { params: params(query) },
    );
    return response.data;
  },

  invoiceableClients: async (): Promise<InvoiceableClient[]> => {
    const response = await apiClient.get<InvoiceableClient[]>(
      '/users/profile/invoices/clients',
    );
    return response.data;
  },

  markPaid: async (id: string): Promise<ServiceInvoice> => {
    const response = await apiClient.patch<ServiceInvoice>(
      `/users/profile/invoices/${id}/paid`,
    );
    return response.data;
  },
};
