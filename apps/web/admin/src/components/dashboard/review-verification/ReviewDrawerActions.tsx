const BUTTON =
  "flex-1 h-11.5 rounded-3xl font-['Cairo'] font-semibold text-[14px] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
const DANGER = `${BUTTON} bg-white border border-[#9C1E28] hover:bg-red-50/50 text-[#9C1E28]`

interface ReviewDrawerActionsProps {
  verified: boolean
  onApprove: () => void
  onRequestEdit?: () => void
  onReject?: () => void
  onRevoke?: () => void
}

/**
 * The sticky footer: a verified one can only be revoked (Figma 2772:54596);
 * a pending one is approved, sent back for edits or rejected (2772:54211).
 */
export default function ReviewDrawerActions({
  verified,
  onApprove,
  onRequestEdit,
  onReject,
  onRevoke,
}: ReviewDrawerActionsProps) {
  if (verified) {
    return (
      <div className="border-t border-[#ECECEC] px-5 py-4 flex items-center bg-white w-full">
        <button type="button" onClick={onRevoke ?? onReject} className={DANGER}>
          إلغاء التوثيق
        </button>
      </div>
    )
  }

  return (
    <div className="border-t border-[#ECECEC] px-5 py-4 flex items-center gap-3 bg-white w-full">
      <button
        type="button"
        onClick={onApprove}
        className={`${BUTTON} h-12 bg-primary hover:bg-[#1E4368] text-white`}
      >
        اعتماد التوثيق
      </button>
      {onRequestEdit && (
        <button
          type="button"
          onClick={onRequestEdit}
          className={`${BUTTON} bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#111111]`}
        >
          طلب تعديل
        </button>
      )}
      {onReject && (
        <button type="button" onClick={onReject} className={DANGER}>
          رفض الطلب
        </button>
      )}
    </div>
  )
}
