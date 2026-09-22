'use client'

import { useCallback, useEffect, useState } from 'react'
import { CheckCircle2, X } from 'lucide-react'
import { AdminPlan, changeUserPlan, fetchPlans } from '@/lib/admin-plans'

export interface UpgradePackageDialogProps {
  open: boolean
  onClose: () => void
  userId: string
  onSuccess?: () => void
}

export default function UpgradePackageDialog({
  open,
  onClose,
  userId,
  onSuccess,
}: UpgradePackageDialogProps) {
  const [plans, setPlans] = useState<AdminPlan[]>([])
  const [loading, setLoading] = useState(false)
  const [purchasingId, setPurchasingId] = useState<string | null>(null)

  const loadPlans = useCallback(async () => {
    try {
      setLoading(true)
      const rows = await fetchPlans()
      setPlans(rows)
    } catch (err) {
      console.error('Failed to load plans:', err)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (open) loadPlans()
  }, [open, loadPlans])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', onKeyDown)
    }
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  async function handlePurchase(plan: AdminPlan) {
    try {
      setPurchasingId(plan.id)
      await changeUserPlan(userId, { planId: plan.id })
      onSuccess?.()
      onClose()
    } catch (err) {
      console.error('Failed to change plan:', err)
    } finally {
      setPurchasingId(null)
    }
  }

  return (
    <div className="fixed inset-0 z-50 font-['Cairo'] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal Dialog */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8 flex flex-col gap-6 text-right z-10"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between w-full border-b border-[#ECECEC] pb-4">
          <h2 className="text-[20px] font-bold text-[#111111] w-full text-center">
            باقات الإعلانات المتاحة
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute left-6 top-6 size-8 flex items-center justify-center rounded-full text-[#6B6A6A] hover:bg-[#F1F5F9] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {loading ? (
          <p className="text-center text-[14px] text-[#6B6A6A] py-8">
            جاري تحميل الباقات...
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className="bg-white border border-[#ECECEC] rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm"
              >
                <div>
                  <div className="bg-[#F8FAFC] p-6 text-right flex flex-col gap-1 border-b border-[#ECECEC]">
                    <span className="text-[28px] font-bold text-[#111111] leading-tight">
                      {plan.price} د.ك
                    </span>
                    <span className="text-[14px] font-medium text-[#6B6A6A]">
                      {plan.name}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col gap-4 text-right">
                    <h3 className="text-[16px] font-bold text-[#111111]">
                      باقة {plan.name}
                    </h3>
                    <ul className="flex flex-col gap-2.5 text-[13px] font-medium text-[#111111]">
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#018B1B] shrink-0" />
                        <span>{plan.maxActiveAds} اعلان نشط.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#018B1B] shrink-0" />
                        <span>مدة النشر {plan.durationDays} يوم.</span>
                      </li>
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-[#018B1B] shrink-0" />
                        <span>حتى {plan.maxImagesPerAd} صورة للعقار.</span>
                      </li>
                      {plan.featuredDays > 0 && (
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#018B1B] shrink-0" />
                          <span>تثبيت {plan.featuredDays} ايام في نتائج البحث.</span>
                        </li>
                      )}
                      {plan.prioritySearch && (
                        <li className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#018B1B] shrink-0" />
                          <span>اولوية الظهور في نتائج البحث.</span>
                        </li>
                      )}
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-[#018B1B] shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    type="button"
                    onClick={() => handlePurchase(plan)}
                    disabled={purchasingId === plan.id}
                    className="w-full h-11 bg-primary hover:bg-[#0F2238] disabled:opacity-60 text-white font-bold text-[14px] rounded-xl transition-colors cursor-pointer"
                  >
                    {purchasingId === plan.id ? 'جاري الشراء...' : 'شراء الباقة'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
