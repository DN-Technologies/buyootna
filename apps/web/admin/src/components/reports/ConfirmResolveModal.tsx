'use client'

import React from 'react'

interface ConfirmResolveModalProps {
  isOpen: boolean
  count: number
  onClose: () => void
  onConfirm: () => void
  isSubmitting?: boolean
}

export function ConfirmResolveModal({
  isOpen,
  count,
  onClose,
  onConfirm,
  isSubmitting = false,
}: ConfirmResolveModalProps) {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto" dir="rtl">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Center Modal Container */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          className="relative bg-white rounded-xl shadow-2xl w-full max-w-125 px-6 pt-7 pb-6 flex flex-col items-center gap-8 animate-in fade-in zoom-in-95 duration-200"
          data-node-id="4881:16818"
          data-name="popup"
        >
          {/* Header & Description (Figma Node 4940:87775 for single, 4881:16818 for bulk) */}
          <div className="flex flex-col items-center text-center gap-2 max-w-105.5">
            <h3 className="font-['Cairo'] font-bold text-[18px] text-[#111111] leading-normal">
              {count <= 1 ? 'تأكيد إنهاء البلاغ' : 'تأكيد إنهاء البلاغات'}
            </h3>
            <p className="font-['Cairo'] font-normal text-[14px] text-[#6B6A6A] leading-normal tracking-[-0.408px]">
              {count <= 1
                ? 'سيتم تغيير حالة البلاغ إلى "تم الحل". لن تظهر ضمن البلاغات المفتوحة بعد الآن.'
                : `سيتم تغيير حالة ${count} بلاغات محددة إلى "تم الحل". لن تظهر ضمن البلاغات المفتوحة بعد الآن.`}
            </p>
          </div>

          {/* Action Buttons Row */}
          <div className="flex items-center gap-3 w-full">
            {/* Cancel Button */}
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 h-11.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#111111] font-['Cairo'] font-semibold text-[14px] rounded-3xl transition cursor-pointer disabled:opacity-50"
            >
              إلغاء
            </button>

            {/* Confirm Button */}
            <button
              type="button"
              onClick={onConfirm}
              disabled={isSubmitting}
              className="flex-1 h-12 bg-primary hover:bg-[#1c3f64] text-white font-['Cairo'] font-semibold text-[14px] rounded-3xl transition cursor-pointer shadow-xs disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isSubmitting ? <span>جاري الحفظ...</span> : <span>تأكيد</span>}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
