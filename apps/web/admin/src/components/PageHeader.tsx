'use client'

import { ChevronLeft, Download } from 'lucide-react'
import { Button } from '@buyootna/ui'
import React, { Fragment } from 'react'

export interface HeaderAction {
  label: string
  onClick?: () => void
  icon?: React.ReactNode
}

interface PageHeaderProps {
  breadcrumbs: string[]
  title: string
  subtitle?: string
  showExport?: boolean
  onExport?: () => void
  primaryAction?: HeaderAction
  secondaryAction?: HeaderAction
}

export default function PageHeader({
  breadcrumbs,
  title,
  subtitle,
  showExport = true,
  onExport,
  primaryAction,
  secondaryAction,
}: PageHeaderProps) {
  return (
    <div
      className="border-b border-[#ECECEC] pb-5 pt-2.5 px-8 -mx-6 -mt-6 md:-mx-8 md:-mt-8 mb-6 flex flex-col gap-1.5 text-right shrink-0"
      dir="rtl"
    >
      {/* Breadcrumbs */}
      <div className="flex gap-1.5 items-center justify-start text-[14px] font-['Cairo']">
        {breadcrumbs.map((crumb, idx) => (
          <Fragment key={idx}>
            <span
              className={
                idx === breadcrumbs.length - 1
                  ? 'text-[#111111] font-normal'
                  : 'text-[#A0A0A0] font-normal'
              }
            >
              {crumb}
            </span>
            {idx < breadcrumbs.length - 1 && (
              <ChevronLeft className="w-3.5 h-3.5 text-[#A0A0A0]" />
            )}
          </Fragment>
        ))}
      </div>

      {/* Title & Action */}
      <div className="flex items-center justify-between mt-1">
        {/* Title & Subtitle (Right side in RTL) */}
        <div className="space-y-1 text-right">
          <h1 className="font-['Cairo'] font-bold text-[22px] text-[#111111] leading-none">
            {title}
          </h1>
          {subtitle && (
            <p className="font-['Cairo'] font-medium text-[16px] text-[#6B6A6A] leading-normal tracking-[0.32px] mt-1">
              {subtitle}
            </p>
          )}
        </div>

        {/* Action Buttons (Left side in RTL) */}
        <div className="flex items-center gap-2">
          {primaryAction && (
            <Button
              onClick={primaryAction.onClick}
              className="bg-primary hover:bg-[#10243B] text-white rounded-[20px] h-10 px-5 font-['Cairo'] font-bold text-[14px] gap-2 flex items-center justify-center shrink-0 cursor-pointer border-0"
            >
              {primaryAction.label}
              {primaryAction.icon}
            </Button>
          )}

          {secondaryAction && (
            <Button
              onClick={secondaryAction.onClick}
              variant="outline"
              className="bg-white border border-[#E2E8F0] rounded-[20px] h-10 px-5 font-['Cairo'] font-bold text-[14px] text-[#111111] hover:bg-[#F8FAFC] gap-2 flex items-center justify-center shrink-0 cursor-pointer"
            >
              {secondaryAction.icon}
              {secondaryAction.label}
            </Button>
          )}

          {!primaryAction && !secondaryAction && showExport && (
            <Button
              onClick={onExport}
              variant="outline"
              className="bg-white border border-[#E2E8F0] rounded-[20px] h-10 px-5 font-['Cairo'] font-bold text-[14px] text-[#111111] hover:bg-[#F8FAFC] gap-2 flex items-center justify-center shrink-0 cursor-pointer"
            >
              <Download className="w-4 h-4 text-[#111111]" />
              <span>تصدير البيانات</span>
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
