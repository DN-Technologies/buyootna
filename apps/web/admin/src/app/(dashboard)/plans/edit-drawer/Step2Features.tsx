'use client'

import { ChevronUp, ChevronDown } from 'lucide-react'
import { EditPlanFormState } from './edit-plan.types'

export interface Step2FeaturesProps {
  formState: EditPlanFormState
  onChange: (updates: Partial<EditPlanFormState>) => void
}

export default function Step2Features({
  formState,
  onChange,
}: Step2FeaturesProps) {
  return (
    <div className="flex flex-col gap-6 text-right">
      {/* Section 1: Ads */}
      <div className="flex flex-col gap-3">
        <span className="text-[13px] font-bold text-[#111111]">الإعلانات</span>
        <div className="flex flex-col gap-3">
          {/* Field: Ads Count */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[#6B6A6A]">
              عدد الاعلانات
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                value={formState.adsCount}
                onChange={(e) => onChange({ adsCount: e.target.value })}
                placeholder="اكتب عدد الاعلانات"
                className="w-full h-11 border border-[#ECECEC] bg-white rounded-xl px-4 text-[13px] text-[#111111] focus:outline-none focus:border-primary"
              />
              <div className="absolute left-3 flex flex-col text-[#6B6A6A]">
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      adsCount: String((Number(formState.adsCount) || 0) + 1),
                    })
                  }
                  className="hover:text-[#111111] p-0.5 cursor-pointer"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      adsCount: String(
                        Math.max(0, (Number(formState.adsCount) || 0) - 1),
                      ),
                    })
                  }
                  className="hover:text-[#111111] p-0.5 cursor-pointer"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Field: Photos Count */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[#6B6A6A]">
              عدد الصور
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                value={formState.photosCount}
                onChange={(e) => onChange({ photosCount: e.target.value })}
                placeholder="اكتب عدد الصور"
                className="w-full h-11 border border-[#ECECEC] bg-white rounded-xl px-4 text-[13px] text-[#111111] focus:outline-none focus:border-primary"
              />
              <div className="absolute left-3 flex flex-col text-[#6B6A6A]">
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      photosCount: String(
                        (Number(formState.photosCount) || 0) + 1,
                      ),
                    })
                  }
                  className="hover:text-[#111111] p-0.5 cursor-pointer"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      photosCount: String(
                        Math.max(0, (Number(formState.photosCount) || 0) - 1),
                      ),
                    })
                  }
                  className="hover:text-[#111111] p-0.5 cursor-pointer"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Field: Publishing Duration */}
          <div className="flex flex-col gap-1">
            <label className="text-[12px] font-medium text-[#6B6A6A]">
              مدة نشر الإعلان
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                value={formState.durationDays}
                onChange={(e) => onChange({ durationDays: e.target.value })}
                placeholder="بالايام"
                className="w-full h-11 border border-[#ECECEC] bg-white rounded-xl px-4 text-[13px] text-[#111111] focus:outline-none focus:border-primary"
              />
              <div className="absolute left-3 flex flex-col text-[#6B6A6A]">
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      durationDays: String(
                        (Number(formState.durationDays) || 0) + 1,
                      ),
                    })
                  }
                  className="hover:text-[#111111] p-0.5 cursor-pointer"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    onChange({
                      durationDays: String(
                        Math.max(0, (Number(formState.durationDays) || 0) - 1),
                      ),
                    })
                  }
                  className="hover:text-[#111111] p-0.5 cursor-pointer"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Visibility & Promotion */}
      <div className="flex flex-col gap-3 border-t border-[#ECECEC] pt-4">
        <span className="text-[13px] font-bold text-[#111111]">
          الظهور والتميز
        </span>
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] text-[#111111]">
              الظهور في نتائج البحث
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={formState.searchVisibility}
              onClick={() =>
                onChange({ searchVisibility: !formState.searchVisibility })
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formState.searchVisibility ? 'bg-primary' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  formState.searchVisibility
                    ? '-translate-x-5'
                    : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[13px] text-[#111111]">النتائج المميزة</span>
            <button
              type="button"
              role="switch"
              aria-checked={formState.featuredResults}
              onClick={() =>
                onChange({ featuredResults: !formState.featuredResults })
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formState.featuredResults ? 'bg-primary' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  formState.featuredResults ? '-translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[13px] text-[#111111]">تثبيت الإعلان</span>
            <button
              type="button"
              role="switch"
              aria-checked={formState.pinnedAds}
              onClick={() => onChange({ pinnedAds: !formState.pinnedAds })}
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formState.pinnedAds ? 'bg-primary' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  formState.pinnedAds ? '-translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-[13px] text-[#111111]">
              أولوية البحث الجغرافي
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={formState.prioritySearch}
              onClick={() =>
                onChange({ prioritySearch: !formState.prioritySearch })
              }
              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                formState.prioritySearch ? 'bg-primary' : 'bg-slate-200'
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                  formState.prioritySearch ? '-translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>
      </div>

      {/* Section 3: Contact */}
      <div className="flex flex-col gap-3 border-t border-[#ECECEC] pt-4">
        <span className="text-[13px] font-bold text-[#111111]">التواصل</span>
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#111111]">
            التواصل المباشر مع المهتمين
          </span>
          <button
            type="button"
            role="switch"
            aria-checked={formState.directContact}
            onClick={() =>
              onChange({ directContact: !formState.directContact })
            }
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              formState.directContact ? 'bg-primary' : 'bg-slate-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                formState.directContact ? '-translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>
    </div>
  )
}
