'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'

export interface PlanDetailDrawerItem {
  id: string
  name: string
  price: string
  title: string
  isGold?: boolean
  features: string[]
  categoryName?: string
  activeAdsCount?: string
  durationText?: string
  photosCountText?: string
  isFeaturedResults?: boolean
  isPinnedAds?: boolean
  isPrioritySearch?: boolean
  pinnedAdsText?: string
  featuredResultsText?: string
  prioritySearchText?: string
}

export interface PlanDetailDrawerProps {
  open: boolean
  onClose: () => void
  plan: PlanDetailDrawerItem | null
  onEdit?: (plan: PlanDetailDrawerItem) => void
}

export default function PlanDetailDrawer({
  open,
  onClose,
  plan,
  onEdit,
}: PlanDetailDrawerProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'features'>(
    'overview',
  )

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', onKeyDown)
    }
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open || !plan) return null

  const categoryLabel =
    plan.categoryName === 'OFFICE'
      ? 'باقة للمكاتب العقارية'
      : plan.categoryName === 'COMPANY'
        ? 'باقة للشركات'
        : 'باقة للأفراد'

  const targetAudience =
    plan.categoryName === 'OFFICE'
      ? 'المكاتب العقارية'
      : plan.categoryName === 'COMPANY'
        ? 'الشركات'
        : 'الأفراد'

  const featuredText =
    plan.featuredResultsText ||
    (plan.isGold || plan.isFeaturedResults ? 'مفعل' : 'غير متاح')

  const pinnedText =
    plan.pinnedAdsText ||
    (plan.isGold ? '7 ايام' : plan.isPinnedAds ? '5 ايام' : 'غير متاح')

  const priorityText =
    plan.prioritySearchText ||
    (plan.isGold || plan.isPrioritySearch ? 'مفعل' : 'غير متاح')

  return (
    <div className="fixed inset-0 z-50 font-['Cairo'] flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Panel */}
      <div
        className="relative bg-white w-full max-w-lg h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto text-right"
        dir="rtl"
      >
        {/* Top Header  */}
        <div className="p-6 border-b border-[#ECECEC] flex items-center justify-between shrink-0">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <h2 className="text-[18px] font-bold text-[#111111]">
                {plan.name}
              </h2>
              <span className="bg-[#E6F4EA] text-[#137333] text-[12px] font-bold px-2.5 py-0.5 rounded-full">
                نشطة
              </span>
            </div>
            <p className="text-[12px] font-medium text-[#6B6A6A]">
              {categoryLabel}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-full text-[#6B6A6A] hover:bg-[#F1F5F9] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Sub-navigation Tabs */}
        <div className="border-b border-[#ECECEC] px-6 flex items-center gap-6 pt-2 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-3 text-[14px] font-bold transition-all relative cursor-pointer ${
              activeTab === 'overview'
                ? 'text-primary'
                : 'text-[#6B6A6A] hover:text-[#111111]'
            }`}
          >
            <span>البيانات العامة</span>
            {activeTab === 'overview' && (
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('features')}
            className={`pb-3 text-[14px] font-bold transition-all relative cursor-pointer ${
              activeTab === 'features'
                ? 'text-primary'
                : 'text-[#6B6A6A] hover:text-[#111111]'
            }`}
          >
            <span>المزايا</span>
            {activeTab === 'features' && (
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        </div>

        {/* Drawer Body Content */}
        <div className="p-6 flex flex-col gap-6 flex-1 text-right">
          {activeTab === 'overview' ? (
            /* Tab 1: General Info (Figma Nodes 4477:132804 & 4477:136291) */
            <div className="flex flex-col gap-6">
              {/* Metrics Bar */}
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-xl p-3.5 flex flex-col gap-1 text-center">
                  <span className="text-[12px] font-medium text-[#6B6A6A]">
                    الاشتراكات
                  </span>
                  <span className="text-[20px] font-bold text-[#111111]">
                    80
                  </span>
                </div>
                <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-xl p-3.5 flex flex-col gap-1 text-center">
                  <span className="text-[12px] font-medium text-[#6B6A6A]">
                    الالغة
                  </span>
                  <span className="text-[20px] font-bold text-[#9C1E28]">
                    80
                  </span>
                </div>
              </div>

              {/* Specs Grid */}
              <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-2xl p-4 flex flex-col gap-3">
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#6B6A6A]">اسم الباقة</span>
                  <span className="font-bold text-[#111111]">
                    {plan.name.replace('الباقة ', '')}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#6B6A6A]">الفئة المستهدفة</span>
                  <span className="font-bold text-[#111111]">
                    {targetAudience}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#6B6A6A]">السعر</span>
                  <span className="font-bold text-[#018B1B]">{plan.price}</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#6B6A6A]">مدة الصلاحية</span>
                  <span className="font-bold text-[#111111]">
                    سنة من تاريخ الاشتراك
                  </span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#6B6A6A]">تاريخ الإنشاء</span>
                  <span className="font-bold text-[#111111]">1 يناير 2024</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#6B6A6A]">آخر تحديث</span>
                  <span className="font-bold text-[#111111]">10 مارس 2024</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#6B6A6A]">بواسطة</span>
                  <span className="font-bold text-[#111111]">
                    علي البالي (مشرف)
                  </span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="text-[#6B6A6A]">الحالة</span>
                  <span className="bg-[#E6F4EA] text-[#137333] text-[11px] font-bold px-2 py-0.5 rounded-full">
                    نشطة
                  </span>
                </div>
              </div>
            </div>
          ) : (
            /* Tab 2: Features (Figma Nodes 4477:137935 & 4477:141307) */
            <div className="flex flex-col gap-6">
              {/* Section 1: Ads */}
              <div className="flex flex-col gap-3">
                <span className="text-[13px] font-bold text-[#111111]">
                  الإعلانات
                </span>
                <div className="flex flex-col gap-2 bg-[#F8FAFC] border border-[#ECECEC] rounded-xl p-4">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[#6B6A6A]">عدد الإعلانات النشطة</span>
                    <span className="font-bold text-[#111111]">
                      {plan.activeAdsCount || (plan.isGold ? '4' : '1')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[#6B6A6A]">مدة نشر الإعلان</span>
                    <span className="font-bold text-[#111111]">
                      {plan.durationText ||
                        (plan.isGold ? '60 يوم' : '10 أيام')}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[#6B6A6A]">الحد الأقصى للصور</span>
                    <span className="font-bold text-[#111111]">
                      {plan.photosCountText ||
                        (plan.isGold ? '15 صورة' : '5 صور')}
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
                    <span className="text-[#6B6A6A]">
                      الظهور في نتائج البحث
                    </span>
                    <span className="font-bold text-[#018B1B]">مفعل</span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[#6B6A6A]">النتائج المميزة</span>
                    <span
                      className={`font-bold ${
                        featuredText === 'مفعل'
                          ? 'text-[#018B1B]'
                          : 'text-[#6B6A6A]'
                      }`}
                    >
                      {featuredText}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[#6B6A6A]">تثبيت الإعلان</span>
                    <span
                      className={`font-bold ${
                        pinnedText !== 'غير متاح'
                          ? 'text-[#111111]'
                          : 'text-[#6B6A6A]'
                      }`}
                    >
                      {pinnedText}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[#6B6A6A]">
                      أولوية البحث الجغرافي
                    </span>
                    <span
                      className={`font-bold ${
                        priorityText === 'مفعل'
                          ? 'text-[#018B1B]'
                          : 'text-[#6B6A6A]'
                      }`}
                    >
                      {priorityText}
                    </span>
                  </div>
                </div>
              </div>

              {/* Section 3: Contact */}
              <div className="flex flex-col gap-3 border-t border-[#ECECEC] pt-4">
                <span className="text-[13px] font-bold text-[#111111]">
                  التواصل
                </span>
                <div className="flex flex-col gap-2 bg-[#F8FAFC] border border-[#ECECEC] rounded-xl p-4">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="text-[#6B6A6A]">
                      التواصل المباشر مع المهتمين
                    </span>
                    <span className="font-bold text-[#018B1B]">مفعل</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#ECECEC] flex items-center gap-3 bg-white shrink-0">
          <button
            type="button"
            onClick={() => {
              onEdit?.(plan)
              onClose()
            }}
            className="h-11 w-full bg-primary hover:bg-[#0f2338] text-white font-bold text-[14px] rounded-full transition-colors cursor-pointer"
          >
            تعديل
          </button>

          <button
            type="button"
            onClick={onClose}
            className="h-11 w-full bg-white border border-[#ECECEC] hover:bg-[#F8FAFC] text-[#111111] font-bold text-[14px] rounded-full transition-colors cursor-pointer"
          >
            اغلاق
          </button>
        </div>
      </div>
    </div>
  )
}
