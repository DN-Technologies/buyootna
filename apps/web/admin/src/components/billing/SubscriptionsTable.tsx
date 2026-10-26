'use client'

import Link from 'next/link'
import { Eye, FileText } from 'lucide-react'
import type {
  AdminBillingInvoiceRow,
  AdminSubscriptionRow,
  BackendInvoiceStatus,
} from '@/lib/admin-billing'
import { IDENTITY_TYPE_LABEL, formatDate, formatKwd } from './billing.types'

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="bg-white border border-[#ECECEC] rounded-2xl shadow-xs py-24 px-6 flex flex-col items-center justify-center text-center font-['Cairo']">
      <div className="size-16 rounded-2xl bg-[#F8FAFC] border border-[#ECECEC] flex items-center justify-center text-[#111111] mb-4">
        <FileText className="w-8 h-8 stroke-[1.5]" />
      </div>
      <h3 className="text-[18px] font-bold text-[#111111] mb-1.5">{title}</h3>
      <p className="text-[13px] font-medium text-[#6B6A6A] max-w-sm leading-relaxed">
        {subtitle}
      </p>
    </div>
  )
}

function Owner({
  row,
}: {
  row: Pick<AdminSubscriptionRow, 'name' | 'email' | 'identityType'>
}) {
  const name = row.name || row.email || '—'
  return (
    <div className="flex items-center gap-2.5">
      <div className="size-9 rounded-full bg-slate-200 flex items-center justify-center text-primary font-bold text-[13px] shrink-0">
        {name.charAt(0)}
      </div>
      <div className="flex flex-col">
        <span className="font-bold text-[#111111]">{name}</span>
        <span className="text-[11px] text-[#6B6A6A]">
          {IDENTITY_TYPE_LABEL[row.identityType]}
          {row.email ? ` · ${row.email}` : ''}
        </span>
      </div>
    </div>
  )
}

function ViewAccount({
  row,
}: {
  row: Pick<AdminSubscriptionRow, 'userId' | 'identityId'>
}) {
  return (
    <Link
      href={`/users/${row.userId}?identity=${row.identityId}&tab=packages`}
      title="عرض الحساب"
      className="size-8 rounded-full flex items-center justify-center text-[#6B6A6A] hover:bg-slate-100 transition-colors mx-auto"
    >
      <Eye className="w-4 h-4" />
    </Link>
  )
}

const TABLE =
  "bg-white border border-[#ECECEC] rounded-2xl shadow-xs overflow-hidden font-['Cairo'] text-right"
const HEAD =
  'bg-[#F8FAFC] border-b border-[#ECECEC] text-[12px] font-bold text-[#6B6A6A]'

