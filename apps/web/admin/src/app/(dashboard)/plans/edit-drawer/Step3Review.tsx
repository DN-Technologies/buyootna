'use client'

import { EditPlanFormState, EditPlanDrawerItem } from './edit-plan.types'

export interface Step3ReviewProps {
  formState: EditPlanFormState
  plan: EditPlanDrawerItem
}

export default function Step3Review({ formState, plan }: Step3ReviewProps) {
  const targetAudienceLabel =
    plan.categoryName === 'OFFICE'
      ? 'المكاتب العقارية'
      : plan.categoryName === 'COMPANY'
        ? 'الشركات'
        : 'الأفراد'

  return (
    <div className="flex flex-col gap-6 text-right font-['Cairo']">
      {/* Summary Card Header */}
      <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-2xl p-5 flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[12px] font-medium text-[#6B6A6A]">
            {targetAudienceLabel}
          </span>
          <span
            className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
              formState.status === 'active'
                ? 'bg-[#E6F4EA] text-[#137333]'
                : 'bg-[#FFFBEB] text-[#B45309]'
            }`}
          >
            {formState.status === 'active' ? 'نشطة' : 'مخفية'}
          </span>
        </div>
        <h3 className="text-[18px] font-bold text-[#111111]">
          {formState.planName}
        </h3>
        <span className="text-[14px] font-bold text-[#6B6A6A]">
          {formState.planPrice}
        </span>
      </div>

      {/* Summary Specs List */}
      <div className="flex flex-col gap-5 text-right">
        {/* Section 1: Ads */}
        <div className="flex flex-col gap-3">
          <span className="text-[13px] font-bold text-[#111111]">الإعلانات</span>
          <div className="flex flex-col gap-2 bg-[#F8FAFC] border border-[#ECECEC] rounded-xl p-4">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#6B6A6A]">عدد الإعلانات النشطة</span>
              <span className="font-bold text-[#111111]">
                {formState.adsCount}
              </span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#6B6A6A]">مدة نشر الإعلان</span>
              <span className="font-bold text-[#111111]">
                {formState.durationDays} أيام
              </span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#6B6A6A]">الحد الأقصى للصور</span>
              <span className="font-bold text-[#111111]">
                {formState.photosCount} صور
              </span>
            </div>
          </div>
        </div>

        {/* Section 2: Visibility & Promotion */}
        <div className="flex flex-col gap-3 border-t border-[#ECECEC] pt-4">
          <span className="text-[13px] font-bold text-[#111111]">
            الظهور والتميز
          </span>
          <div className="flex flex-col gap-2 bg-[#F8FAFC] border border-[#ECECEC] rounded-xl p-4">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#6B6A6A]">الظهور في نتائج البحث</span>
              <span
                className={`font-bold ${
                  formState.searchVisibility
                    ? 'text-[#018B1B]'
                    : 'text-[#6B6A6A]'
                }`}
              >
                {formState.searchVisibility ? 'مفعل' : 'غير متاح'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#6B6A6A]">النتائج المميزة</span>
              <span
                className={`font-bold ${
                  formState.featuredResults
                    ? 'text-[#018B1B]'
                    : 'text-[#6B6A6A]'
                }`}
              >
                {formState.featuredResults ? 'مفعل' : 'غير متاح'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#6B6A6A]">تثبيت الإعلان</span>
              <span
                className={`font-bold ${
                  formState.pinnedAds ? 'text-[#111111]' : 'text-[#6B6A6A]'
                }`}
              >
                {formState.pinnedAds
                  ? `${formState.durationDays} ايام`
                  : 'غير متاح'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#6B6A6A]">أولوية البحث الجغرافي</span>
              <span
                className={`font-bold ${
                  formState.prioritySearch
                    ? 'text-[#018B1B]'
                    : 'text-[#6B6A6A]'
                }`}
              >
                {formState.prioritySearch ? 'مفعل' : 'غير متاح'}
              </span>
            </div>
          </div>
        </div>

        {/* Section 3: Contact */}
        <div className="flex flex-col gap-3 border-t border-[#ECECEC] pt-4">
          <span className="text-[13px] font-bold text-[#111111]">التواصل</span>
          <div className="flex flex-col gap-2 bg-[#F8FAFC] border border-[#ECECEC] rounded-xl p-4">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#6B6A6A]">التواصل المباشر مع المهتمين</span>
              <span
                className={`font-bold ${
                  formState.directContact ? 'text-[#018B1B]' : 'text-[#6B6A6A]'
                }`}
              >
                {formState.directContact ? 'مفعل' : 'غير متاح'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
