import { api } from './api'

export type BackendInvoiceStatus = 'PAID' | 'PENDING' | 'OVERDUE' | 'CANCELLED'

export interface AdminInvoiceRow {
  id: string
  invoiceNo: string
  planName: string
  planDetails: string | null
  amount: number
  status: BackendInvoiceStatus
  paidAt: string | null
  dueDate: string | null
  delayDays: number | null
  createdAt: string
}

export interface AdminCouponHistoryRow {
  id: string
  couponCode: string
  couponName: string
  grantedAt: string
}

export async function fetchUserInvoices(
  userId: string,
  identityId?: string,
): Promise<AdminInvoiceRow[]> {
  const res = await api.get(`/admin/users/${userId}/invoices`, {
    params: { identityId },
  })
  return res.data
}

export async function fetchUserCouponHistory(
  userId: string,
): Promise<AdminCouponHistoryRow[]> {
  const res = await api.get(`/admin/users/${userId}/coupons`)
  return res.data
}