export function SubscriptionsTable({
  rows,
  footer,
}: {
  rows: AdminSubscriptionRow[]
  footer?: React.ReactNode
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="لا توجد اشتراكات"
        subtitle="ستظهر هنا اشتراكات الشركات وباقات الإعلانات للأفراد والمكاتب عند شرائها أو منحها."
      />
    )
  }
  return (
    <div className={TABLE}>
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className={HEAD}>
              <th className="p-4">المستخدم</th>
              <th className="p-4">الباقة</th>
              <th className="p-4">السعر</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">تاريخ البدء</th>
              <th className="p-4">الانتهاء</th>
              <th className="p-4 text-center">الحساب</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECECEC] text-[13px]">
            {rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-slate-50/70 transition-colors text-[#111111]"
              >
                <td className="p-4">
                  <Owner row={row} />
                </td>
                <td className="p-4">
                  <span className="inline-block px-2.5 py-0.5 rounded text-[12px] font-bold bg-[#F1F5F9] text-[#475569]">
                    {row.planName ?? '—'}
                  </span>
                  <span className="block text-[11px] text-[#6B6A6A] mt-1">
                    {row.kind === 'COMPANY_PERIOD'
                      ? 'اشتراك شركة'
                      : 'باقة إعلانات'}
                  </span>
                </td>
                <td className="p-4 font-bold">
                  {row.amount == null
                    ? 'منحة من الإدارة'
                    : formatKwd(row.amount)}
                </td>
                <td className="p-4">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                      row.status === 'active'
                        ? 'bg-[#E6F4EA] text-[#137333]'
                        : 'bg-[#F1F5F9] text-[#6B6A6A]'
                    }`}
                  >
                    {row.status === 'active'
                      ? 'نشط'
                      : row.kind === 'AD_CREDITS'
                        ? 'نفدت الإعلانات'
                        : 'منتهي'}
                  </span>
                </td>
                <td className="p-4 text-[#6B6A6A] font-medium">
                  {formatDate(row.startsAt)}
                </td>
                <td className="p-4 text-[#6B6A6A] font-medium">
                  {row.kind === 'AD_CREDITS'
                    ? `${row.adsRemaining ?? 0} إعلان متبقٍ`
                    : formatDate(row.endsAt)}
                </td>
                <td className="p-4 text-center">
                  <ViewAccount row={row} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer}
    </div>
  )
}

const INVOICE_STATUS: Record<
  BackendInvoiceStatus,
  { label: string; style: string }
> = {
  PAID: { label: 'مدفوعة', style: 'bg-[#E6F4EA] text-[#137333]' },
  PENDING: { label: 'بانتظار الدفع', style: 'bg-[#FFFBEB] text-[#B45309]' },
  OVERDUE: { label: 'متأخرة', style: 'bg-[#FEF3F2] text-[#9C1E28]' },
  CANCELLED: { label: 'ملغية', style: 'bg-[#F1F5F9] text-[#6B6A6A]' },
}

const INVOICE_KIND: Record<AdminBillingInvoiceRow['kind'], string> = {
  AD_PLAN: 'باقة إعلانات',
  FEATURE_AD: 'تمييز إعلان',
  COMPANY_PLAN: 'اشتراك شركة',
}

export function InvoicesTable({
  rows,
  footer,
}: {
  rows: AdminBillingInvoiceRow[]
  footer?: React.ReactNode
}) {
  if (rows.length === 0) {
    return (
      <EmptyState
        title="لا توجد فواتير"
        subtitle="ستظهر الفواتير هنا عند إجراء أي عملية شراء من المستخدمين."
      />
    )
  }
  return (
    <div className={TABLE}>
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          <thead>
            <tr className={HEAD}>
              <th className="p-4">رقم الفاتورة</th>
              <th className="p-4">المستخدم</th>
              <th className="p-4">البند</th>
              <th className="p-4">المبلغ</th>
              <th className="p-4">الحالة</th>
              <th className="p-4">تاريخ الإصدار</th>
              <th className="p-4">تاريخ الدفع</th>
              <th className="p-4 text-center">الحساب</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECECEC] text-[13px]">
            {rows.map((row) => (
              <tr
                key={row.id}
                className="hover:bg-slate-50/70 transition-colors text-[#111111]"
              >
                <td className="p-4 font-bold" dir="ltr">
                  {row.invoiceNo}
                </td>
                <td className="p-4">
                  <Owner row={row} />
                </td>
                <td className="p-4">
                  <span className="block font-bold">{row.planName}</span>
                  <span className="block text-[11px] text-[#6B6A6A] mt-0.5">
                    {INVOICE_KIND[row.kind]}
                  </span>
                </td>
                <td className="p-4 font-bold">{formatKwd(row.amount)}</td>
                <td className="p-4">
                  <span
                    className={`inline-block px-2.5 py-0.5 rounded-full text-[11px] font-bold ${INVOICE_STATUS[row.status].style}`}
                  >
                    {INVOICE_STATUS[row.status].label}
                  </span>
                </td>
                <td className="p-4 text-[#6B6A6A] font-medium">
                  {formatDate(row.createdAt)}
                </td>
                <td className="p-4 text-[#6B6A6A] font-medium">
                  {formatDate(row.paidAt)}
                </td>
                <td className="p-4 text-center">
                  <ViewAccount row={row} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {footer}
    </div>
  )
}
