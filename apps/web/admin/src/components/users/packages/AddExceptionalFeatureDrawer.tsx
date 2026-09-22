'use client'

import { useState, useEffect } from 'react'
import { X, Calendar, ChevronUp, ChevronDown } from 'lucide-react'
import { grantExceptionalFeature } from '@/lib/admin-plans'

export interface AddExceptionalFeatureDrawerProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  userId: string
}

export default function AddExceptionalFeatureDrawer({
  open,
  onClose,
  onSuccess,
  userId,
}: AddExceptionalFeatureDrawerProps) {
  const [adsCount, setAdsCount] = useState<string>('')
  const [photosCount, setPhotosCount] = useState<string>('')
  const [durationDays, setDurationDays] = useState<string>('')
  const [priorityVisibility, setPriorityVisibility] = useState<boolean>(true)
  const [featuredResultsVisibility, setFeaturedResultsVisibility] =
    useState<boolean>(true)
  const [expiryDate, setExpiryDate] = useState<string>('')
  const [notifyEmail, setNotifyEmail] = useState<boolean>(false)
  const [notifyApp, setNotifyApp] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState(false)

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

  const isFormValid =
    adsCount !== '' ||
    photosCount !== '' ||
    durationDays !== '' ||
    expiryDate !== ''

  const handleSubmit = async () => {
    if (!isFormValid || submitting) return
    setSubmitting(true)
    try {
      await grantExceptionalFeature(userId, {
        adsCount: adsCount !== '' ? Number(adsCount) : undefined,
        photosCount: photosCount !== '' ? Number(photosCount) : undefined,
        durationDays: durationDays !== '' ? Number(durationDays) : undefined,
        priorityVisibility,
        featuredResultsVisibility,
        expiryDate: expiryDate !== '' ? expiryDate : undefined,
        notifyEmail,
        notifyApp,
      })
      onSuccess()
      onClose()
    } catch (err) {
      console.error('Failed to grant exceptional feature:', err)
    } finally {
      setSubmitting(false)
    }
  }

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
        {/* Header */}
        <div className="p-6 border-b border-[#ECECEC] flex items-center justify-between shrink-0">
          <div className="flex flex-col gap-0.5">
            <h2 className="text-[18px] font-bold text-[#111111]">
              إضافة ميزة استثنائية
            </h2>
            <p className="text-[12px] font-medium text-[#6B6A6A]">
              اختر المميزات الاضافية التي ترغب في اعطائها لهذا الحساب.
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

        {/* Form Body */}
        <div className="p-6 flex flex-col gap-5 flex-1 text-right">
          {/* Field 1: Ads Count */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#111111]">
              الإعلانات
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                value={adsCount}
                onChange={(e) => setAdsCount(e.target.value)}
                placeholder="اكتب عدد الاعلانات"
                className="w-full h-11 border border-[#ECECEC] bg-white rounded-xl px-4 text-[13px] text-[#111111] placeholder:text-[#94A3B8] focus:outline-none focus:border-primary"
              />
              <div className="absolute left-3 flex flex-col text-[#6B6A6A]">
                <button
                  type="button"
                  onClick={() =>
                    setAdsCount((v) => String((Number(v) || 0) + 1))
                  }
                  className="hover:text-[#111111] p-0.5 cursor-pointer"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setAdsCount((v) =>
                      String(Math.max(0, (Number(v) || 0) - 1)),
                    )
                  }
                  className="hover:text-[#111111] p-0.5 cursor-pointer"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Field 2: Photos Count */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#111111]">
              عدد الصور
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                value={photosCount}
                onChange={(e) => setPhotosCount(e.target.value)}
                placeholder="اكتب عدد الصور"
                className="w-full h-11 border border-[#ECECEC] bg-white rounded-xl px-4 text-[13px] text-[#111111] placeholder:text-[#94A3B8] focus:outline-none focus:border-primary"
              />
              <div className="absolute left-3 flex flex-col text-[#6B6A6A]">
                <button
                  type="button"
                  onClick={() =>
                    setPhotosCount((v) => String((Number(v) || 0) + 1))
                  }
                  className="hover:text-[#111111] p-0.5 cursor-pointer"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setPhotosCount((v) =>
                      String(Math.max(0, (Number(v) || 0) - 1)),
                    )
                  }
                  className="hover:text-[#111111] p-0.5 cursor-pointer"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Field 3: Ad Publishing Duration (Days) */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#111111]">
              مدة نشر الإعلان
            </label>
            <div className="relative flex items-center">
              <input
                type="number"
                value={durationDays}
                onChange={(e) => setDurationDays(e.target.value)}
                placeholder="بالايام"
                className="w-full h-11 border border-[#ECECEC] bg-white rounded-xl px-4 text-[13px] text-[#111111] placeholder:text-[#94A3B8] focus:outline-none focus:border-primary"
              />
              <div className="absolute left-3 flex flex-col text-[#6B6A6A]">
                <button
                  type="button"
                  onClick={() =>
                    setDurationDays((v) => String((Number(v) || 0) + 1))
                  }
                  className="hover:text-[#111111] p-0.5 cursor-pointer"
                >
                  <ChevronUp className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setDurationDays((v) =>
                      String(Math.max(0, (Number(v) || 0) - 1)),
                    )
                  }
                  className="hover:text-[#111111] p-0.5 cursor-pointer"
                >
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>

          {/* Toggle Switches */}
          <div className="flex flex-col gap-4 border-t border-[#ECECEC] pt-4">
            {/* Toggle 1: Priority Visibility */}
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#111111]">
                أولوية الظهور
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={priorityVisibility}
                onClick={() => setPriorityVisibility((prev) => !prev)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  priorityVisibility ? 'bg-primary' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    priorityVisibility ? '-translate-x-5' : 'translate-x-0'
                  }`}
                />
              </button>
            </div>

            {/* Toggle 2: Featured Results Visibility */}
            <div className="flex items-center justify-between">
              <span className="text-[13px] font-bold text-[#111111]">
                الظهور في النتائج المميزة
              </span>
              <button
                type="button"
                role="switch"
                aria-checked={featuredResultsVisibility}
                onClick={() => setFeaturedResultsVisibility((prev) => !prev)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  featuredResultsVisibility ? 'bg-primary' : 'bg-slate-200'
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                    featuredResultsVisibility
                      ? '-translate-x-5'
                      : 'translate-x-0'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Field 4: Expiration Date */}
          <div className="flex flex-col gap-1.5 border-t border-[#ECECEC] pt-4">
            <label className="text-[13px] font-bold text-[#111111]">
              مدة الامتياز
            </label>
            <div className="relative flex items-center">
              <input
                type="date"
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
                placeholder="اختر تاريخ انتهاء المميزات"
                className="w-full h-11 border border-[#ECECEC] bg-white rounded-xl px-4 text-[13px] text-[#111111] placeholder:text-[#94A3B8] focus:outline-none focus:border-primary"
              />
              <Calendar className="absolute left-3 w-4 h-4 text-[#6B6A6A] pointer-events-none" />
            </div>
          </div>

          {/* Field 5: Send Notification Channels */}
          <div className="flex flex-col gap-2.5 border-t border-[#ECECEC] pt-4">
            <span className="text-[13px] font-bold text-[#111111]">
              ارسال اشعار للمستخدم عبر :
            </span>
            <label className="flex items-center gap-2.5 text-[13px] text-[#111111] font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
                className="size-4 rounded border-[#CBD5E1] text-primary focus:ring-primary"
              />
              <span>البريد الالكتروني.</span>
            </label>
            <label className="flex items-center gap-2.5 text-[13px] text-[#111111] font-medium cursor-pointer">
              <input
                type="checkbox"
                checked={notifyApp}
                onChange={(e) => setNotifyApp(e.target.checked)}
                className="size-4 rounded border-[#CBD5E1] text-primary focus:ring-primary"
              />
              <span>داخل التطبيق.</span>
            </label>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-6 border-t border-[#ECECEC] flex items-center gap-3 bg-white shrink-0">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!isFormValid || submitting}
            className={`h-11 w-full font-bold text-[14px] rounded-full transition-colors cursor-pointer ${
              isFormValid && !submitting
                ? 'bg-primary text-white hover:bg-[#0f2338]'
                : 'bg-[#94A3B8] text-white cursor-not-allowed'
            }`}
          >
            {submitting ? 'جاري الإضافة...' : 'إضافة المزايا'}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="h-11 w-full bg-white border border-[#ECECEC] hover:bg-[#F8FAFC] text-[#111111] font-bold text-[14px] rounded-full transition-colors cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}
