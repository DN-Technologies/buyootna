'use client'

import React from 'react'
import Image from 'next/image'

interface DashboardEmptyStateProps {
  title?: string
  subtitle?: string
}

export default function DashboardEmptyState({
  title = 'لا توجد بيانات لعرضها حتى الآن',
  subtitle = 'بمجرد انضمام المستخدمين وبدء استخدام المنصة، ستظهر هنا الإحصائيات وأحدث الأنشطة',
}: DashboardEmptyStateProps) {
  return (
    <div
      className="flex flex-col items-center justify-center py-16 md:py-24 px-4 w-full select-none"
      dir="rtl"
    >
      <div className="flex flex-col items-center gap-3 max-w-lg text-center">
        {/* Vector Illustration matching Figma 2775:55601 */}
        <div className="relative w-54.25 h-37.5 shrink-0 mb-2">
          <Image
            src="/empty-state.svg"
            alt="لا توجد بيانات"
            fill
            priority
            className="object-contain"
          />
        </div>

        {/* Text Container matching Figma 2774:55569 */}
        <div className="flex flex-col gap-2 items-center justify-center text-center w-full">
          <h2 className="font-['Cairo'] font-bold text-[20px] text-[#111111] leading-normal">
            {title}
          </h2>
          <p className="font-['Cairo'] font-semibold text-[16px] text-[#6B6A6A] leading-[1.4]">
            {subtitle}
          </p>
        </div>
      </div>
    </div>
  )
}
