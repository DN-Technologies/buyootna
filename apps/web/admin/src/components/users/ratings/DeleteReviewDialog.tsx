'use client'

import { useEffect } from 'react'
import { Trash2 } from 'lucide-react'

export interface DeleteReviewDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteReviewDialog({
  open,
  onClose,
  onConfirm,
}: DeleteReviewDialogProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', onKeyDown)
    }
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 font-['Cairo'] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal Dialog Box */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col items-center justify-center text-center gap-5 z-10"
        dir="rtl"
      >
        {/* Red Trash Icon Badge */}
        <div className="size-16 rounded-full bg-[#FEF2F2] flex items-center justify-center text-[#991B1B]">
          <Trash2 className="w-7 h-7" />
        </div>

        {/* Title & Description */}
        <div className="flex flex-col gap-2 text-center w-full">
          <h2 className="text-[20px] font-bold text-[#111111]">
            حذف التعليق نهائياً؟
          </h2>
          <p className="text-[14px] font-medium text-[#6B6A6A] leading-relaxed">
            هل أنت متأكد من حذف هذا التعليق؟ هذا الإجراء سيؤدي إلى إزالة الرأي
            والتقييم المرتبط به نهائياً ولا يمكن التراجع عنه.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full pt-2">
          <button
            type="button"
            onClick={() => {
              onConfirm()
              onClose()
            }}
            className="flex-1 h-11 bg-[#991B1B] hover:bg-[#7F1D1D] text-white font-bold text-[14px] rounded-full transition-colors cursor-pointer"
          >
            نعم، احذف
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 bg-white border border-[#ECECEC] hover:bg-[#F8FAFC] text-[#111111] font-bold text-[14px] rounded-full transition-colors cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}
