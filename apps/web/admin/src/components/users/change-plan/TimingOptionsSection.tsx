'use client'

import React from 'react'
import { PlanTiming } from './types'
import PlanRadio from './PlanRadio'

interface TimingOptionsSectionProps {
  timing: PlanTiming
  onTimingChange: (timing: PlanTiming) => void
}

export default function TimingOptionsSection({
  timing,
  onTimingChange,
}: TimingOptionsSectionProps) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <h3 className="font-['Cairo'] font-medium text-[14px] leading-normal text-[#111111] tracking-[-0.408px] text-right">
        متى يبدأ تطبيق الباقة الجديدة؟
      </h3>

      <div className="flex flex-col gap-2.5 w-full">
        {/* Option: فورا */}
        <div
          onClick={() => onTimingChange('immediate')}
          className={`rounded-lg px-3 py-3.25 flex items-start justify-between gap-2 cursor-pointer border transition-all ${
            timing === 'immediate'
              ? 'border-primary bg-white'
              : 'border-[#ECECEC] bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex flex-col gap-2 text-right flex-1">
            <span className="font-['Cairo'] font-semibold text-[14px] leading-normal text-[#111111] tracking-[0.28px]">
              فورا
            </span>
            <p className="font-['Cairo'] font-normal text-[14px] leading-normal text-[#6B6A6A] tracking-[-0.408px]">
              يتم تفعيل الباقة الجديدة مباشر، بالاضافة الى الباقة الحالية
            </p>
          </div>

          {/* Radio Button */}
          <div className="size-4 shrink-0 mt-1 flex items-center justify-center">
            <PlanRadio checked={timing === 'immediate'} />
          </div>
        </div>

        {/* Option: بعد الانتهاء من الباقة الحالية */}
        <div
          onClick={() => onTimingChange('after_expiry')}
          className={`rounded-lg px-3 py-3.25 flex items-start justify-between gap-2 cursor-pointer border transition-all ${
            timing === 'after_expiry'
              ? 'border-primary bg-white'
              : 'border-[#ECECEC] bg-white hover:border-slate-300'
          }`}
        >
          <div className="flex flex-col gap-2 text-right flex-1">
            <span className="font-['Cairo'] font-semibold text-[14px] leading-normal text-[#111111] tracking-[0.28px]">
              بعد الانتهاء من الباقة الحالية
            </span>
            <p className="font-['Cairo'] font-normal text-[14px] leading-normal text-[#6B6A6A] tracking-[-0.408px]">
              سيتم تفعيل الباقة الجديدة تلقائيًا بعد انتهاء الباقة
              الحالية.
            </p>
          </div>

          {/* Radio Button */}
          <div className="size-4 shrink-0 mt-1 flex items-center justify-center">
            <PlanRadio checked={timing === 'after_expiry'} />
          </div>
        </div>
      </div>
    </div>
  )
}
