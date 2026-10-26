import type { VerificationStatusStyle } from './verificationStatus'

/** A coloured dot and the status label (Figma 2772:54232 & 2772:54801). */
export default function VerificationStatusBadge({
  style,
}: {
  style: VerificationStatusStyle
}) {
  return (
    <div className="flex items-center gap-1 h-5 py-0.5">
      <span className={`size-1.5 rounded-full shrink-0 ${style.dotColor}`} />
      <span
        className={`font-['Cairo'] font-medium text-[12px] leading-none ${style.textColor}`}
      >
        {style.label}
      </span>
    </div>
  )
}
