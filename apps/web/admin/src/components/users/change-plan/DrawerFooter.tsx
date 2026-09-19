'use client'

import React from 'react'
import { Loader2 } from 'lucide-react'

interface DrawerFooterProps {
  onClose: () => void
  onSubmit: () => void
  isFormValid: boolean
  loading: boolean
}

export default function DrawerFooter({
  onClose,
  onSubmit,
  isFormValid,
  loading,
}: DrawerFooterProps) {
  return (
    <div className="border-t border-[#ECECEC] p-[16px_20px] flex gap-3 items-center shrink-0 bg-white">
      {/* Cancel Button */}
      <button
        type="button"
        onClick={onClose}
        disabled={loading}
        className="flex-1 h-12 rounded-3xl border border-[#E2E8F0] bg-white text-[#111111] font-['Cairo'] font-semibold text-[14px] tracking-[0.28px] hover:bg-slate-50 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-60"
      >
        إلغاء
      </button>

      {/* Submit Button */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={!isFormValid || loading}
        className={`flex-1 h-12 rounded-3xl font-['Cairo'] font-semibold text-[14px] tracking-[0.28px] flex items-center justify-center gap-2 transition-all ${
          isFormValid && !loading
            ? 'bg-primary border border-primary text-white hover:bg-[#0f2338] cursor-pointer'
            : 'bg-[#A6A6A6] border border-[#A6A6A6] text-white cursor-not-allowed opacity-90'
        }`}
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        <span>اضافة الباقة</span>
      </button>
    </div>
  )
}
