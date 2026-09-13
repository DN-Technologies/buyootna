'use client'

import React, { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import { ChangePlanDrawerProps, PlanTiming } from './change-plan/types'
import { PLAN_DEFINITIONS } from './change-plan/constants'
import UserInfoCard from './change-plan/UserInfoCard'
import PlanSelectionSection from './change-plan/PlanSelectionSection'
import TimingOptionsSection from './change-plan/TimingOptionsSection'
import NotificationChannelsSection from './change-plan/NotificationChannelsSection'
import DrawerFooter from './change-plan/DrawerFooter'

export type { ChangePlanDrawerProps }

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
  const [timing, setTiming] = useState<PlanTiming>('immediate')
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
          <UserInfoCard
            name={resolvedName}
            email={resolvedEmail}
            accountType={resolvedAccountType}
            currentPlan={resolvedCurrentPlan}
            hasCurrentPlan={hasCurrentPlan}
          />

          <PlanSelectionSection
            selectedPlanId={selectedPlanId}
            selectedSubTierId={selectedSubTierId}
            onPlanToggle={handlePlanToggle}
            onSubTierSelect={handleSubTierSelect}
          />

          <TimingOptionsSection
            timing={timing}
            onTimingChange={setTiming}
          />

          <NotificationChannelsSection
            notifyEmail={notifyEmail}
            notifyApp={notifyApp}
            onToggleEmail={() => setNotifyEmail((prev) => !prev)}
            onToggleApp={() => setNotifyApp((prev) => !prev)}
          />
        </div>

        {/* Footer Actions */}
        <DrawerFooter
          onClose={onClose}
          onSubmit={handleSubmit}
          isFormValid={isFormValid}
          loading={loading}
        />
      </div>
    </div>
  )
}
