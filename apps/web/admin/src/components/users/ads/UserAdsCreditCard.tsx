'use client'

import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Check, Package, Ticket, Gift } from 'lucide-react'

interface UserAdsCreditCardProps {
  isFreeUsed?: boolean
  paidCredit?: string | null
}

export default function UserAdsCreditCard({
  isFreeUsed = false,
  paidCredit = null,
}: UserAdsCreditCardProps) {
  // «باقة إعلانات» opens this persona's الباقة tab
  const pathname = usePathname()
  const params = new URLSearchParams(useSearchParams().toString())
  params.set('tab', 'packages')

  return (
    <div
      className="bg-white border border-[#ECECEC] rounded-lg flex flex-col gap-3.5 p-4 w-full font-['Cairo']"
      dir="rtl"
    >
      <div className="flex items-center justify-between gap-4 w-full flex-wrap">
        <p className="text-[14px] font-medium text-[#6B6A6A] text-right">
          الفرد يحصل على إعلان <span className="text-[#111111] font-bold">واحد مجاني</span>{' '}
          ثم يحتاج لشراء باقة إعلانات
        </p>
        <Link
          href={`${pathname}?${params.toString()}`}
          scroll={false}
          className="h-9 px-4 flex items-center rounded-full border border-[#E2E8F0] bg-white text-[13px] font-semibold text-[#111111] hover:bg-[#F8FAFC] cursor-pointer shrink-0"
        >
          باقة إعلانات
        </Link>
      </div>

      <div className="flex items-center gap-3 w-full">
        <div className="flex-1 flex items-center gap-3 bg-[rgba(241,245,249,0.5)] border border-[#ECECEC] rounded-md p-3.5">
          <div
            className={`rounded-full flex items-center justify-center shrink-0 size-8.5 ${
              isFreeUsed ? 'bg-[#F1F5F9]' : 'bg-[#EAF8F1]'
            }`}
          >
            {isFreeUsed ? (
              <Gift className="w-4 h-4 text-[#6B6A6A]" />
            ) : (
              <Check className="w-4 h-4 text-[#018B1B]" />
            )}
          </div>
          <div className="flex flex-col gap-0.5 text-[13px]">
            <p className="font-medium text-[#6B6A6A]">الإعلان المجاني</p>
            <p
              className={`font-bold ${
                isFreeUsed ? 'text-[#111111]' : 'text-[#018B1B]'
              }`}
            >
              {isFreeUsed ? 'مستخدم' : 'غير مستخدم'}
            </p>
          </div>
        </div>

        <div className="flex-1 flex items-center gap-3 bg-[rgba(173,70,255,0.05)] border border-[#ECECEC] rounded-md p-3.5">
          <div className="bg-[rgba(173,70,255,0.1)] rounded-full flex items-center justify-center shrink-0 size-8.5">
            {paidCredit ? (
              <Ticket className="w-4 h-4 text-[#AD46FF]" />
            ) : (
              <Package className="w-4 h-4 text-[#AD46FF]" />
            )}
          </div>
          <div className="flex flex-col gap-0.5 text-[13px]">
            <p className="font-medium text-[#6B6A6A]">
              {paidCredit || 'لا توجد باقات'}
            </p>
            <p className="font-bold text-[#111111]">
              {paidCredit ? 'رصيد الاعلانات' : 'باقة مدفوعة'}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

