'use client'

import { AlertTriangle, X } from 'lucide-react'

interface DeleteNoteDialogProps {
  open: boolean
  onClose: () => void
  onConfirm: () => void
}

export default function DeleteNoteDialog({
  open,
  onClose,
  onConfirm,
}: DeleteNoteDialogProps) {
  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-['Cairo']">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs"
        onClick={onClose}
      />

      {/* Modal Card */}
      <div
        className="relative bg-white rounded-2xl p-6 w-full max-w-md shadow-2xl flex flex-col items-center text-center z-10"
        dir="rtl"
      >
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 left-4 text-[#6B6A6A] hover:text-[#111111] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="w-12 h-12 rounded-full bg-[#FEF2F2] text-[#DC2626] flex items-center justify-center mb-4">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <h3 className="text-[18px] font-bold text-[#111111] mb-2">
          حذف الملاحظة
        </h3>
        <p className="text-[14px] font-medium text-[#6B6A6A] mb-6 leading-relaxed">
          هل أنت تأكد من رغبتك في حذف هذه الملاحظة؟ لا يمكن التراجع عن هذا الإجراء.
        </p>

        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            onClick={onConfirm}
            className="flex-1 py-2.5 px-4 bg-[#DC2626] hover:bg-[#B91C1C] text-white text-[14px] font-bold rounded-xl transition-colors cursor-pointer"
          >
            حذف
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 px-4 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#111111] text-[14px] font-bold rounded-xl transition-colors cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}
