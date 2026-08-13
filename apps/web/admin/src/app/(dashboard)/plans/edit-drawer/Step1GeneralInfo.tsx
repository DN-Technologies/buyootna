'use client'

import { EditPlanFormState } from './edit-plan.types'

export interface Step1GeneralInfoProps {
  formState: EditPlanFormState
  onChange: (updates: Partial<EditPlanFormState>) => void
}

export default function Step1GeneralInfo({
  formState,
  onChange,
}: Step1GeneralInfoProps) {
  return (
    <div className="flex flex-col gap-5 text-right">
      {/* Field: Plan Status */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-medium text-[#111111]">
          حالة الباقة
        </label>
        <div className="border border-[#ECECEC] rounded-xl p-3 flex items-center gap-6">
          <label className="flex items-center gap-2 text-[13px] font-medium text-[#111111] cursor-pointer">
            <input
              type="radio"
              name="planStatus"
              value="active"
              checked={formState.status === 'active'}
              onChange={() => onChange({ status: 'active' })}
              className="size-4 text-primary focus:ring-primary"
            />
            <span>نشطة</span>
          </label>

          <label className="flex items-center gap-2 text-[13px] font-medium text-[#111111] cursor-pointer">
            <input
              type="radio"
              name="planStatus"
              value="hidden"
              checked={formState.status === 'hidden'}
              onChange={() => onChange({ status: 'hidden' })}
              className="size-4 text-primary focus:ring-primary"
            />
            <span>مخفية</span>
          </label>
        </div>
      </div>

      {/* Field: Plan Name */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-medium text-[#111111]">
          اسم الباقة<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formState.planName}
          onChange={(e) => onChange({ planName: e.target.value })}
          placeholder="الباقة العادية"
          className="w-full h-11 border border-[#ECECEC] bg-white rounded-xl px-4 text-[13px] text-[#111111] focus:outline-none focus:border-primary"
        />
      </div>

      {/* Field: Plan Price */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-medium text-[#111111]">
          سعر الباقة<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formState.planPrice}
          onChange={(e) => onChange({ planPrice: e.target.value })}
          placeholder="0 د.ك"
          className="w-full h-11 border border-[#ECECEC] bg-white rounded-xl px-4 text-[13px] text-[#111111] focus:outline-none focus:border-primary"
        />
      </div>

      {/* Field: Validity Duration */}
      <div className="flex flex-col gap-1.5">
        <label className="text-[13px] font-medium text-[#111111]">
          مدة صلاحية<span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={formState.validityDuration}
          onChange={(e) => onChange({ validityDuration: e.target.value })}
          placeholder="10 ايام"
          className="w-full h-11 border border-[#ECECEC] bg-white rounded-xl px-4 text-[13px] text-[#111111] focus:outline-none focus:border-primary"
        />
      </div>
    </div>
  )
}
