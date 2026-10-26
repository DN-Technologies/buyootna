'use client'

import Link from 'next/link'
import { Button } from '@buyootna/ui'

export interface OfficeVerificationBannerProps {
  submittedAt?: string
  // Without one, «مراجعة الطلب» opens طلبات التوثيق
  onReview?: () => void
}

export default function OfficeVerificationBanner({
  submittedAt,
  onReview,
}: OfficeVerificationBannerProps) {
  const button = (
    <Button
      type="button"
      variant="outline"
      onClick={onReview}
      className="border-[#ECECEC] text-[#111111] text-[13px] font-bold h-9 px-4 rounded-lg bg-white shrink-0 hover:bg-slate-50 cursor-pointer"
    >
      مراجعة الطلب
    </Button>
  )

  return (
    <div
      className="bg-white border border-[#B97500] rounded-lg p-4 flex items-center justify-between gap-4 font-['Cairo'] w-full"
      dir="rtl"
    >
      <div className="flex flex-col gap-1 text-right">
        <h3 className="font-bold text-[15px] text-[#111111]">
          طلب التوثيق بانتظار المراجعة
        </h3>
        {submittedAt && (
          <p className="text-[13px] text-[#6B6A6A] font-medium">
            تم إرسال بيانات الترخيص في {submittedAt}
          </p>
        )}
      </div>

      {onReview ? button : <Link href="/verifications">{button}</Link>}
    </div>
  )
}
