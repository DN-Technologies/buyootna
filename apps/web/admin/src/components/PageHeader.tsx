'use client'

import { Download } from 'lucide-react'
import { Button } from '@buyootna/ui'
import { Fragment } from 'react/jsx-runtime'

interface PageHeaderProps {
  breadcrumbs: string[]
  title: string
  subtitle?: string
  showExport?: boolean
  onExport?: () => void
}

export default function PageHeader({
  breadcrumbs,
  title,
  subtitle,
  showExport = true,
  onExport,
}: PageHeaderProps) {
  return (
    <div
      className="border-b border-[#ECECEC] pb-[20px] pt-[10px] px-8  -mx-6 -mt-6 md:-mx-8 md:-mt-8 mb-6 flex flex-col gap-1.5 text-right shrink-0"
      dir="rtl"
    >
      {/* Breadcrumbs */}
      <div className="flex gap-1 items-center justify-start text-[14px] text-[#6B6A6A] font-['Cairo']">
        {breadcrumbs.map((crumb, idx) => (
          <Fragment key={idx}>
            <span
              className={idx === breadcrumbs.length - 1 ? 'text-[#111111]' : ''}
            >
              {crumb}
            </span>
            {idx < breadcrumbs.length - 1 && (
              <span className="text-[#ECECEC] mx-1">/</span>
            )}
          </Fragment>
        ))}
      </div>

      {/* Title & Action */}
      <div className="flex items-center justify-between mt-1">
        {/* Title & Subtitle */}
        <div className="space-y-1">
          <h1 className="font-['Cairo'] font-bold text-[22px] text-[#111111] leading-none">
            {title}
          </h1>
          {subtitle && (
            <p className="font-['Cairo'] font-medium text-[14px] text-[#6B6A6A] leading-normal tracking-[0.32px] mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Button */}
        {showExport && (
          <Button
            onClick={onExport}
            variant="outline"
            className="bg-white border border-[#E2E8F0] rounded-[20px] h-[40px] px-[20px] font-['Cairo'] font-bold text-[14px] text-[#111111] hover:bg-[#F8F9FA] gap-2 flex items-center shrink-0 cursor-pointer"
          >
            <Download className="w-[16px] h-[16px] text-[#6B6A6A]" />
            <span>تصدير</span>
          </Button>
        )}
      </div>
    </div>
  )
}
