'use client'

import React, { useState, useEffect } from 'react'
import { X, Loader2 } from 'lucide-react'
import { UserRow } from './UserTable'

export interface ChangePlanDrawerProps {
  open: boolean
  onClose: () => void
  onSuccess?: (userId: string, planName: string) => void
  user?: UserRow | null
  userName?: string
  userEmail?: string
  accountType?: string
  currentPlanLabel?: string
}

interface SubTier {
  id: string
  name: string
  price: string
}

interface PlanDefinition {
  id: 'basic' | 'gold'
  name: string
  subTiers: SubTier[]
}

const PLAN_DEFINITIONS: PlanDefinition[] = [
  {
    id: 'basic',
    name: 'الباقة الاساسية',
    subTiers: [
      { id: 'basic_2', name: 'باقة 2 اعلان', price: '10 د.ك' },
      { id: 'basic_5', name: 'باقة 5 اعلانات', price: '22.5 د.ك' },
    ],
  },
  {
    id: 'gold',
    name: 'الباقة الذهبية',
    subTiers: [
      { id: 'gold_1', name: 'باقة 1 اعلان', price: '12 د.ك' },
      { id: 'gold_5', name: 'باقة 5 اعلانات', price: '50 د.ك' },
    ],
  },
]

export default function ChangePlanDrawer({
  open,
  onClose,
  onSuccess,
  user,
  userName = 'محمد الجارح',
  userEmail = 'mohamedelgareh@gmail.com',
  accountType = 'فرد',
  currentPlanLabel,
}: ChangePlanDrawerProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<'basic' | 'gold' | null>(
    null,
  )
  const [selectedSubTierId, setSelectedSubTierId] = useState<string | null>(
    null,
  )
  const [timing, setTiming] = useState<'immediate' | 'after_expiry'>(
    'immediate',
  )
  const [notifyEmail, setNotifyEmail] = useState(false)
  const [notifyApp, setNotifyApp] = useState(false)
  const [loading, setLoading] = useState(false)

  // Reset form when drawer opens or user changes
  useEffect(() => {
    if (open) {
      setSelectedPlanId(null)
      setSelectedSubTierId(null)
      setTiming('immediate')
      setNotifyEmail(false)
      setNotifyApp(false)
      setLoading(false)
    }
  }, [open, user])

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }
    if (open) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [open, onClose])

  if (!open) return null

  // Dynamic user data resolution
  const resolvedName = user?.name || userName
  const resolvedEmail = user?.email || userEmail
  const resolvedAccountType = user?.accountType || accountType
  const resolvedCurrentPlan =
    user?.subscriptionPlan &&
    user.subscriptionPlan !== '—' &&
    user.subscriptionPlan !== 'ـــــــ'
      ? user.subscriptionPlan
      : currentPlanLabel

  const hasCurrentPlan =
    !!resolvedCurrentPlan &&
    resolvedCurrentPlan !== '—' &&
    resolvedCurrentPlan !== 'ـــــــ'

  const isFormValid = !!selectedPlanId && !!selectedSubTierId

  const handlePlanToggle = (planId: 'basic' | 'gold') => {
    if (selectedPlanId === planId) {
      setSelectedPlanId(null)
      setSelectedSubTierId(null)
    } else {
      setSelectedPlanId(planId)
      // Pick first sub tier by default or reset
      setSelectedSubTierId(null)
    }
  }

  const handleSubTierSelect = (subTierId: string) => {
    setSelectedSubTierId((prev) => (prev === subTierId ? null : subTierId))
  }

  const handleSubmit = async () => {
    if (!isFormValid || loading) return
    setLoading(true)

    const chosenPlan = PLAN_DEFINITIONS.find((p) => p.id === selectedPlanId)
    const chosenSubTier = chosenPlan?.subTiers.find(
      (s) => s.id === selectedSubTierId,
    )
    const planSummary = chosenPlan
      ? `${chosenPlan.name} (${chosenSubTier?.name || ''})`
      : 'الباقة الجديدة'

    try {
      // Small simulated delay for feedback
      await new Promise((resolve) => setTimeout(resolve, 400))
      onSuccess?.(user?.id || '', planSummary)
      onClose()
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end font-['Cairo']"
      dir="rtl"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container (500px wide, matching Figma nodes 5634:71036, 5634:70967, 5634:70898) */}
      <div className="relative w-full max-w-125 h-full bg-white shadow-2xl z-10 flex flex-col justify-between overflow-hidden animate-in slide-in-from-right duration-300">
        {/* Drawer Header (Figma 2413:70227) */}
        <div className="bg-white border-b border-[#ECECEC] flex items-center justify-between p-5 shrink-0">
          <div className="flex flex-col gap-1 text-right">
            <h2 className="font-['Cairo'] font-bold text-[16px] leading-[normal] text-[#111111]">
              تغيير الباقة
            </h2>
            <p className="font-['Cairo'] font-normal text-[14px] leading-normal text-[#6B6A6A] tracking-[-0.408px]">
              اختر الباقة الجديدة لهذا الحساب، سيتم تطبيق التغييرات فور حفظ
              العملية
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-lg text-[#6B6A6A] hover:bg-slate-100 hover:text-[#111111] transition-colors cursor-pointer shrink-0"
            aria-label="إغلاق"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Drawer Scrollable Body */}
        <div className="flex-1 overflow-y-auto px-5 py-6 flex flex-col gap-6">
          {/* User Info Card (Figma 5634:70903) */}
          <div className="bg-[#F9FAFE] rounded-lg px-5 py-4 flex flex-col gap-2.5 w-full shrink-0">
            {/* User Name, Email, Account Type */}
            <div className="flex items-start justify-between w-full">
              <div className="flex flex-col gap-1 text-right">
                <span className="font-['Cairo'] font-medium text-[16px] leading-[1.3] text-[#111111]">
                  {resolvedName}
                </span>
                <span className="font-['Cairo'] font-normal text-[14px] leading-[16.5px] text-[#6B6A6A] tracking-[0.44px]">
                  {resolvedEmail}
                </span>
              </div>
              <div className="bg-white border border-[#E2E8F0] px-2 py-1 rounded-full flex items-center justify-center shrink-0">
                <span className="font-['Cairo'] font-semibold text-[14px] leading-[1.2] text-[#111111]">
                  {resolvedAccountType}
                </span>
              </div>
            </div>

            {/* Current Plan Row */}
            <div className="flex items-center justify-between w-full pt-1 border-t border-slate-100/70">
              <span className="font-['Cairo'] font-medium text-[13px] leading-[16.5px] text-[#6B6A6A] tracking-[0.44px]">
                الباقة الحالية :
              </span>
              <div className="px-2">
                {hasCurrentPlan ? (
                  <span className="bg-[#ECECEC] text-[#111111] font-['Cairo'] font-medium text-[12px] px-2 py-0.5 rounded">
                    {resolvedCurrentPlan}
                  </span>
                ) : (
                  <span className="font-['Cairo'] font-normal text-[12px] leading-[19.5px] text-[#6B6A6A]">
                    ـــــــ
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Section 1: New Plan Options (Figma 5771:123913) */}
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
                      onClick={() => handlePlanToggle(plan.id)}
                    >
                      <span className="font-['Cairo'] font-bold text-[14px] leading-normal text-[#111111] tracking-[-0.408px]">
                        {plan.name}
                      </span>

                      {/* Custom Checkbox (Figma 5771:123922 / 5771:123939) */}
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation()
                          handlePlanToggle(plan.id)
                        }}
                        className="size-4 shrink-0 flex items-center justify-center cursor-pointer"
                        aria-label={`اختيار ${plan.name}`}
                      >
                        {isSelected ? (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect
                              width="16"
                              height="16"
                              rx="4"
                              fill="#15304D"
                            />
                            <path
                              d="M4.5 8L7 10.5L11.5 5.5"
                              stroke="white"
                              strokeWidth="1.8"
                              strokeLinecap="round"
                              strokeLinejoin="round"
                            />
                          </svg>
                        ) : (
                          <svg
                            width="16"
                            height="16"
                            viewBox="0 0 16 16"
                            fill="none"
                            xmlns="http://www.w3.org/2000/svg"
                          >
                            <rect
                              x="0.5"
                              y="0.5"
                              width="15"
                              height="15"
                              rx="3.5"
                              stroke="#D7D7D7"
                              fill="white"
                            />
                          </svg>
                        )}
                      </button>
                    </div>

                    {/* Sub-tier items when expanded (Figma 5771:123940) */}
                    {isSelected && (
                      <div className="flex gap-4 items-center justify-end px-3 pt-1 border-t border-slate-200/60">
                        {plan.subTiers.map((sub) => {
                          const isSubSelected = selectedSubTierId === sub.id

                          return (
                            <div
                              key={sub.id}
                              onClick={() => handleSubTierSelect(sub.id)}
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
                                  handleSubTierSelect(sub.id)
                                }}
                                className="size-4 shrink-0 mt-0.5 flex items-center justify-center cursor-pointer"
                                aria-label={`اختيار ${sub.name}`}
                              >
                                {isSubSelected ? (
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <rect
                                      width="16"
                                      height="16"
                                      rx="4"
                                      fill="#15304D"
                                    />
                                    <path
                                      d="M4.5 8L7 10.5L11.5 5.5"
                                      stroke="white"
                                      strokeWidth="1.8"
                                      strokeLinecap="round"
                                      strokeLinejoin="round"
                                    />
                                  </svg>
                                ) : (
                                  <svg
                                    width="16"
                                    height="16"
                                    viewBox="0 0 16 16"
                                    fill="none"
                                    xmlns="http://www.w3.org/2000/svg"
                                  >
                                    <rect
                                      x="0.5"
                                      y="0.5"
                                      width="15"
                                      height="15"
                                      rx="3.5"
                                      stroke="#D7D7D7"
                                      fill="white"
                                    />
                                  </svg>
                                )}
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

          {/* Section 2: Timing Options (Figma 5634:70936) */}
          <div className="flex flex-col gap-3 w-full">
            <h3 className="font-['Cairo'] font-medium text-[14px] leading-normal text-[#111111] tracking-[-0.408px] text-right">
              متى يبدأ تطبيق الباقة الجديدة؟
            </h3>

            <div className="flex flex-col gap-2.5 w-full">
              {/* Option: فورا */}
              <div
                onClick={() => setTiming('immediate')}
                className={`rounded-lg px-3 py-3.25 flex items-start justify-between gap-2 cursor-pointer border transition-all ${
                  timing === 'immediate'
                    ? 'border-primary bg-white'
                    : 'border-[#ECECEC] bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col gap-2 text-right flex-1">
                  <span className="font-['Cairo'] font-semibold text-[14px] leading-normal text-[#111111] tracking-[0.28px]">
                    فورا
                  </span>
                  <p className="font-['Cairo'] font-normal text-[14px] leading-normal text-[#6B6A6A] tracking-[-0.408px]">
                    يتم تفعيل الباقة الجديدة مباشر، بالاضافة الى الباقة الحالية
                  </p>
                </div>

                {/* Radio Button */}
                <div className="size-4 shrink-0 mt-1 flex items-center justify-center">
                  {timing === 'immediate' ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="8"
                        cy="8"
                        r="7.25"
                        stroke="#15304D"
                        strokeWidth="1.5"
                      />
                      <circle cx="8" cy="8" r="4" fill="#15304D" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="8" cy="8" r="7.5" stroke="#D7D7D7" />
                    </svg>
                  )}
                </div>
              </div>

              {/* Option: بعد الانتهاء من الباقة الحالية */}
              <div
                onClick={() => setTiming('after_expiry')}
                className={`rounded-lg px-3 py-3.25 flex items-start justify-between gap-2 cursor-pointer border transition-all ${
                  timing === 'after_expiry'
                    ? 'border-primary bg-white'
                    : 'border-[#ECECEC] bg-white hover:border-slate-300'
                }`}
              >
                <div className="flex flex-col gap-2 text-right flex-1">
                  <span className="font-['Cairo'] font-semibold text-[14px] leading-normal text-[#111111] tracking-[0.28px]">
                    بعد الانتهاء من الباقة الحالية
                  </span>
                  <p className="font-['Cairo'] font-normal text-[14px] leading-normal text-[#6B6A6A] tracking-[-0.408px]">
                    سيتم تفعيل الباقة الجديدة تلقائيًا بعد انتهاء الباقة
                    الحالية.
                  </p>
                </div>

                {/* Radio Button */}
                <div className="size-4 shrink-0 mt-1 flex items-center justify-center">
                  {timing === 'after_expiry' ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle
                        cx="8"
                        cy="8"
                        r="7.25"
                        stroke="#15304D"
                        strokeWidth="1.5"
                      />
                      <circle cx="8" cy="8" r="4" fill="#15304D" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="8" cy="8" r="7.5" stroke="#D7D7D7" />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Notification Channels (Figma 5634:70955) */}
          <div className="flex flex-col gap-3 w-full">
            <span className="font-['Cairo'] font-medium text-[14px] leading-normal text-[#1C1D1F] tracking-[-0.408px] text-right">
              ارسال اشعار للمستخدم عبر :
            </span>

            <div className="flex flex-col gap-2 w-full">
              {/* Checkbox 1: البريد الالكتروني */}
              <div
                onClick={() => setNotifyEmail(!notifyEmail)}
                className="flex items-center justify-between cursor-pointer py-1 select-none"
              >
                <span className="font-['Cairo'] font-medium text-[14px] leading-normal text-[#6B6A6A] tracking-[-0.408px]">
                  البريد الالكتروني.
                </span>
                <div className="size-4 shrink-0 flex items-center justify-center">
                  {notifyEmail ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="16" height="16" rx="4" fill="#15304D" />
                      <path
                        d="M4.5 8L7 10.5L11.5 5.5"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="0.5"
                        y="0.5"
                        width="15"
                        height="15"
                        rx="3.5"
                        stroke="#D7D7D7"
                        fill="white"
                      />
                    </svg>
                  )}
                </div>
              </div>

              {/* Checkbox 2: داخل التطبيق */}
              <div
                onClick={() => setNotifyApp(!notifyApp)}
                className="flex items-center justify-between cursor-pointer py-1 select-none"
              >
                <span className="font-['Cairo'] font-medium text-[14px] leading-normal text-[#6B6A6A] tracking-[-0.408px]">
                  داخل التطبيق.
                </span>
                <div className="size-4 shrink-0 flex items-center justify-center">
                  {notifyApp ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect width="16" height="16" rx="4" fill="#15304D" />
                      <path
                        d="M4.5 8L7 10.5L11.5 5.5"
                        stroke="white"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <rect
                        x="0.5"
                        y="0.5"
                        width="15"
                        height="15"
                        rx="3.5"
                        stroke="#D7D7D7"
                        fill="white"
                      />
                    </svg>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions (Figma 5634:70964) */}
        <div className="border-t border-[#ECECEC] p-[16px_20px] flex gap-3 items-center shrink-0 bg-white">
          {/* Cancel Button */}
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-12 rounded-3xl border border-[#E2E8F0] bg-white text-[#111111] font-['Cairo'] font-semibold text-[14px] tracking-[0.28px] hover:bg-slate-50 transition-colors flex items-center justify-center cursor-pointer disabled:opacity-60"
          >
            إلغاء
          </button>

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid || loading}
            className={`flex-1 h-12 rounded-3xl font-['Cairo'] font-semibold text-[14px] tracking-[0.28px] flex items-center justify-center gap-2 transition-all ${
              isFormValid && !loading
                ? 'bg-primary border border-primary text-white hover:bg-[#0f2338] cursor-pointer'
                : 'bg-[#A6A6A6] border border-[#A6A6A6] text-white cursor-not-allowed opacity-90'
            }`}
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            <span>اضافة الباقة</span>
          </button>
        </div>
      </div>
    </div>
  )
}
