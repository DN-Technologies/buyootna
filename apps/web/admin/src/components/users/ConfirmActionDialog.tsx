'use client'

import { useState } from 'react'
import type { ComponentType } from 'react'
import { Eye, EyeOff, Trash2 } from 'lucide-react'

export type ConfirmActionType = 'delete' | 'hide' | 'republish'

const config: Record<
  ConfirmActionType,
  {
    icon: ComponentType<{ className?: string }>
    iconWrapClassName: string
    title: string
    description: (adLabel: string, code: string) => string
    confirmLabel: string
    confirmClassName: string
  }
> = {
  delete: {
    icon: Trash2,
    iconWrapClassName: 'bg-[#FEF3F2] text-[#9C1E28]',
    title: 'حذف الإعلان نهائياً',
    description: (adLabel, code) =>
      `سيتم حذف اعلان "${adLabel}" برقم #${code} من المنصة ولن يعود ظاهراً للمستخدمين مرة اخرى ولا يمكن التراجع عن هذا الإجراء.`,
    confirmLabel: 'حذف الاعلان',
    confirmClassName: 'bg-[#9C1E28] text-white',
  },
  hide: {
    icon: EyeOff,
    iconWrapClassName: 'bg-[#EEF2FE] text-primary',
    title: 'اخفاء الاعلان',
    description: (adLabel, code) =>
      `سيتم اخفاء اعلان "${adLabel}" برقم #${code} من المنصة ولن يعود ظاهراً للمستخدمين مرة اخرى.`,
    confirmLabel: 'اخفاء الاعلان',
    confirmClassName: 'bg-primary text-white',
  },
  republish: {
    icon: Eye,
    iconWrapClassName: 'bg-[#EEF2FE] text-primary',
    title: 'اعادة نشر الاعلان',
    description: (adLabel, code) =>
      `هل انت متأكد من اعادة نشر اعلان "${adLabel}" برقم #${code}؟ سيظهر مرة اخرى في صفحة المالك وللمستخدمين.`,
    confirmLabel: 'اعادة نشر الاعلان',
    confirmClassName: 'bg-primary text-white',
  },
}

export default function ConfirmActionDialog({
  type,
  adLabel,
  code,
  onClose,
  onConfirm,
}: {
  type: ConfirmActionType
  adLabel: string
  code: string
  onClose: () => void
  onConfirm: (payload: {
    reason: string
    notifyEmail: boolean
    notifyApp: boolean
  }) => void
}) {
  const [reason, setReason] = useState('')
  const [notifyEmail, setNotifyEmail] = useState(false)
  const [notifyApp, setNotifyApp] = useState(false)

  const {
    icon: Icon,
    iconWrapClassName,
    title,
    description,
    confirmLabel,
    confirmClassName,
  } = config[type]

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      <div
        className="bg-white rounded-xl p-6 flex flex-col gap-6 items-center w-full max-w-md relative font-['Cairo']"
        dir="rtl"
      >
        <div
          className={`size-12 rounded-full flex items-center justify-center shrink-0 ${iconWrapClassName}`}
        >
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex flex-col gap-2 items-center text-center w-full">
          <p className="text-[18px] font-bold text-[#111111]">{title}</p>
          <p className="text-[14px] text-[#6B6A6A] leading-[1.6]">
            {description(adLabel, code)}
          </p>
        </div>

        <div className="flex flex-col gap-1.5 w-full">
          <p className="text-[14px] font-medium text-[#111111]">
            السبب (اختياري)
          </p>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="سبب التعطيل..."
            rows={3}
            className="bg-white border border-[#ECECEC] rounded-lg p-3 w-full text-[14px] text-[#111111] placeholder-[#979797] resize-none focus:outline-none"
          />
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
            <span className="text-[14px] text-[#111111]">داخل التطبيق.</span>
          </label>
        </div>

        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11.5 flex items-center justify-center rounded-full border border-[#E2E8F0] text-[#111111] text-[14px] font-semibold cursor-pointer"
          >
            إلغاء
          </button>
          <button
            type="button"
            onClick={() => onConfirm({ reason, notifyEmail, notifyApp })}
            className={`flex-1 h-11.5 flex items-center justify-center rounded-full text-[14px] font-semibold cursor-pointer ${confirmClassName}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
