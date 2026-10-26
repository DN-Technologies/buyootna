import { CloseIcon } from '@/components/icons/AdminIcons'
import VerificationStatusBadge from './VerificationStatusBadge'
import type { VerificationStatusStyle } from './verificationStatus'

interface ReviewDrawerHeaderProps {
  name: string
  sentLabel: string
  status: VerificationStatusStyle
  onClose: () => void
}

/** Title, the company/office name with when it was sent, and the status (Figma 2772:54187). */
export default function ReviewDrawerHeader({
  name,
  sentLabel,
  status,
  onClose,
}: ReviewDrawerHeaderProps) {
  return (
    <div className="p-5 border-b border-[#ECECEC] flex items-start justify-between bg-white">
      <button
        type="button"
        onClick={onClose}
        className="size-8 rounded-full flex items-center justify-center text-[#6B6A6A] hover:text-[#111111] hover:bg-slate-100 transition-colors cursor-pointer"
        aria-label="إغلاق"
      >
        <CloseIcon className="w-5 h-5" />
      </button>

      <div className="flex flex-col gap-1 items-end justify-center text-right">
        <h2 className="font-['Cairo'] font-bold text-[16px] text-[#111111] leading-tight">
          مراجعة طلب التوثيق
        </h2>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="font-['Cairo'] font-normal text-[14px] text-[#6B6A6A] leading-normal tracking-[-0.408px]">
            {sentLabel ? `${name} · ${sentLabel}` : name}
          </span>
          <VerificationStatusBadge style={status} />
        </div>
      </div>
    </div>
  )
}
