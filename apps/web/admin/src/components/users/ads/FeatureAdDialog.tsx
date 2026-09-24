'use client'

import { useState } from 'react'
import { Star } from 'lucide-react'
import { ScrollArea } from '@buyootna/ui'

type Duration = 'day' | 'week' | 'month'
type ApplyMethod = 'type-only' | 'type-and-credit'

const DURATION_DAYS: Record<Duration, number> = { day: 1, week: 7, month: 30 }

export function featuredUntilFromDuration(duration: Duration): string {
  const until = new Date()
  until.setDate(until.getDate() + DURATION_DAYS[duration])
  return until.toISOString()
}

const durationOptions: {
  id: Duration
  label: string
  subtitle: string
  price: string
}[] = [
  {
    id: 'day',
    label: 'تمييز ليوم',
    subtitle: 'تعزيز سريع للإعلان.',
    price: '10 د.ك',
  },
  {
    id: 'week',
    label: 'تمييز لاسبوع',
    subtitle: 'ظهور أقوى لمدة أطول.',
    price: '10 د.ك',
  },
  {
    id: 'month',
    label: 'تمييز لشهر',
    subtitle: 'أفضل انتشار لإعلانك.',
    price: '10 د.ك',
  },
]

const applyOptions: { id: ApplyMethod; label: string; subtitle: string }[] = [
  {
    id: 'type-only',
    label: 'تغيير نوع الباقة فقط',
    subtitle: 'سيتم تغيير نوع الباقة دون إضافة رصيد جديد.',
  },
  {
    id: 'type-and-credit',
    label: 'تغيير الباقة مع اضافة رصيدها',
    subtitle: 'سيتم اضافة رصيد الباقة الجديدة إلى الرصيد الحالي للمستخدم.',
  },
]

export default function FeatureAdDialog({
  adLabel,
  code,
  onClose,
  onConfirm,
}: {
  adLabel: string
  code: string
  onClose: () => void
  onConfirm: (payload: {
    duration: Duration
    applyMethod: ApplyMethod
    notifyEmail: boolean
    notifyApp: boolean
  }) => void
}) {
  const [duration, setDuration] = useState<Duration | null>(null)
  const [applyMethod, setApplyMethod] = useState<ApplyMethod | null>(null)
  const [notifyEmail, setNotifyEmail] = useState(false)
  const [notifyApp, setNotifyApp] = useState(false)

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div
        className="bg-white rounded-xl w-full max-w-md relative font-['Cairo'] h-[85vh] max-h-160 flex flex-col"
        dir="rtl"
      >
        <ScrollArea dir="rtl" className="flex-1 min-h-0">
          <div className="flex flex-col gap-6 items-center p-6 pb-2">
            <div className="size-12 rounded-full flex items-center justify-center shrink-0 bg-linear-to-l from-[#FF8D28] to-[#FACC15]">
              <Star className="w-5 h-5 text-white" />
            </div>

            <div className="flex flex-col gap-2 items-center text-center w-full">
              <p className="text-[18px] font-bold text-[#111111]">
                هل ترغب في تمييز الاعلان ؟
              </p>
              <p className="text-[14px] text-[#6B6A6A] leading-[1.6]">
                سيتم تمييز اعلان &quot;{adLabel}&quot; برقم #{code} ليظهر في
                مقدمة نتائج البحث لمدة التمييز المختارة.
              </p>
            </div>

            <div className="flex flex-col gap-2.5 w-full">
              <p className="text-[14px] font-medium text-[#111111]">
                مدة التمييز
              </p>
              {durationOptions.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-center justify-between w-full border rounded-lg p-3.5 cursor-pointer ${
                    duration === option.id
                      ? 'border-primary'
                      : 'border-[#ECECEC]'
                  }`}
                >
                  <div className="flex items-center gap-3 shrink-0">
                    <input
                      type="radio"
                      name="feature-duration"
                      checked={duration === option.id}
                      onChange={() => setDuration(option.id)}
                      className="cursor-pointer"
                    />
                    <div className="flex flex-col text-right">
                      <p className="text-[14px] font-semibold text-[#111111]">
                        {option.label}
                      </p>
                      <p className="text-[12px] text-[#6B6A6A]">
                        {option.subtitle}
                      </p>
                    </div>
                  </div>
                  <span className="text-[14px] font-bold text-[#111111]">
                    {option.price}
                  </span>
                </label>
              ))}
            </div>

            <div className="flex flex-col gap-2.5 w-full">
              <p className="text-[14px] font-medium text-[#111111]">
                طريقة تطبيق الباقة
              </p>
              {applyOptions.map((option) => (
                <label
                  key={option.id}
                  className={`flex items-center gap-3 justify-between w-full border rounded-lg p-3.5 cursor-pointer ${
                    applyMethod === option.id
                      ? 'border-primary'
                      : 'border-[#ECECEC]'
                  }`}
                >
                  <input
                    type="radio"
                    name="feature-apply-method"
                    checked={applyMethod === option.id}
                    onChange={() => setApplyMethod(option.id)}
                    className="cursor-pointer shrink-0"
                  />
                  <div className="flex flex-col text-right flex-1">
                    <p className="text-[14px] font-semibold text-[#111111]">
                      {option.label}
                    </p>
                    <p className="text-[12px] text-[#6B6A6A]">
                      {option.subtitle}
                    </p>
                  </div>
                </label>
              ))}
            </div>

            <div className="flex flex-col gap-2.5 w-full">
              <p className="text-[14px] font-medium text-[#111111]">
                ارسال اشعار للمستخدم عبر:
              </p>
              <label className="flex items-center gap-2 w-full cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyEmail}
                  onChange={(e) => setNotifyEmail(e.target.checked)}
                  className="rounded border-[#CBD5E1] cursor-pointer"
                />
                <span className="text-[14px] text-[#111111]">
                  البريد الالكتروني.
                </span>
              </label>
              <label className="flex items-center gap-2 w-full cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifyApp}
                  onChange={(e) => setNotifyApp(e.target.checked)}
                  className="rounded border-[#CBD5E1] cursor-pointer"
                />
                <span className="text-[14px] text-[#111111]">
                  داخل التطبيق.
                </span>
              </label>
            </div>
          </div>
        </ScrollArea>

        <div className="flex items-center gap-3 w-full p-6 pt-4 border-t border-[#ECECEC]">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11.5 flex items-center justify-center rounded-full border border-[#E2E8F0] text-[#111111] text-[14px] font-semibold cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="button"
            disabled={!duration || !applyMethod}
            onClick={() =>
              duration &&
              applyMethod &&
              onConfirm({ duration, applyMethod, notifyEmail, notifyApp })
            }
            className="flex-1 h-11.5 flex items-center justify-center rounded-full bg-primary text-white text-[14px] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            تمييز الاعلان
          </button>
        </div>
      </div>
    </div>
  )
}
