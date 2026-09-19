'use client'

import React, { useState } from 'react'
import { X, Check, ShieldCheck } from 'lucide-react'
import { UserRow } from './UserTable'

interface ChangePlanModalProps {
  user: UserRow | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (userId: string, planName: string) => void
}

const AVAILABLE_PLANS = [
  {
    id: 'الفضية',
    name: 'الباقة الفضية',
    badge: 'الفضية',
    badgeClass: 'bg-[#F2F4F7] text-[#344054]',
    description: 'تشمل نشر حتى 5 إعلانات مميزة شهرياً',
  },
  {
    id: 'الذهبية',
    name: 'الباقة الذهبية',
    badge: 'الذهبية',
    badgeClass: 'bg-[rgba(255,228,21,0.1)] text-[#C27912]',
    description: 'تشمل نشر حتى 15 إعلان مميز مع أولوية الظهور',
  },
  {
    id: 'السنوية',
    name: 'الباقة السنوية',
    badge: 'السنوية',
    badgeClass: 'bg-[rgba(255,228,21,0.1)] text-[#C27912]',
    description: 'اشتراك سنوي متكامل للشركات والمكاتب العقارية',
  },
  {
    id: 'العادية',
    name: 'الباقة العادية',
    badge: 'العادية',
    badgeClass: 'bg-[#F8FAFC] text-[#64748B]',
    description: 'باقة مجانية أساسية لنشر الإعلانات الفردية',
  },
]

export default function ChangePlanModal({
  user,
  isOpen,
  onClose,
  onSuccess,
}: ChangePlanModalProps) {
  const [selectedPlan, setSelectedPlan] = useState<string>(
    user?.subscriptionPlan &&
      user.subscriptionPlan !== '—' &&
      user.subscriptionPlan !== 'ـــــــ'
      ? user.subscriptionPlan
      : 'العادية',
  )
  const [loading, setLoading] = useState(false)

  if (!isOpen || !user) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      onSuccess(user.id, selectedPlan)
      setLoading(false)
      onClose()
    }, 400)
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
      dir="rtl"
    >
      <div className="bg-white rounded-2xl w-full max-w-md shadow-2xl border border-[#ECECEC] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ECECEC]">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" />
            <h3 className="font-['Cairo'] font-bold text-[18px] text-[#111111]">
              تغيير باقة الاشتراك
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-[#6B6A6A] hover:bg-[#F8FAFC] hover:text-[#111111] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 font-['Cairo']">
          {/* User Info Card */}
          <div className="bg-[#F8FAFC] rounded-xl p-3.5 border border-[#ECECEC] text-right">
            <p className="font-semibold text-[14px] text-[#111111]">
              {user.name}
            </p>
            <p className="text-[12px] text-[#6B6A6A] mt-0.5">{user.email}</p>
            <div className="flex items-center gap-2 mt-2 pt-2 border-t border-[#ECECEC] text-xs">
              <span className="text-[#6B6A6A]">الباقة الحالية:</span>
              <span className="font-bold text-[#111111]">
                {user.subscriptionPlan || 'بدون باقة'}
              </span>
            </div>
          </div>

          {/* Plan Options */}
          <div className="space-y-2">
            <label className="block text-[13px] font-semibold text-[#111111]">
              اختر الباقة الجديدة:
            </label>
            <div className="space-y-2">
              {AVAILABLE_PLANS.map((plan) => {
                const isSelected = selectedPlan === plan.id
                return (
                  <div
                    key={plan.id}
                    onClick={() => setSelectedPlan(plan.id)}
                    className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-colors ${
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-[#E2E8F0] hover:bg-[#F8FAFC]'
                    }`}
                  >
                    <div className="space-y-0.5 text-right">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-[14px] text-[#111111]">
                          {plan.name}
                        </span>
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${plan.badgeClass}`}
                        >
                          {plan.badge}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#6B6A6A]">
                        {plan.description}
                      </p>
                    </div>

                    <div
                      className={`w-5 h-5 rounded-full border flex items-center justify-center mt-0.5 ${
                        isSelected
                          ? 'border-primary bg-primary text-white'
                          : 'border-[#CBD5E1] bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3 h-3 stroke-3" />}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-[#ECECEC]">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary hover:bg-[#10243B] text-white py-2.5 rounded-xl font-bold text-[14px] cursor-pointer transition-colors"
            >
              {loading ? 'جاري الحفظ...' : 'تأكيد التغيير'}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl border border-[#E2E8F0] text-[#111111] font-medium text-[14px] hover:bg-[#F8FAFC] cursor-pointer transition-colors"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
