'use client'

import { CheckCircle2 } from 'lucide-react'

export interface ReportSuccessToastProps {
  message?: string
  onUndo?: () => void
  onDismiss?: () => void
}

export default function ReportSuccessToast({
  message = 'تم وضع علامة تم الحل (مغلق) للبلاغ بنجاح.',
  onUndo,
  onDismiss,
}: ReportSuccessToastProps) {
  return (
    <div
      className="fixed bottom-6 right-6 z-50 bg-white border border-[#15A72B] rounded-lg shadow-lg px-4 py-3 flex items-center justify-between gap-4 font-['Cairo'] min-w-85 transition-all duration-300"
      dir="rtl"
    >
      <div className="flex items-center gap-2.5">
        <CheckCircle2 className="w-5 h-5 text-[#15A72B] shrink-0" />
        <span className="text-[14px] font-medium text-[#111111]">
          {message}
        </span>
      </div>

      {onUndo && (
        <button
          type="button"
          onClick={onUndo}
          className="text-primary text-[14px] font-bold hover:underline shrink-0 cursor-pointer"
        >
          تراجع
        </button>
      )}
    </div>
  )
}
