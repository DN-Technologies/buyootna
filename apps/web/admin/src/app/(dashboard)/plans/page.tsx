'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, CheckCircle2, ChevronLeft } from 'lucide-react'
import PlanDetailDrawer, { PlanDetailDrawerItem } from './PlanDetailDrawer'

export interface PlanItem {
  id: string
  name: string
  price: string
  title: string
  isGold?: boolean
  features: string[]
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

const PLANS_DATA: Record<string, PlanItem[]> = {
  INDIVIDUAL: [
    {
      id: 'normal',
      name: 'الباقة العادية',
      price: '0 د.ك',
      title: 'باقة الإعلانات العادية',
      activeAdsCount: '1',
      durationText: '10 أيام',
      photosCountText: '5 صور',
      features: [
        'اعلان واحد نشط.',
        'مدة النشر 10 ايام.',
        'حتى 5 صورة للعقار.',
        'ظهور في نتائج البحث.',
        'تواصل مباشر مع المهتمين.',
      ],
    },
    {
      id: 'silver',
      name: 'الباقة الفضية',
      price: '5 د.ك',
      title: 'باقة الإعلانات الفضية',
      activeAdsCount: '1',
      durationText: '45 يوم',
      photosCountText: '10 صور',
      isPinnedAds: true,
      isFeaturedResults: true,
      features: [
        'اعلان واحد نشط.',
        'مدة النشر 45 يوم.',
        'حتى 10 صورة للعقار.',
        'تثبيت 5 ايام في نتائج البحث.',
        'ظهور في نتائج البحث المميزة.',
        'تواصل مباشر مع المهتمين.',
      ],
    },
    {
      id: 'gold',
      name: 'الباقة الذهبية',
      price: '20 د.ك',
      title: 'باقة الإعلانات الذهبية',
      isGold: true,
      activeAdsCount: '4',
      durationText: '60 يوم',
      photosCountText: '15 صورة',
      isPinnedAds: true,
      pinnedAdsText: '7 ايام',
      isFeaturedResults: true,
      isPrioritySearch: true,
      features: [
        '4 اعلانات نشطة في نفس الوقت.',
        'مدة النشر 60 يوم.',
        'حتى 15 صورة للعقار.',
        'تثبيت 7 ايام في نتائج البحث.',
        'اولوية الظهور في البحث الجغرافي.',
        'ظهور في نتائج البحث المميزة.',
        'تواصل مباشر مع المهتمين.',
      ],
    },
  ],
  OFFICE: [
    {
      id: 'office_normal',
      name: 'الباقة العادية',
      price: '50 د.ك',
      title: 'باقة المكاتب العادية',
      activeAdsCount: '5',
      durationText: '30 يوم',
      photosCountText: '10 صور',
      features: [
        '5 اعلانات نشطة في نفس الوقت.',
        'مدة النشر 30 يوم.',
        'حتى 10 صور لكل عقار.',
        'ظهور في نتائج البحث.',
        'تواصل مباشر مع المهتمين.',
      ],
    },
    {
      id: 'office_silver',
      name: 'الباقة الفضية',
      price: '120 د.ك',
      title: 'باقة المكاتب الفضية',
      activeAdsCount: '15',
      durationText: '45 يوم',
      photosCountText: '15 صورة',
      isPinnedAds: true,
      isFeaturedResults: true,
      features: [
        '15 اعلان نشط في نفس الوقت.',
        'مدة النشر 45 يوم.',
        'حتى 15 صورة لكل عقار.',
        'تثبيت 10 ايام في نتائج البحث.',
        'ظهور في نتائج البحث المميزة.',
        'تواصل مباشر مع المهتمين.',
      ],
    },
    {
      id: 'office_gold',
      name: 'الباقة الذهبية',
      price: '250 د.ك',
      title: 'باقة المكاتب الذهبية',
      isGold: true,
      activeAdsCount: '30',
      durationText: '60 يوم',
      photosCountText: '20 صورة',
      isPinnedAds: true,
      isFeaturedResults: true,
      isPrioritySearch: true,
      features: [
        '30 اعلان نشط في نفس الوقت.',
        'مدة النشر 60 يوم.',
        'حتى 20 صورة لكل عقار.',
        'تثبيت 15 يوم في نتائج البحث.',
        'اولوية الظهور في البحث الجغرافي.',
        'ظهور في نتائج البحث المميزة.',
        'تواصل مباشر مع المهتمين.',
      ],
    },
  ],
  COMPANY: [
    {
      id: 'company_normal',
      name: 'الباقة العادية',
      price: '100 د.ك',
      title: 'باقة الشركات العادية',
      activeAdsCount: '10',
      durationText: '30 يوم',
      photosCountText: '15 صورة',
      features: [
        '10 اعلانات نشطة في نفس الوقت.',
        'مدة النشر 30 يوم.',
        'حتى 15 صورة لكل عقار.',
        'ظهور في نتائج البحث.',
        'تواصل مباشر مع المهتمين.',
      ],
    },
    {
      id: 'company_silver',
      name: 'الباقة الفضية',
      price: '250 د.ك',
      title: 'باقة الشركات الفضية',
      activeAdsCount: '30',
      durationText: '60 يوم',
      photosCountText: '20 صورة',
      isPinnedAds: true,
      isFeaturedResults: true,
      features: [
        '30 اعلان نشط في نفس الوقت.',
        'مدة النشر 60 يوم.',
        'حتى 20 صورة لكل عقار.',
        'تثبيت 15 يوم في نتائج البحث.',
        'ظهور في نتائج البحث المميزة.',
        'تواصل مباشر مع المهتمين.',
      ],
    },
    {
      id: 'company_gold',
      name: 'الباقة الذهبية',
      price: '500 د.ك',
      title: 'باقة الشركات الذهبية',
      isGold: true,
      activeAdsCount: '50',
      durationText: '90 يوم',
      photosCountText: '30 صورة',
      isPinnedAds: true,
      isFeaturedResults: true,
      isPrioritySearch: true,
      features: [
        '50 اعلان نشط في نفس الوقت.',
        'مدة النشر 90 يوم.',
        'حتى 30 صورة لكل عقار.',
        'تثبيت 30 يوم في نتائج البحث.',
        'اولوية الظهور في البحث الجغرافي.',
        'ظهور في نتائج البحث المميزة.',
        'تواصل مباشر مع المهتمين.',
      ],
    },
  ],
}

export default function PlansPage() {
  const [selectedCategory, setSelectedCategory] = useState<
    'INDIVIDUAL' | 'OFFICE' | 'COMPANY'
  >('INDIVIDUAL')

  const [selectedPlanDetail, setSelectedPlanDetail] = useState<PlanDetailDrawerItem | null>(null)
  const [planDetailOpen, setPlanDetailOpen] = useState(false)

  const currentPlans = PLANS_DATA[selectedCategory] || PLANS_DATA.INDIVIDUAL

  const handleOpenDetail = (plan: PlanItem) => {
    setSelectedPlanDetail({
      ...plan,
      categoryName: selectedCategory,
    })
    setPlanDetailOpen(true)
  }

  return (
    <div
      className="flex flex-col gap-6 w-full font-['Cairo'] text-right pb-10"
      dir="rtl"
    >
      {/* Top Header Strip matching Figma Node 4477:132001 */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#ECECEC] pb-4">
        <div className="flex flex-col gap-1">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[13px] text-[#6B6A6A]">
            <Link href="/" className="hover:text-[#111111]">
              الرئيسية
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>المالية</span>
            <ChevronLeft className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="text-[#111111] font-bold">الباقات والأسعار</span>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-[22px] font-bold text-[#111111] mt-1">
            الباقات والأسعار
          </h1>
          <p className="text-[13px] font-medium text-[#6B6A6A]">
            إدارة باقات الاشتراك، الأسعار، والمزايا المتاحة لكل فئة من
            المستخدمين.
          </p>
        </div>

        {/* Primary Action Button */}
        <button
          type="button"
          onClick={() => alert('إضافة باقة جديدة')}
          className="bg-primary hover:bg-[#0f2338] text-white font-bold text-[14px] h-11 px-5 rounded-xl flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>إضافة باقة</span>
        </button>
      </div>

      {/* Summary Metrics Cards Grid (4 Boxes - Figma Node 4477:132001) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Box 1: Total Plans */}
        <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-2xl p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#6B6A6A]">
              إجمالي الباقات
            </span>
            <span className="bg-[#E6F4EA] text-[#137333] font-bold text-[11px] px-2.5 py-1 rounded-md">
              +2 هذا الشهر
            </span>
          </div>
          <span className="text-[28px] font-bold text-[#111111]">3</span>
        </div>

        {/* Box 2: Active Plans */}
        <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-2xl p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#6B6A6A]">
              الباقات النشطة
            </span>
            <span className="bg-[#E6F4EA] text-[#137333] font-bold text-[11px] px-2.5 py-1 rounded-md">
              90% من الإجمالي
            </span>
          </div>
          <span className="text-[28px] font-bold text-[#111111]">3</span>
        </div>

        {/* Box 3: Hidden Plans */}
        <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-2xl p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#6B6A6A]">
              الباقات المخفية
            </span>
            <span className="bg-[#FFFBEB] text-[#B45309] font-bold text-[11px] px-2.5 py-1 rounded-md">
              غير متاحة للشراء
            </span>
          </div>
          <span className="text-[28px] font-bold text-[#111111]">1</span>
        </div>

        {/* Box 4: Most Popular Plan */}
        <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-2xl p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#6B6A6A]">
              الباقة الأكثر اشتراكاً
            </span>
            <span className="bg-[#E6F4EA] text-[#137333] font-bold text-[11px] px-2.5 py-1 rounded-md">
              +10 هذا الشهر
            </span>
          </div>
          <span className="text-[24px] font-bold text-[#111111]">الذهبية</span>
        </div>
      </div>

      {/* Audience Category Tabs (Figma Node 4477:132001) */}
      <div className="border-b border-[#ECECEC] flex items-center gap-8 pt-2">
        <button
          type="button"
          onClick={() => setSelectedCategory('INDIVIDUAL')}
          className={`pb-3 text-[15px] font-bold transition-all relative cursor-pointer ${
            selectedCategory === 'INDIVIDUAL'
              ? 'text-primary'
              : 'text-[#6B6A6A] hover:text-[#111111]'
          }`}
        >
          <span>الأفراد (3)</span>
          {selectedCategory === 'INDIVIDUAL' && (
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('OFFICE')}
          className={`pb-3 text-[15px] font-bold transition-all relative cursor-pointer ${
            selectedCategory === 'OFFICE'
              ? 'text-primary'
              : 'text-[#6B6A6A] hover:text-[#111111]'
          }`}
        >
          <span>المكاتب العقارية (3)</span>
          {selectedCategory === 'OFFICE' && (
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>

        <button
          type="button"
          onClick={() => setSelectedCategory('COMPANY')}
          className={`pb-3 text-[15px] font-bold transition-all relative cursor-pointer ${
            selectedCategory === 'COMPANY'
              ? 'text-primary'
              : 'text-[#6B6A6A] hover:text-[#111111]'
          }`}
        >
          <span>الشركات (3)</span>
          {selectedCategory === 'COMPANY' && (
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* Plans Tier Cards Grid (Figma Node 4477:132001) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {currentPlans.map((plan) => (
          <div
            key={plan.id}
            className="bg-white border border-[#ECECEC] rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between"
          >
            <div>
              {/* Header Banner */}
              <div
                className={`p-6 text-right flex flex-col gap-1 border-b border-[#ECECEC] ${
                  plan.isGold
                    ? 'bg-linear-to-r from-[#FF9E1C] to-[#FFA000] text-white border-transparent'
                    : 'bg-[#F8FAFC]'
                }`}
              >
                <span
                  className={`text-[28px] font-bold leading-tight ${
                    plan.isGold ? 'text-white' : 'text-[#111111]'
                  }`}
                >
                  {plan.price}
                </span>
                <span
                  className={`text-[14px] font-bold ${
                    plan.isGold ? 'text-white/90' : 'text-[#6B6A6A]'
                  }`}
                >
                  {plan.name}
                </span>
              </div>

              {/* Body Feature List */}
              <div className="p-6 flex flex-col gap-4 text-right">
                <h3 className="text-[16px] font-bold text-[#111111]">
                  {plan.title}
                </h3>
                <ul className="flex flex-col gap-3 text-[13px] font-medium text-[#111111]">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-center gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-[#018B1B] shrink-0" />
                      <span>{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Footer Action Buttons */}
            <div className="p-6 pt-0 flex items-center gap-3">
              <button
                type="button"
                onClick={() => handleOpenDetail(plan)}
                className="border border-primary text-primary font-bold text-[13px] hover:bg-slate-50 flex-1 h-10 rounded-xl transition-colors cursor-pointer"
              >
                عرض التفاصيل
              </button>

              <button
                type="button"
                onClick={() => alert(`تعديل ${plan.name}`)}
                className="border border-[#ECECEC] text-[#111111] font-bold text-[13px] hover:bg-slate-50 flex-1 h-10 rounded-xl transition-colors cursor-pointer"
              >
                تعديل
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Plan Detail Drawer */}
      <PlanDetailDrawer
        open={planDetailOpen}
        onClose={() => setPlanDetailOpen(false)}
        plan={selectedPlanDetail}
        onEdit={(plan) => alert(`تعديل ${plan.name}`)}
      />
    </div>
  )
}
