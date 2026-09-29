'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, CheckCircle2, ChevronLeft } from 'lucide-react'
import PlanDetailDrawer, { PlanDetailDrawerItem } from './PlanDetailDrawer'
import EditPlanDrawer, { EditPlanDrawerItem } from './EditPlanDrawer'
import {
  AdminCatalogPlan,
  buildPlanFeatures,
  fetchPlanCatalog,
  updatePlan,
} from '@/lib/admin-plans'

export interface PlanItem {
  id: string
  name: string
  price: string
  title: string
  isGold?: boolean
  isActive?: boolean
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

// The app sells one set of plans (العادية / الفضية / الذهبية) to every
// account type, so each tab shows the same real plans from the API.
function toPlanItem(plan: AdminCatalogPlan): PlanItem {
  const featured = plan.featuredDays > 0
  return {
    id: plan.id,
    name: `الباقة ${plan.name}`,
    price: `${plan.price} د.ك`,
    title: `باقة الإعلانات ${plan.name}`,
    isGold: plan.slug === 'gold',
    isActive: plan.isActive,
    features: plan.features.length ? plan.features : buildPlanFeatures(plan),
    activeAdsCount: String(plan.maxActiveAds),
    durationText: `${plan.durationDays} يوم`,
    photosCountText: `${plan.maxImagesPerAd} صور`,
    isPinnedAds: featured,
    isFeaturedResults: featured,
    isPrioritySearch: plan.prioritySearch,
    pinnedAdsText: featured ? `${plan.featuredDays} ايام` : 'غير متاح',
    featuredResultsText: featured ? 'مفعل' : 'غير متاح',
    prioritySearchText: plan.prioritySearch ? 'مفعل' : 'غير متاح',
  }
}

const digits = (text?: string) => Number((text ?? '').replace(/[^\d.]/g, ''))

export default function PlansPage() {
  const [selectedCategory, setSelectedCategory] = useState<
    'INDIVIDUAL' | 'OFFICE' | 'COMPANY'
  >('INDIVIDUAL')

  const [selectedPlanDetail, setSelectedPlanDetail] = useState<PlanDetailDrawerItem | null>(null)
  const [planDetailOpen, setPlanDetailOpen] = useState(false)

  const [selectedEditPlan, setSelectedEditPlan] = useState<EditPlanDrawerItem | null>(null)
  const [editPlanOpen, setEditPlanOpen] = useState(false)

  const [catalog, setCatalog] = useState<AdminCatalogPlan[]>([])
  const [loadError, setLoadError] = useState<string | null>(null)

  const loadPlans = useCallback(async () => {
    try {
      setCatalog(await fetchPlanCatalog())
      setLoadError(null)
    } catch {
      setLoadError('تعذر تحميل الباقات')
    }
  }, [])

  useEffect(() => {
    void loadPlans()
  }, [loadPlans])

  const currentPlans = useMemo(() => catalog.map(toPlanItem), [catalog])

  const now = new Date()
  const addedThisMonth = catalog.filter((p) => {
    const created = new Date(p.createdAt)
    return (
      created.getMonth() === now.getMonth() &&
      created.getFullYear() === now.getFullYear()
    )
  }).length
  const activeCount = catalog.filter((p) => p.isActive).length
  const hiddenCount = catalog.length - activeCount
  const activePercent = catalog.length
    ? Math.round((activeCount / catalog.length) * 100)
    : 0
  const mostPopular = [...catalog].sort(
    (a, b) => b.subscriptionsCount - a.subscriptionsCount,
  )[0]

  // Saves the edit drawer's values to the real plan; the feature lines the
  // app shows are rebuilt from the new numbers
  const handleSave = async (updated: EditPlanDrawerItem) => {
    const current = catalog.find((p) => p.id === updated.id)
    if (!current) return
    const featured = !!(updated.isPinnedAds || updated.isFeaturedResults)
    const numbers = {
      maxActiveAds: digits(updated.activeAdsCount) || current.maxActiveAds,
      durationDays: digits(updated.durationText) || current.durationDays,
      maxImagesPerAd: digits(updated.photosCountText) || current.maxImagesPerAd,
      featuredDays: featured
        ? current.featuredDays || digits(updated.durationText) || current.durationDays
        : 0,
      prioritySearch: !!updated.isPrioritySearch,
    }
    try {
      await updatePlan(current.id, {
        name: updated.name.replace(/^الباقة\s+/, '').trim() || current.name,
        price: /\d/.test(updated.price) ? digits(updated.price) : current.price,
        isActive: updated.isActive !== false,
        ...numbers,
        features: buildPlanFeatures(numbers),
      })
      await loadPlans()
    } catch {
      alert('تعذر حفظ التعديلات، يرجى المحاولة مرة أخرى.')
    }
  }

  const handleOpenDetail = (plan: PlanItem) => {
    setSelectedPlanDetail({
      ...plan,
      categoryName: selectedCategory,
    })
    setPlanDetailOpen(true)
  }

  const handleOpenEdit = (plan: PlanItem | EditPlanDrawerItem) => {
    setSelectedEditPlan({
      ...plan,
      categoryName: selectedCategory,
    })
    setEditPlanOpen(true)
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
              +{addedThisMonth} هذا الشهر
            </span>
          </div>
          <span className="text-[28px] font-bold text-[#111111]">{catalog.length}</span>
        </div>

        {/* Box 2: Active Plans */}
        <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-2xl p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#6B6A6A]">
              الباقات النشطة
            </span>
            <span className="bg-[#E6F4EA] text-[#137333] font-bold text-[11px] px-2.5 py-1 rounded-md">
              {activePercent}% من الإجمالي
            </span>
          </div>
          <span className="text-[28px] font-bold text-[#111111]">{activeCount}</span>
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
          <span className="text-[28px] font-bold text-[#111111]">{hiddenCount}</span>
        </div>

        {/* Box 4: Most Popular Plan */}
        <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-2xl p-5 flex flex-col justify-between gap-3">
          <div className="flex items-center justify-between">
            <span className="text-[13px] font-medium text-[#6B6A6A]">
              الباقة الأكثر اشتراكاً
            </span>
            <span className="bg-[#E6F4EA] text-[#137333] font-bold text-[11px] px-2.5 py-1 rounded-md">
              +{mostPopular?.subscriptionsThisMonth ?? 0} هذا الشهر
            </span>
          </div>
          <span className="text-[24px] font-bold text-[#111111]">{mostPopular?.name ?? '—'}</span>
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
          <span>الأفراد ({currentPlans.length})</span>
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
          <span>المكاتب العقارية ({currentPlans.length})</span>
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
          <span>الشركات ({currentPlans.length})</span>
          {selectedCategory === 'COMPANY' && (
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {loadError && (
        <p className="text-[14px] font-medium text-red-600">{loadError}</p>
      )}

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
                  {plan.isActive === false && (
                    <span className="ms-2 rounded-md bg-[#FFFBEB] px-2 py-0.5 text-[11px] text-[#B45309]">
                      مخفية
                    </span>
                  )}
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
                onClick={() => handleOpenEdit(plan)}
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
        onEdit={(plan) => handleOpenEdit(plan)}
      />

      {/* Edit Plan Drawer */}
      <EditPlanDrawer
        open={editPlanOpen}
        onClose={() => setEditPlanOpen(false)}
        plan={selectedEditPlan}
        onSave={(updated) => void handleSave(updated)}
      />
    </div>
  )
}
