import React from 'react'

interface CouponNotificationSectionProps {
  isMulti: boolean
  notifyEmail: boolean
  notifyApp: boolean
  onToggleEmail: () => void
  onToggleApp: () => void
}

function CheckboxIcon({ checked }: { checked: boolean }) {
  if (checked) {
    return (
      <svg
        width="16"
        height="16"
        viewBox="0 0 16 16"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="size-4 shrink-0"
      >
        <rect width="16" height="16" rx="4" fill="#15304D" />
        <path
          d="M4.5 8L7 10.5L11.5 5.5"
          stroke="white"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    )
  }

  return (
    <svg
      width="16"
      height="16"
      viewBox="0 0 16 16"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="size-4 shrink-0"
    >
      <rect
        x="0.5"
        y="0.5"
        width="15"
        height="15"
        rx="3.5"
        stroke="#D7D7D7"
        fill="white"
      />
    </svg>
  )
}

export const CouponNotificationSection: React.FC<CouponNotificationSectionProps> = ({
  isMulti,
  notifyEmail,
  notifyApp,
  onToggleEmail,
  onToggleApp,
}) => {
  return (
    <div className="flex flex-col gap-2 items-start w-full pt-1">
      <span className="font-['Cairo'] font-medium text-[14px] leading-normal text-[#111111] tracking-[-0.408px] text-right">
        {isMulti
          ? 'ارسال اشعار للمستخدمين عبر :'
          : 'ارسال اشعار للمستخدم عبر :'}
      </span>

      <div className="flex flex-col gap-1 w-full">
        {/* Checkbox 1: البريد الالكتروني */}
        <div
          onClick={onToggleEmail}
          className="flex items-center justify-between cursor-pointer py-1 select-none"
        >
          <span className="font-['Cairo'] font-medium text-[14px] leading-normal text-[#6b6a6a] tracking-[-0.408px]">
            البريد الالكتروني.
          </span>
          <div className="size-4 shrink-0 flex items-center justify-center">
            <CheckboxIcon checked={notifyEmail} />
          </div>
        </div>

        {/* Checkbox 2: داخل التطبيق */}
        <div
          onClick={onToggleApp}
          className="flex items-center justify-between cursor-pointer py-1 select-none"
        >
          <span className="font-['Cairo'] font-medium text-[14px] leading-normal text-[#6b6a6a] tracking-[-0.408px]">
            داخل التطبيق.
          </span>
          <div className="size-4 shrink-0 flex items-center justify-center">
            <CheckboxIcon checked={notifyApp} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default CouponNotificationSection
