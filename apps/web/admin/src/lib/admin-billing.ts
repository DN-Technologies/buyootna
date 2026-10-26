import { api } from './api'

export type BillingIdentityType = 'INDIVIDUAL' | 'COMPANY' | 'OFFICE'

interface BillingOwner {
  userId: string
  identityId: string
  identityType: BillingIdentityType
  name: string | null
  email: string | null
}

interface BillingMeta {
  total: number
  currentPage: number
  limit: number
  totalPages: number
}

/** A company's paid/trial period, or an individual's/office's ad-credit plan. */
export interface AdminSubscriptionRow extends BillingOwner {
  id: string
  kind: 'COMPANY_PERIOD' | 'AD_CREDITS'
  planName: string | null
  // null: granted by an admin (no invoice)
  amount: number | null
  status: 'active' | 'expired'
  adsRemaining: number | null
  startsAt: string
  endsAt: string | null
  invoice: { id: string; invoiceNo: string } | null
}

export interface AdminSubscriptionsResponse {
  data: AdminSubscriptionRow[]
  meta: BillingMeta
  metrics: { total: number; active: number; expiringSoon: number; expired: number }
  planNames: string[]
}

export type BackendInvoiceStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED'

export interface AdminBillingInvoiceRow extends BillingOwner {
  id: string
  invoiceNo: string
  planName: string
  kind: 'AD_PLAN' | 'FEATURE_AD' | 'COMPANY_PLAN'
  amount: number
  status: BackendInvoiceStatus
  createdAt: string
  paidAt: string | null
}

export interface AdminBillingInvoicesResponse {
  data: AdminBillingInvoiceRow[]
  meta: BillingMeta
  metrics: {
    total: number
    paid: number
    pending: number
    cancelled: number
    revenuePaid: number
  }
}

export interface BillingQuery {
  search?: string
  role?: BillingIdentityType
  page?: number
  limit?: number
}

export async function fetchSubscriptions(
  query: BillingQuery & { status?: 'active' | 'expired'; plan?: string },
): Promise<AdminSubscriptionsResponse> {
  const res = await api.get('/admin/subscriptions', { params: query })
  return res.data
}

export async function fetchBillingInvoices(
  query: BillingQuery & { status?: BackendInvoiceStatus },
): Promise<AdminBillingInvoicesResponse> {
  const res = await api.get('/admin/invoices', { params: query })
  return res.data
}
