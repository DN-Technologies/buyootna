'use client'

export interface EditPlanStepperProps {
  step: 1 | 2 | 3
}

export default function EditPlanStepper({ step }: EditPlanStepperProps) {
  return (
    <div className="px-6 py-4 border-b border-[#ECECEC] flex items-center justify-between gap-2 shrink-0 bg-[#F8FAFC]">
      {/* Step 1 */}
      <div className="flex items-center gap-2">
        <div
          className={`size-6 rounded-full flex items-center justify-center text-[12px] font-bold ${
            step === 1
              ? 'bg-primary text-white'
              : step > 1
                ? 'bg-[#E6F4EA] text-[#137333]'
                : 'bg-slate-200 text-[#6B6A6A]'
          }`}
        >
          1
        </div>
        <span
          className={`text-[13px] font-bold ${
            step === 1 ? 'text-primary' : 'text-[#6B6A6A]'
          }`}
        >
          البيانات العامة
        </span>
      </div>

      <div className="h-px bg-[#CBD5E1] flex-1 max-w-7.5" />

      {/* Step 2 */}
      <div className="flex items-center gap-2">
        <div
          className={`size-6 rounded-full flex items-center justify-center text-[12px] font-bold ${
            step === 2
              ? 'bg-primary text-white'
              : step > 2
                ? 'bg-[#E6F4EA] text-[#137333]'
                : 'bg-slate-200 text-[#6B6A6A]'
          }`}
        >
          2
        </div>
        <span
          className={`text-[13px] font-bold ${
            step === 2 ? 'text-primary' : 'text-[#6B6A6A]'
          }`}
        >
          الميزات
        </span>
      </div>

      <div className="h-px bg-[#CBD5E1] flex-1 max-w-7.5" />

      {/* Step 3 */}
      <div className="flex items-center gap-2">
        <div
          className={`size-6 rounded-full flex items-center justify-center text-[12px] font-bold ${
            step === 3 ? 'bg-primary text-white' : 'bg-slate-200 text-[#6B6A6A]'
          }`}
        >
          3
        </div>
        <span
          className={`text-[13px] font-bold ${
            step === 3 ? 'text-primary' : 'text-[#6B6A6A]'
          }`}
        >
          المراجعة
        </span>
      </div>
    </div>
  )
}
