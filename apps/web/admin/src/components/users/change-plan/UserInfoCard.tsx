'use client'

import React from 'react'

interface UserInfoCardProps {
  name: string
  email: string
  accountType: string
  currentPlan?: string
  hasCurrentPlan: boolean
}

export default function UserInfoCard({
  name,
  email,
  accountType,
  currentPlan,
  hasCurrentPlan,
}: UserInfoCardProps) {
  return (
    <div className="bg-[#F9FAFE] rounded-lg px-5 py-4 flex flex-col gap-2.5 w-full shrink-0">
      {/* User Name, Email, Account Type */}
      <div className="flex items-start justify-between w-full">
        <div className="flex flex-col gap-1 text-right">
          <span className="font-['Cairo'] font-medium text-[16px] leading-[1.3] text-[#111111]">
            {name}
          </span>
          <span className="font-['Cairo'] font-normal text-[14px] leading-[16.5px] text-[#6B6A6A] tracking-[0.44px]">
            {email}
          </span>
        </div>
        <div className="bg-white border border-[#E2E8F0] px-2 py-1 rounded-full flex items-center justify-center shrink-0">
          <span className="font-['Cairo'] font-semibold text-[14px] leading-[1.2] text-[#111111]">
            {accountType}
          </span>
        </div>
      </div>

      {/* Current Plan Row */}
      <div className="flex items-center justify-between w-full pt-1 border-t border-slate-100/70">
        <span className="font-['Cairo'] font-medium text-[13px] leading-[16.5px] text-[#6B6A6A] tracking-[0.44px]">
          الباقة الحالية :
        </span>
        <div className="px-2">
          {hasCurrentPlan ? (
            <span className="bg-[#ECECEC] text-[#111111] font-['Cairo'] font-medium text-[12px] px-2 py-0.5 rounded">
              {currentPlan}
            </span>
          ) : (
            <span className="font-['Cairo'] font-normal text-[12px] leading-[19.5px] text-[#6B6A6A]">
              ـــــــ
            </span>
          )}
        </div>
      </div>
    </div>
  )
}
