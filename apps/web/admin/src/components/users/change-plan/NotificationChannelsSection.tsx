'use client'

import React from 'react'
import PlanCheckbox from './PlanCheckbox'

interface NotificationChannelsSectionProps {
  notifyEmail: boolean
  notifyApp: boolean
  onToggleEmail: () => void
  onToggleApp: () => void
}

export default function NotificationChannelsSection({
  notifyEmail,
  notifyApp,
  onToggleEmail,
  onToggleApp,
}: NotificationChannelsSectionProps) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <span className="font-['Cairo'] font-medium text-[14px] leading-normal text-[#1C1D1F] tracking-[-0.408px] text-right">
        ارسال اشعار للمستخدم عبر :
      </span>

      <div className="flex flex-col gap-2 w-full">
        {/* Checkbox 1: البريد الالكتروني */}
        <div
          onClick={onToggleEmail}
          className="flex items-center justify-between cursor-pointer py-1 select-none"
        >
          <span className="font-['Cairo'] font-medium text-[14px] leading-normal text-[#6B6A6A] tracking-[-0.408px]">
            البريد الالكتروني.
          </span>
          <div className="size-4 shrink-0 flex items-center justify-center">
            <PlanCheckbox checked={notifyEmail} />
          </div>
        </div>

        {/* Checkbox 2: داخل التطبيق */}
        <div
          onClick={onToggleApp}
          className="flex items-center justify-between cursor-pointer py-1 select-none"
        >
          <span className="font-['Cairo'] font-medium text-[14px] leading-normal text-[#6B6A6A] tracking-[-0.408px]">
            داخل التطبيق.
          </span>
          <div className="size-4 shrink-0 flex items-center justify-center">
            <PlanCheckbox checked={notifyApp} />
          </div>
        </div>
      </div>
    </div>
  )
}
