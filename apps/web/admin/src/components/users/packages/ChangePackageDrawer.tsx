'use client'

import { useState, useEffect } from 'react'
import { X, Check } from 'lucide-react'

export interface ChangePackageDrawerProps {
  open: boolean
  onClose: () => void
  onSuccess: () => void
  userName?: string
  userEmail?: string
  accountType?: string
  currentPlanLabel?: string
}

interface PackageOption {
  id: string
  name: string
  price: string
}

const PACKAGE_OPTIONS: PackageOption[] = [
  { id: 'normal', name: 'الباقة العادية', price: '25 د.ك' },
  { id: 'silver', name: 'الباقة الفضية', price: '25 د.ك' },
  { id: 'gold', name: 'الباقة الذهبية', price: '25 د.ك' },
]

export default function ChangePackageDrawer({
  open,
  onClose,
  onSuccess,
  userName = 'محمد الجارح',
  userEmail = 'mohamedelgareh@gmail.com',
  accountType = 'فرد',
  currentPlanLabel,
}: ChangePackageDrawerProps) {
  const [selectedPlanId, setSelectedPlanId] = useState<string | null>(null)
  const [applicationMode, setApplicationMode] = useState<
    'type_only' | 'with_credit'
  >('type_only')
  const [timing, setTiming] = useState<'immediate' | 'after_expiry'>(
    'immediate',
  )
  const [notifyEmail, setNotifyEmail] = useState(false)
  const [notifyApp, setNotifyApp] = useState(false)

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

  const hasCurrentPlan = !!currentPlanLabel && currentPlanLabel !== '—'

  const handleSubmit = () => {
    if (!selectedPlanId) return
    onSuccess()
    onClose()
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
              تغيير الباقة
            </h2>
            <p className="text-[12px] font-medium text-[#6B6A6A]">
              اختر الباقة الجديدة لهذا الحساب، سيتم تطبيق التغييرات فور حفظ
              العملية
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

        {/* Content Body */}
        <div className="p-6 flex flex-col gap-6 flex-1 text-right">
          {/* User Info Card (Figma Nodes 4043:137358 & 4043:137284) */}
          <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-xl p-4 flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <span className="text-[15px] font-bold text-[#111111]">
                {userName}
              </span>
              <span className="text-[13px] font-medium text-[#6B6A6A]">
                {accountType}
              </span>
            </div>

            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#6B6A6A]">{userEmail}</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[#6B6A6A]">الباقة الحالية :</span>
                {hasCurrentPlan ? (
                  <span className="bg-[#E2E8F0] text-[#111111] font-bold px-2 py-0.5 rounded text-[12px]">
                    {currentPlanLabel}
                  </span>
                ) : (
                  <span className="text-[#111111] font-bold">—</span>
                )}
              </div>
            </div>
          </div>

          {/* Section 1: New Package Options (Figma Nodes 4043:137358 & 4043:137215) */}
          <div className="flex flex-col gap-3">
            <span className="text-[13px] font-bold text-[#111111]">
              الباقة الجديدة
            </span>
            <div className="flex flex-col gap-2.5">
              {PACKAGE_OPTIONS.map((pkg) => {
                const isSelected = selectedPlanId === pkg.id
                return (
                  <button
                    key={pkg.id}
                    type="button"
                    onClick={() => setSelectedPlanId(pkg.id)}
                    className={`w-full p-4 rounded-xl flex items-center justify-between transition-all cursor-pointer text-right ${
                      isSelected
                        ? 'border-2 border-primary bg-white shadow-xs'
                        : 'border border-[#ECECEC] bg-white hover:bg-slate-50/70'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`size-5 rounded-md flex items-center justify-center border transition-colors ${
                          isSelected
                            ? 'bg-primary border-primary text-white'
                            : 'border-[#CBD5E1] bg-white'
                        }`}
                      >
                        {isSelected && (
                          <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                        )}
                      </div>
                      <span className="text-[14px] font-bold text-[#111111]">
                        {pkg.name}
                      </span>
                    </div>

                    <span className="text-[14px] font-bold text-[#111111]">
                      {pkg.price}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Section 2: Package Application Mode (Figma Node 4043:136807) */}
          {hasCurrentPlan && (
            <div className="flex flex-col gap-3 border-t border-[#ECECEC] pt-5">
              <span className="text-[13px] font-bold text-[#111111]">
                طريقة تطبيق الباقة
              </span>
              <div className="flex flex-col gap-2.5">
                {/* Option 1: Change type only */}
                <button
                  type="button"
                  onClick={() => setApplicationMode('type_only')}
                  className={`w-full p-4 rounded-xl border flex items-start gap-3 transition-all cursor-pointer text-right ${
                    applicationMode === 'type_only'
                      ? 'border-2 border-primary bg-white'
                      : 'border-[#ECECEC] bg-white hover:bg-slate-50/70'
                  }`}
                >
                  <div
                    className={`size-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      applicationMode === 'type_only'
                        ? 'border-primary'
                        : 'border-[#94A3B8]'
                    }`}
                  >
                    {applicationMode === 'type_only' && (
                      <div className="size-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-bold text-[#111111]">
                      تغيير نوع الباقة فقط
                    </span>
                    <span className="text-[12px] text-[#6B6A6A]">
                      سيتم تغيير نوع الباقة دون إضافة رصيد جديد.
                    </span>
                  </div>
                </button>

                {/* Option 2: Change type with adding credit */}
                <button
                  type="button"
                  onClick={() => setApplicationMode('with_credit')}
                  className={`w-full p-4 rounded-xl border flex items-start gap-3 transition-all cursor-pointer text-right ${
                    applicationMode === 'with_credit'
                      ? 'border-2 border-primary bg-white'
                      : 'border-[#ECECEC] bg-white hover:bg-slate-50/70'
                  }`}
                >
                  <div
                    className={`size-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                      applicationMode === 'with_credit'
                        ? 'border-primary'
                        : 'border-[#94A3B8]'
                    }`}
                  >
                    {applicationMode === 'with_credit' && (
                      <div className="size-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div className="flex flex-col gap-0.5">
                    <span className="text-[13px] font-bold text-[#111111]">
                      تغيير الباقة مع إضافة رصيدها
                    </span>
                    <span className="text-[12px] text-[#6B6A6A]">
                      سيتم إضافة رصيد الباقة الجديدة إلى الرصيد الحالي للمستخدم.
                    </span>
                  </div>
                </button>
              </div>
            </div>
          )}

          {/* Section 3: When does the new package start? (Figma Nodes 4043:137358 & 4043:137215) */}
          <div className="flex flex-col gap-3 border-t border-[#ECECEC] pt-5">
            <span className="text-[13px] font-bold text-[#111111]">
              متى يبدأ تطبيق الباقة الجديدة؟
            </span>
            <div className="flex flex-col gap-2.5">
              {/* Timing 1: Immediate */}
              <button
                type="button"
                onClick={() => setTiming('immediate')}
                className={`w-full p-4 rounded-xl border flex items-start gap-3 transition-all cursor-pointer text-right ${
                  timing === 'immediate'
                    ? 'border-2 border-primary bg-white'
                    : 'border-[#ECECEC] bg-white hover:bg-slate-50/70'
                }`}
              >
                <div
                  className={`size-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    timing === 'immediate'
                      ? 'border-primary'
                      : 'border-[#94A3B8]'
                  }`}
                >
                  {timing === 'immediate' && (
                    <div className="size-2 rounded-full bg-primary" />
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-bold text-[#111111]">
                    فورا
                  </span>
                  <span className="text-[12px] text-[#6B6A6A]">
                    يتم تفعيل الباقة الجديدة مباشر، بالاضافة الى الباقة الحالية
                  </span>
                </div>
              </button>

              {/* Timing 2: After current expiry */}
              <button
                type="button"
                onClick={() => setTiming('after_expiry')}
                className={`w-full p-4 rounded-xl border flex items-start gap-3 transition-all cursor-pointer text-right ${
                  timing === 'after_expiry'
                    ? 'border-2 border-primary bg-white'
                    : 'border-[#ECECEC] bg-white hover:bg-slate-50/70'
                }`}
              >
                <div
                  className={`size-4 rounded-full border flex items-center justify-center shrink-0 mt-0.5 ${
                    timing === 'after_expiry'
                      ? 'border-primary'
                      : 'border-[#94A3B8]'
                  }`}
                >
                  {timing === 'after_expiry' && (
                    <div className="size-2 rounded-full bg-primary" />
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[13px] font-bold text-[#111111]">
                    بعد الانتهاء من الباقة الحالية
                  </span>
                  <span className="text-[12px] text-[#6B6A6A]">
                    سيتم تفعيل الباقة الجديدة تلقائياً بعد انتهاء الباقة
                    الحالية.
                  </span>
                </div>
              </button>
            </div>
          </div>

          {/* Section 4: Send Notification Channels (Figma Nodes 4043:137358 & 4043:137215) */}
          <div className="flex flex-col gap-2.5 border-t border-[#ECECEC] pt-5">
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
            disabled={!selectedPlanId}
            className={`h-11 w-full font-bold text-[14px] rounded-full transition-colors cursor-pointer ${
              selectedPlanId
                ? 'bg-primary text-white hover:bg-[#0f2338]'
                : 'bg-[#94A3B8] text-white cursor-not-allowed'
            }`}
          >
            اضافة الباقة
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
