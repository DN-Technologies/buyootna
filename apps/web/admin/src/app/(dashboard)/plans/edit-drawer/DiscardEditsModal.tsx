'use client'

import { AlertTriangle } from 'lucide-react'

export interface DiscardEditsModalProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function DiscardEditsModal({
  open,
  onClose,
  onConfirm,
}: DiscardEditsModalProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-60 font-['Cairo'] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal Box */}
      <div
        className="relative bg-white rounded-3xl p-6 w-full max-w-md shadow-2xl flex flex-col items-center text-center gap-4 z-10"
        dir="rtl"
      >
        <div className="size-14 rounded-full bg-[#F8FAFC] border border-[#ECECEC] flex items-center justify-center text-[#111111]">
          <AlertTriangle className="w-6 h-6 stroke-2" />
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="text-[18px] font-bold text-[#111111]">
            إلغاء التعديلات؟
          </h3>
          <p className="text-[13px] font-medium text-[#6B6A6A]">
            سيتم فقدان جميع التعديلات غير المحفوظة.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full mt-2">
          <button
            type="button"
            onClick={onClose}
            className="h-11 flex-1 bg-primary hover:bg-[#0f2338] text-white font-bold text-[14px] rounded-full transition-colors cursor-pointer"
          >
            متابعة التعديل
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="h-11 flex-1 bg-white border border-[#ECECEC] hover:bg-[#F8FAFC] text-[#111111] font-bold text-[14px] rounded-full transition-colors cursor-pointer"
          >
            تجاهل التعديلات
          </button>
        </div>
      </div>
    </div>
  )
}
