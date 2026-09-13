import React from 'react'

interface CouponModalHeaderProps {
  isMulti: boolean
  targetCount: number
}

export const CouponModalHeader: React.FC<CouponModalHeaderProps> = ({
  isMulti,
  targetCount,
}) => {
  return (
    <div className="flex flex-col gap-4 items-center justify-center text-center w-full">
      {/* Top Badge with Tag Icon (Figma 5634:71645) */}
      <div className="bg-[#f9fafe] flex items-center justify-center size-16 rounded-full shrink-0 shadow-xs">
        <svg
          width="32"
          height="32"
          viewBox="0 0 24 24"
          fill="none"
          stroke="#111111"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="size-8 text-[#111111]"
        >
          <path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z" />
          <path d="M7 7h.01" />
        </svg>
      </div>

      {/* Title & Subtitle (Figma 5634:71647) */}
      <div className="flex flex-col gap-2 items-center justify-center text-center w-full">
        <h3 className="font-['Cairo'] font-bold text-[18px] text-[#111111] leading-normal">
          منح كوبون خصم
        </h3>
        <p className="font-['Cairo'] font-normal text-[14px] leading-normal text-[#6b6a6a] tracking-[-0.408px]">
          {isMulti
            ? `اختر كود الخصم المناسب لتطبيقه على  ${targetCount} مستخدمًا للاشتراك القادم.`
            : 'اختر كود الخصم المناسب لتطبيقه على اشتراك المستخدم القادم'}
        </p>
      </div>
    </div>
  )
}

export default CouponModalHeader
