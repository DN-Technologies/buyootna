'use client'

import React from 'react'
import { ArrowUpLeft, ArrowDownLeft } from 'lucide-react'

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
  trend = 'up',
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
    <div className="bg-[#F8FAFC] flex flex-col gap-2 p-4 rounded-lg flex-1 min-w-50">
      {/* Header Row */}
      <div className="flex items-center justify-between w-full">
        {/* Trend Badge (Left side in RTL) */}
        <div
          className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md ${currentVariant.bg}`}
        >
          {trend === 'up' ? (
            <ArrowUpLeft className={`w-3 h-3 ${currentVariant.text}`} />
          ) : (
            <ArrowDownLeft className={`w-3 h-3 ${currentVariant.text}`} />
          )}
          <span
            className={`font-['Inter'] font-medium text-[11px] leading-[16.5px] ${currentVariant.text}`}
          >
            {change}
          </span>
        </div>

        {/* Title (Right side in RTL) */}
        <p className="font-['Cairo'] font-medium text-[14px] leading-[1.2] text-[#6B6A6A]">
          {title}
        </p>
      </div>

      {/* Count / Value */}
      <div className="flex items-center justify-end w-full mt-1">
        <span className="font-['Cairo'] font-bold text-[24px] leading-[1.4] text-[#111111] text-right">
          {count}
        </span>
      </div>
    </div>
  )
}
