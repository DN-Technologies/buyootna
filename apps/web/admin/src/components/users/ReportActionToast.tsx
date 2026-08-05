'use client'

import { useEffect } from 'react'
import { CheckCircle2 } from 'lucide-react'

export interface ToastState {
  message: string
  onUndo?: () => void
}

export default function ReportActionToast({
  toast,
  onDismiss,
}: {
  toast: ToastState
  onDismiss: () => void
}) {
  useEffect(() => {
    const timer = setTimeout(onDismiss, 5000)
    return () => clearTimeout(timer)
  }, [toast, onDismiss])

  return (
    <div
      className="absolute top-4 inset-x-4 z-30 bg-white border border-[#15A72B] rounded-lg px-4 py-2.5 flex items-center justify-end gap-2 shadow-lg font-['Cairo']"
      dir="rtl"
    >
      {toast.onUndo && (
        <button
          type="button"
          onClick={() => {
            toast.onUndo?.()
            onDismiss()
          }}
          className="text-[16px] font-bold text-primary cursor-pointer shrink-0"
        >
          تراجع
        </button>
      )}
      <p className="text-[16px] font-medium text-[#111111] flex-1 text-right">
        {toast.message}
      </p>
      <CheckCircle2 className="w-6 h-6 text-[#15A72B] shrink-0" />
    </div>
  )
}
