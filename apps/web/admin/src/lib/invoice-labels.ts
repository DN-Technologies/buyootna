import { BackendInvoiceStatus } from './admin-invoices'

export const INVOICE_STATUS_LABEL: Record<BackendInvoiceStatus, string> = {
  PAID: 'مدفوعة',
  PENDING: 'قيد الانتظار',
  OVERDUE: 'متأخرة',
  CANCELLED: 'ملغية',
}

export const INVOICE_STATUS_STYLE: Record<BackendInvoiceStatus, string> = {
  PAID: 'bg-[#EAF8F1] text-[#018B1B]',
  PENDING: 'bg-[#FEF6E6] text-[#D97706]',
  OVERDUE: 'bg-[#FEF3F2] text-[#9C1E28]',
  CANCELLED: 'bg-[#F1F5F9] text-[#6B6A6A]',
}
