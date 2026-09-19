import React from 'react'
import { Loader2 } from 'lucide-react'

interface CouponModalFooterProps {
  onClose: () => void
  onSubmit: () => void
  canSubmit: boolean
  loading: boolean
}

export const CouponModalFooter: React.FC<CouponModalFooterProps> = ({
  onClose,
  onSubmit,
  canSubmit,
  loading,
}) => {
  return (
    <div className="flex gap-3 items-center justify-end w-full max-w-113 shrink-0 pt-2">
      {/* Cancel Button */}
      <button
        type="button"
        onClick={onClose}
        disabled={loading}
        className="flex-1 h-11.5 rounded-3xl border border-[#e2e8f0] bg-white text-[#111111] font-['Cairo'] font-semibold text-[14px] tracking-[0.28px] hover:bg-slate-50 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-60"
      >
        إلغاء
      </button>

      {/* Submit Button */}
      <button
        type="button"
        onClick={onSubmit}
        disabled={!canSubmit || loading}
        className={`flex-1 h-12 rounded-3xl font-['Cairo'] font-semibold text-[14px] tracking-[0.28px] flex items-center justify-center gap-2 transition-all ${
          canSubmit && !loading
            ? 'bg-primary hover:bg-[#0f2338] text-white cursor-pointer'
            : 'bg-[#A6A6A6] text-white cursor-not-allowed opacity-90'
        }`}
      >
        {loading && <Loader2 className="size-4 animate-spin" />}
        <span>ارسال الكوبون</span>
      </button>
    </div>
  )
}

export default CouponModalFooter
