'use client'

import { useState, useEffect } from 'react'
import { X } from 'lucide-react'
import {
  EditPlanDrawerProps,
  EditPlanDrawerItem,
  EditPlanFormState,
} from './edit-drawer/edit-plan.types'
import EditPlanStepper from './edit-drawer/EditPlanStepper'
import Step1GeneralInfo from './edit-drawer/Step1GeneralInfo'
import Step2Features from './edit-drawer/Step2Features'
import Step3Review from './edit-drawer/Step3Review'
import DiscardEditsModal from './edit-drawer/DiscardEditsModal'

export type { EditPlanDrawerItem, EditPlanDrawerProps }

export default function EditPlanDrawer({
  open,
  onClose,
  plan,
  onSave,
}: EditPlanDrawerProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [showDiscardModal, setShowDiscardModal] = useState(false)
  const [isDirty, setIsDirty] = useState(false)

  const [formState, setFormState] = useState<EditPlanFormState>({
    status: 'active',
    planName: '',
    planPrice: '',
    validityDuration: '10 ايام',
    adsCount: '1',
    photosCount: '5',
    durationDays: '10',
    searchVisibility: true,
    featuredResults: false,
    pinnedAds: false,
    prioritySearch: false,
    directContact: true,
  })

  useEffect(() => {
    if (plan) {
      setStep(1)
      setIsDirty(false)
      setShowDiscardModal(false)
      setFormState({
        status: plan.isActive === false ? 'hidden' : 'active',
        planName: plan.name || '',
        planPrice: plan.price || '',
        validityDuration: plan.durationText || '10 ايام',
        adsCount: plan.activeAdsCount || (plan.isGold ? '4' : '1'),
        photosCount:
          plan.photosCountText?.replace(/\D/g, '') ||
          (plan.isGold ? '15' : '5'),
        durationDays:
          plan.durationText?.replace(/\D/g, '') || (plan.isGold ? '60' : '10'),
        searchVisibility: true,
        featuredResults: !!plan.isGold || !!plan.isFeaturedResults,
        pinnedAds: !!plan.isGold || !!plan.isPinnedAds,
        prioritySearch: !!plan.isGold || !!plan.isPrioritySearch,
        directContact: true,
      })
    }
  }, [plan])

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleAttemptClose()
    }
    if (open) {
      document.addEventListener('keydown', onKeyDown)
    }
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, isDirty])

  if (!open || !plan) return null

  const updateForm = (updates: Partial<EditPlanFormState>) => {
    setFormState((prev) => ({ ...prev, ...updates }))
    if (!isDirty) setIsDirty(true)
  }

  const handleAttemptClose = () => {
    if (isDirty) {
      setShowDiscardModal(true)
    } else {
      onClose()
    }
  }

  const handleConfirmDiscard = () => {
    setShowDiscardModal(false)
    setIsDirty(false)
    onClose()
  }

  const handleSave = () => {
    const updated: EditPlanDrawerItem = {
      ...plan,
      isActive: formState.status === 'active',
      name: formState.planName,
      price: formState.planPrice,
      activeAdsCount: formState.adsCount,
      durationText: `${formState.durationDays} يوم`,
      photosCountText: `${formState.photosCount} صور`,
      isFeaturedResults: formState.featuredResults,
      isPinnedAds: formState.pinnedAds,
      isPrioritySearch: formState.prioritySearch,
      pinnedAdsText: formState.pinnedAds
        ? `${formState.durationDays} ايام`
        : 'غير متاح',
      featuredResultsText: formState.featuredResults ? 'مفعل' : 'غير متاح',
      prioritySearchText: formState.prioritySearch ? 'مفعل' : 'غير متاح',
    }
    onSave?.(updated)
    setIsDirty(false)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 font-['Cairo'] flex">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 transition-opacity"
        onClick={handleAttemptClose}
      />

      {/* Main Drawer Panel */}
      <div
        className="relative bg-white w-full max-w-lg h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto text-right"
        dir="rtl"
      >
        {/* Drawer Header */}
        <div className="p-6 border-b border-[#ECECEC] flex items-center justify-between shrink-0">
          <h2 className="text-[18px] font-bold text-[#111111]">
            تعديل {plan.name}
          </h2>
          <button
            type="button"
            onClick={handleAttemptClose}
            className="size-8 flex items-center justify-center rounded-full text-[#6B6A6A] hover:bg-[#F1F5F9] transition-colors cursor-pointer shrink-0"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Wizard Stepper Indicator */}
        <EditPlanStepper step={step} />

        {/* Drawer Step Content */}
        <div className="p-6 flex flex-col gap-5 flex-1 text-right">
          {step === 1 ? (
            <Step1GeneralInfo formState={formState} onChange={updateForm} />
          ) : step === 2 ? (
            <Step2Features formState={formState} onChange={updateForm} />
          ) : (
            <Step3Review formState={formState} plan={plan} />
          )}
        </div>

        {/* Footer Navigation Buttons */}
        <div className="p-6 border-t border-[#ECECEC] flex items-center gap-3 bg-white shrink-0">
          {step === 1 ? (
            <>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="h-11 w-full bg-primary hover:bg-[#0f2338] text-white font-bold text-[14px] rounded-full transition-colors cursor-pointer"
              >
                التالي
              </button>
              <button
                type="button"
                onClick={handleAttemptClose}
                className="h-11 w-full bg-white border border-[#ECECEC] hover:bg-[#F8FAFC] text-[#111111] font-bold text-[14px] rounded-full transition-colors cursor-pointer"
              >
                اغلاق
              </button>
            </>
          ) : step === 2 ? (
            <>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="h-11 w-full bg-primary hover:bg-[#0f2338] text-white font-bold text-[14px] rounded-full transition-colors cursor-pointer"
              >
                التالي
              </button>
              <button
                type="button"
                onClick={() => setStep(1)}
                className="h-11 w-full bg-white border border-[#ECECEC] hover:bg-[#F8FAFC] text-[#111111] font-bold text-[14px] rounded-full transition-colors cursor-pointer"
              >
                السابق
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={handleSave}
                className="h-11 w-full bg-primary hover:bg-[#0f2338] text-white font-bold text-[14px] rounded-full transition-colors cursor-pointer"
              >
                حفظ التعديلات
              </button>
              <button
                type="button"
                onClick={() => setStep(2)}
                className="h-11 w-full bg-white border border-[#ECECEC] hover:bg-[#F8FAFC] text-[#111111] font-bold text-[14px] rounded-full transition-colors cursor-pointer"
              >
                السابق
              </button>
            </>
          )}
        </div>
      </div>

      {/* Discard Confirmation Modal */}
      <DiscardEditsModal
        open={showDiscardModal}
        onClose={() => setShowDiscardModal(false)}
        onConfirm={handleConfirmDiscard}
      />
    </div>
  )
}
