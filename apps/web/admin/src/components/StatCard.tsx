'use client'

import React from 'react'

export interface StatCardProps {
  title: string
  count: number | string
  change: string
  trend?: 'up' | 'down'
  variant?: 'green' | 'red' | 'orange'
}

export default function StatCard({
  title,
  count,
  change,
  variant = 'green',
}: StatCardProps) {
  const variantStyles = {
    green: {
      bg: 'bg-[rgba(18,194,129,0.1)]',
      text: 'text-[#12C281]',
    },
    red: {
      bg: 'bg-[rgba(245,70,81,0.1)]',
      text: 'text-[#F54651]',
    },
    orange: {
      bg: 'bg-[rgba(245,184,70,0.1)]',
      text: 'text-[#F5B846]',
    },
  }

  const currentVariant = variantStyles[variant] || variantStyles.green

  return (
    <div
      className="bg-white border border-[#ECECEC] rounded-lg p-4 flex flex-col gap-2 flex-1 min-w-55 select-none"
      dir="rtl"
    >
      {/* Header Row matching Figma 2772:54884 */}
      <div className="flex items-center justify-between w-full">
        {/* Title (Right side in RTL) */}
        <p className="font-['Cairo'] font-medium text-[14px] leading-[1.2] text-[#6B6A6A]">
          {title}
        </p>

        {/* Badge (Left side in RTL) matching Figma 2772:55554 */}
        <div
          className={`flex items-center justify-center px-1.5 py-0.5 rounded-md ${currentVariant.bg}`}
        >
          <span
            className={`font-['Inter'] font-medium text-[11px] leading-[16.5px] ${currentVariant.text}`}
          >
            {change}
          </span>
        </div>
      </div>

      {/* Value Row matching Figma 2772:54891 */}
      <div className="flex items-center justify-start w-full">
        <span className="font-['Cairo'] font-bold text-[24px] leading-[1.4] text-[#111111] text-right">
          {count}
        </span>
      </div>
    </div>
  )
}
