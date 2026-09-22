'use client'

import React from 'react'
import type { AdminPlan } from '@/lib/admin-plans'
import PlanCheckbox from './PlanCheckbox'

interface PlanSelectionSectionProps {
  plans: AdminPlan[]
  loading: boolean
  selectedPlanId: string | null
  onSelectPlan: (planId: string) => void
}

export default function PlanSelectionSection({
  plans,
  loading,
  selectedPlanId,
  onSelectPlan,
}: PlanSelectionSectionProps) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <h3 className="font-['Cairo'] font-medium text-[14px] leading-normal text-[#111111] tracking-[-0.408px] text-right">
        الباقة الجديدة
      </h3>

      {loading ? (
        <p className="text-[13px] text-[#6B6A6A] text-right">
          جاري تحميل الباقات...
        </p>
      ) : (
        <div className="flex flex-col gap-2.5 w-full">
          {plans.map((plan) => {
            const isSelected = selectedPlanId === plan.id

            return (
              <div
                key={plan.id}
                onClick={() => onSelectPlan(plan.id)}
                className={`rounded-lg p-3 flex items-center justify-between gap-4 cursor-pointer select-none transition-all border ${
                  isSelected
                    ? 'bg-[#F9FAFE] border-primary'
                    : 'bg-white border-[#ECECEC] hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col gap-0.5 text-right">
                  <span className="font-['Cairo'] font-bold text-[14px] leading-normal text-[#111111] tracking-[-0.408px]">
                    {plan.name}
                  </span>
                  <span className="text-[12px] text-[#6B6A6A]">
                    {plan.maxActiveAds} إعلان · {plan.durationDays} يوم
                  </span>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="font-['Cairo'] font-bold text-[15px] text-[#474747]">
                    {plan.price} د.ك
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectPlan(plan.id)
                    }}
                    className="size-4 flex items-center justify-center cursor-pointer"
                    aria-label={`اختيار ${plan.name}`}
                  >
                    <PlanCheckbox checked={isSelected} />
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
