'use client'

import React from 'react'
import { PLAN_DEFINITIONS } from './constants'
import PlanCheckbox from './PlanCheckbox'

interface PlanSelectionSectionProps {
  selectedPlanId: 'basic' | 'gold' | null
  selectedSubTierId: string | null
  onPlanToggle: (planId: 'basic' | 'gold') => void
  onSubTierSelect: (subTierId: string) => void
}

export default function PlanSelectionSection({
  selectedPlanId,
  selectedSubTierId,
  onPlanToggle,
  onSubTierSelect,
}: PlanSelectionSectionProps) {
  return (
    <div className="flex flex-col gap-3 w-full">
      <h3 className="font-['Cairo'] font-medium text-[14px] leading-normal text-[#111111] tracking-[-0.408px] text-right">
        الباقة الجديدة
      </h3>

      <div className="flex flex-col gap-2.5 w-full">
        {PLAN_DEFINITIONS.map((plan) => {
          const isSelected = selectedPlanId === plan.id

          return (
            <div
              key={plan.id}
              className={`rounded-lg p-3 flex flex-col gap-4 transition-all border ${
                isSelected
                  ? 'bg-[#F9FAFE] border-primary'
                  : 'bg-white border-[#ECECEC] hover:border-slate-300'
              }`}
            >
              {/* Main Plan Card Header */}
              <div
                className="flex items-center justify-between w-full cursor-pointer select-none"
                onClick={() => onPlanToggle(plan.id)}
              >
                <span className="font-['Cairo'] font-bold text-[14px] leading-normal text-[#111111] tracking-[-0.408px]">
                  {plan.name}
                </span>

                {/* Custom Checkbox */}
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onPlanToggle(plan.id)
                  }}
                  className="size-4 shrink-0 flex items-center justify-center cursor-pointer"
                  aria-label={`اختيار ${plan.name}`}
                >
                  <PlanCheckbox checked={isSelected} />
                </button>
              </div>

              {/* Sub-tier items when expanded */}
              {isSelected && (
                <div className="flex gap-4 items-center justify-end px-3 pt-1 border-t border-slate-200/60">
                  {plan.subTiers.map((sub) => {
                    const isSubSelected = selectedSubTierId === sub.id

                    return (
                      <div
                        key={sub.id}
                        onClick={() => onSubTierSelect(sub.id)}
                        className="flex flex-1 items-start justify-between gap-2 cursor-pointer select-none p-2 rounded-lg hover:bg-slate-100/60 transition-colors"
                      >
                        <div className="flex flex-col gap-1 text-right">
                          <span className="font-['Cairo'] font-semibold text-[13px] leading-normal text-[#111111] tracking-[0.26px]">
                            {sub.name}
                          </span>
                          <span className="font-['Cairo'] font-bold text-[16px] leading-[1.2] text-[#474747]">
                            {sub.price}
                          </span>
                        </div>

                        {/* Subtier Checkbox */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            onSubTierSelect(sub.id)
                          }}
                          className="size-4 shrink-0 mt-0.5 flex items-center justify-center cursor-pointer"
                          aria-label={`اختيار ${sub.name}`}
                        >
                          <PlanCheckbox checked={isSubSelected} />
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
