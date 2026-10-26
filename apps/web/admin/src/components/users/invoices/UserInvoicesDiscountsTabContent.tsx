'use client'

import { useCallback, useEffect, useState } from 'react'
import { Download, Receipt, Tag } from 'lucide-react'
import {
  AdminCouponHistoryRow,
  AdminInvoiceRow,
  fetchUserCouponHistory,
  fetchUserInvoices,
} from '@/lib/admin-invoices'
import {
  INVOICE_STATUS_LABEL,
  INVOICE_STATUS_STYLE,
} from '@/lib/invoice-labels'
import { formatArabicDate } from '@/lib/property-labels'

function exportInvoicesCsv(invoices: AdminInvoiceRow[]) {
  const header = 'رقم الفاتورة,المبلغ,الحالة,تاريخ الطلب'
  const rows = invoices.map((inv) =>
    [
      inv.invoiceNo,
      inv.amount,
      INVOICE_STATUS_LABEL[inv.status],
      formatArabicDate(inv.createdAt),
    ].join(','),
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'invoices.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export default function UserInvoicesDiscountsTabContent({
  userId,
  identityId,
}: {
  userId: string
  identityId?: string
}) {
  const [invoices, setInvoices] = useState<AdminInvoiceRow[]>([])
  const [coupons, setCoupons] = useState<AdminCouponHistoryRow[]>([])
  const [loading, setLoading] = useState(true)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const [invoiceRows, couponRows] = await Promise.all([
        fetchUserInvoices(userId, identityId),
        fetchUserCouponHistory(userId),
      ])
      setInvoices(invoiceRows)
      setCoupons(couponRows)
    } catch (err) {
      console.error('Failed to load invoices/coupons:', err)
    } finally {
      setLoading(false)
    }
  }, [userId, identityId])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="w-full py-16 text-center text-[#6B6A6A] font-['Cairo']">
        جاري التحميل...
      </div>
    )
  }

  if (invoices.length === 0 && coupons.length === 0) {
    return (
      <div
        className="bg-white border border-[#ECECEC] rounded-xl flex flex-col items-center justify-center py-16 px-6 text-center w-full min-h-80 font-['Cairo']"
        dir="rtl"
      >
        <div className="size-16 rounded-full bg-[#F8FAFC] border border-[#ECECEC] flex items-center justify-center mb-4 text-[#111111]">
          <Receipt className="w-7 h-7" />
        </div>
        <h3 className="text-[18px] font-bold text-[#111111] mb-2">
          لا توجد فواتير حتى الآن
        </h3>
        <p className="text-[14px] font-medium text-[#6B6A6A] max-w-md leading-relaxed">
          ستظهر فواتير الاشتراكات والمدفوعات هنا عند إجـراء أي عملية شراء من
          المستخدم.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full font-['Cairo']" dir="rtl">
      {/* Section 1: Invoices */}
      <div className="bg-white border border-[#ECECEC] rounded-xl p-5 flex flex-col gap-4 w-full">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 w-full">
          <h3 className="text-[16px] font-bold text-[#111111]">الفواتير</h3>
          <button
            type="button"
            onClick={() => exportInvoicesCsv(invoices)}
            disabled={invoices.length === 0}
            className="h-9 px-3.5 flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[13px] font-semibold text-[#111111] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#111111]" />
            <span>تصدير الكل</span>
          </button>
        </div>

        {invoices.length === 0 ? (
          <p className="text-[13px] text-[#6B6A6A] text-center py-6">
            لا توجد فواتير لهذا المستخدم.
          </p>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-[#ECECEC] bg-[#F8FAFC] text-[13px] font-medium text-[#6B6A6A]">
                  <th className="py-3 px-4 text-right">رقم الفاتورة</th>
                  <th className="py-3 px-4 text-right">المبلغ</th>
                  <th className="py-3 px-4 text-right">الحالة</th>
                  <th className="py-3 px-4 text-right">تاريخ الطلب</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECECEC] text-[14px]">
                {invoices.map((inv) => (
                  <tr
                    key={inv.id}
                    className="hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-[#111111]">
                      {inv.invoiceNo}
                    </td>
                    <td className="py-3.5 px-4 text-[#111111] font-semibold">
                      {inv.amount} د.ك
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium ${INVOICE_STATUS_STYLE[inv.status]}`}
                      >
                        {INVOICE_STATUS_LABEL[inv.status]}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#6B6A6A]">
                      {formatArabicDate(inv.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Section 2: Coupon Grant History */}
      <div className="bg-white border border-[#ECECEC] rounded-xl p-5 flex flex-col gap-4 w-full">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 w-full">
          <h3 className="text-[16px] font-bold text-[#111111]">أكواد الخصم</h3>
          <div className="flex items-center gap-1.5 text-[#6B6A6A] text-[13px]">
            <Tag className="w-4 h-4" />
            <span>سجل الكوبونات الممنوحة من الإدارة</span>
          </div>
        </div>

        {coupons.length === 0 ? (
          <p className="text-[13px] text-[#6B6A6A] text-center py-6">
            لم يتم منح أي كوبونات خصم لهذا المستخدم.
          </p>
        ) : (
          <div className="flex flex-col gap-3 w-full">
            {coupons.map((coupon) => (
              <div
                key={coupon.id}
                className="bg-[#F8FAFC] border border-[#ECECEC] rounded-xl p-4 flex items-center justify-between gap-4 w-full flex-wrap"
              >
                <div className="flex flex-col gap-1 text-right">
                  <span className="text-[15px] font-bold text-[#111111]">
                    {coupon.couponName || coupon.couponCode}
                  </span>
                  <span className="text-[12px] font-medium text-[#6B6A6A]">
                    {coupon.couponCode}
                  </span>
                </div>

                <span className="text-[12px] font-medium text-[#6B6A6A]">
                  {formatArabicDate(coupon.grantedAt)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
