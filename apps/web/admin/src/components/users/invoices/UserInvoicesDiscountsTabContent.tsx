'use client'

import { Download, Receipt, Tag } from 'lucide-react'

export interface UserInvoiceRecord {
  id: string
  code: string
  amount: string
  discount: string
  status: 'مدفوعة' | 'ملغية' | 'منتهية'
  date: string
}

export interface UserCouponRecord {
  id: string
  code: string
  promo: string
  validity: string
  status: 'نشط' | 'منتهي'
}

const mockInvoices: UserInvoiceRecord[] = [
  {
    id: '1',
    code: 'INV-2027-00125',
    amount: '100 د.ك',
    discount: '10% (20 د.ك)',
    status: 'مدفوعة',
    date: '5 أبريل 2026',
  },
  {
    id: '2',
    code: 'INV-2027-00125',
    amount: '100 د.ك',
    discount: '10% (20 د.ك)',
    status: 'مدفوعة',
    date: 'منذ ساعتين',
  },
  {
    id: '3',
    code: 'INV-2027-00125',
    amount: '100 د.ك',
    discount: '10% (20 د.ك)',
    status: 'ملغية',
    date: 'منذ ساعتين',
  },
  {
    id: '4',
    code: 'INV-2027-00125',
    amount: '100 د.ك',
    discount: '10% (20 د.ك)',
    status: 'منتهية',
    date: 'منذ ساعتين',
  },
  {
    id: '5',
    code: 'INV-2027-00125',
    amount: '100 د.ك',
    discount: '10% (20 د.ك)',
    status: 'مدفوعة',
    date: '5 أبريل 2026',
  },
]

const mockCoupons: UserCouponRecord[] = [
  {
    id: 'c1',
    code: 'Byoutna10',
    promo: 'LAUNCHPROMO26',
    validity: 'صالح حتى: 30 يونيو (ينتهي خلال 4 أيام)',
    status: 'نشط',
  },
  {
    id: 'c2',
    code: 'Byoutna10',
    promo: 'LAUNCHPROMO26',
    validity: 'صالح حتى: 30 يونيو (ينتهي خلال 4 أيام)',
    status: 'منتهي',
  },
]

const invoiceStatusStyles: Record<UserInvoiceRecord['status'], string> = {
  مدفوعة: 'bg-[#EAF8F1] text-[#018B1B]',
  ملغية: 'bg-[#FEF3F2] text-[#9C1E28]',
  منتهية: 'bg-[#F1F5F9] text-[#6B6A6A]',
}

const couponStatusStyles: Record<UserCouponRecord['status'], string> = {
  نشط: 'bg-[#EAF8F1] text-[#018B1B]',
  منتهي: 'bg-[#F1F5F9] text-[#6B6A6A]',
}

export default function UserInvoicesDiscountsTabContent() {
  if (mockInvoices.length === 0) {
    /* Node 4043:133777: 0-State View */
    return (
      <div className="bg-white border border-[#ECECEC] rounded-xl flex flex-col items-center justify-center py-16 px-6 text-center w-full min-h-80 font-['Cairo']" dir="rtl">
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

  /* Node 4043:131566: Active Invoices & Coupons View */
  return (
    <div className="flex flex-col gap-6 w-full font-['Cairo']" dir="rtl">
      {/* Section 1: Invoices */}
      <div className="bg-white border border-[#ECECEC] rounded-xl p-5 flex flex-col gap-4 w-full">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 w-full">
          <h3 className="text-[16px] font-bold text-[#111111]">الفواتير</h3>
          <button
            type="button"
            onClick={() => alert('"تصدير الكل" — تم تجهيز التصدير.')}
            className="h-9 px-3.5 flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[13px] font-semibold text-[#111111] hover:bg-[#F8FAFC] cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#111111]" />
            <span>تصدير الكل</span>
          </button>
        </div>

        {/* Invoices Table */}
        <div className="overflow-x-auto w-full">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-[#ECECEC] bg-[#F8FAFC] text-[13px] font-medium text-[#6B6A6A]">
                <th className="py-3 px-4 text-right">رقم الفاتورة</th>
                <th className="py-3 px-4 text-right">المبلغ</th>
                <th className="py-3 px-4 text-right">الخصم</th>
                <th className="py-3 px-4 text-right">الحالة</th>
                <th className="py-3 px-4 text-right">تاريخ الطلب</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECECEC] text-[14px]">
              {mockInvoices.map((inv) => (
                <tr
                  key={inv.id}
                  className="hover:bg-[#F8FAFC] transition-colors"
                >
                  <td className="py-3.5 px-4 font-semibold text-[#111111]">
                    {inv.code}
                  </td>
                  <td className="py-3.5 px-4 text-[#111111] font-semibold">
                    {inv.amount}
                  </td>
                  <td className="py-3.5 px-4 text-[#6B6A6A] font-medium">
                    {inv.discount}
                  </td>
                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium ${
                        invoiceStatusStyles[inv.status]
                      }`}
                    >
                      {inv.status}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#6B6A6A]">{inv.date}</td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => alert(`تحميل الفاتورة ${inv.code}`)}
                      className="inline-flex items-center gap-1.5 text-primary font-bold hover:underline cursor-pointer text-[14px]"
                    >
                      <Download className="w-4 h-4" />
                      <span>تحميل</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: Discount Codes */}
      <div className="bg-white border border-[#ECECEC] rounded-xl p-5 flex flex-col gap-4 w-full">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 w-full">
          <h3 className="text-[16px] font-bold text-[#111111]">أكواد الخصم</h3>
          <button
            type="button"
            onClick={() => alert('"اضافة كوبون" — لم يتم التفعيل بعد.')}
            className="h-9 px-3.5 flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[13px] font-semibold text-[#111111] hover:bg-[#F8FAFC] cursor-pointer"
          >
            <Tag className="w-4 h-4 text-[#111111]" />
            <span>اضافة كوبون</span>
          </button>
        </div>

        {/* Coupons List */}
        <div className="flex flex-col gap-3 w-full">
          {mockCoupons.map((coupon) => (
            <div
              key={coupon.id}
              className="bg-[#F8FAFC] border border-[#ECECEC] rounded-xl p-4 flex items-center justify-between gap-4 w-full flex-wrap"
            >
              <div className="flex flex-col gap-1 text-right">
                <span className="text-[15px] font-bold text-[#111111]">
                  {coupon.code}
                </span>
                <span className="text-[12px] font-medium text-[#6B6A6A]">
                  {coupon.promo}
                </span>
                <span className="text-[12px] font-medium text-[#6B6A6A]">
                  {coupon.validity}
                </span>
              </div>

              <div>
                <span
                  className={`inline-flex items-center px-3 py-1 rounded-full text-[12px] font-medium ${
                    couponStatusStyles[coupon.status]
                  }`}
                >
                  {coupon.status}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
