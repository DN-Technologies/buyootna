'use client'

import { useState } from 'react'
import { Trash2, EyeOff, Eye } from 'lucide-react'

export type ServiceActionMode = 'delete' | 'hide' | 'republish'

export interface ServiceActionModalProps {
  isOpen: boolean
  mode: ServiceActionMode
  serviceTitle: string
  onClose: () => void
  onSubmit: (data: {
    reason?: string
    notifyEmail: boolean
    notifyInApp: boolean
  }) => void
}

export default function ServiceActionModal({
  isOpen,
  mode,
  serviceTitle,
  onClose,
  onSubmit,
}: ServiceActionModalProps) {
  const [reason, setReason] = useState('')
  const [notifyEmail, setNotifyEmail] = useState(false)
  const [notifyInApp, setNotifyInApp] = useState(false)

  if (!isOpen) return null

  const isDelete = mode === 'delete'
  const isHide = mode === 'hide'

  const title = isDelete
    ? 'حذف الخدمة نهائياً'
    : isHide
      ? 'إخفاء الخدمة'
      : 'اعادة نشر الخدمة'

  const description = isDelete
    ? `سيتم حذف خدمة "${serviceTitle}" من المنصة ولن يعود ظاهراً للمستخدمين مرة اخرى ولا يمكن التراجع عن هذا الإجراء.`
    : isHide
      ? `سيتم اخفاء خدمة "${serviceTitle}" من التطبيق ولن يتمكن المستخدمون من رؤيتها حتى يتم إعادة تفعيلها.`
      : `هل انت متأكد من اعادة نشر خدمة "${serviceTitle}" سيظهر مرة اخرى في صفحة المالك وللمستخدمين.`

  const primaryBtnText = isDelete
    ? 'حذف الخدمة'
    : isHide
      ? 'اخفاء الخدمة'
      : 'اعادة نشر الخدمة'

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit({ reason, notifyEmail, notifyInApp })
    setReason('')
    setNotifyEmail(false)
    setNotifyInApp(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 font-['Cairo']">
      <div
        className="bg-white rounded-2xl p-6 w-full max-w-md flex flex-col items-center gap-5 text-center shadow-xl relative"
        dir="rtl"
      >
        {/* Modal Top Icon */}
        <div
          className={`size-14 rounded-full flex items-center justify-center ${
            isDelete ? 'bg-[#FEF3F2]' : 'bg-[#F1F5F9]'
          }`}
        >
          {isDelete ? (
            <Trash2 className="w-6 h-6 text-[#9C1E28]" />
          ) : isHide ? (
            <EyeOff className="w-6 h-6 text-primary" />
          ) : (
            <Eye className="w-6 h-6 text-primary" />
          )}
        </div>

        {/* Title & Description */}
        <div className="flex flex-col gap-1.5 w-full">
          <h3 className="font-bold text-[20px] text-[#111111] leading-tight">
            {title}
          </h3>
          <p className="text-[14px] text-[#6B6A6A] font-normal leading-relaxed">
            {description}
          </p>
        </div>

        {/* Form Controls */}
        <form
          onSubmit={handleSubmit}
          className="w-full flex flex-col gap-4 text-right"
        >
          {/* Reason Textarea */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[13px] font-medium text-[#111111]">
              السبب (اختياري)
            </label>
            <textarea
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="سبب التعطيل..."
              className="w-full border border-[#ECECEC] rounded-lg p-3 text-[13px] text-[#111111] placeholder-[#A0A0A0] focus:outline-none focus:border-primary resize-none font-['Cairo']"
            />
          </div>

          {/* Notification Checkboxes */}
          <div className="flex flex-col gap-2 pt-1">
            <p className="text-[13px] font-medium text-[#111111]">
              ارسال اشعار للمستخدم عبر :
            </p>

            <label className="flex items-center gap-2 text-[13px] text-[#6B6A6A] cursor-pointer">
              <input
                type="checkbox"
                checked={notifyEmail}
                onChange={(e) => setNotifyEmail(e.target.checked)}
                className="rounded border-[#CBD5E1] text-primary focus:ring-primary size-4 cursor-pointer"
              />
              <span>البريد الالكتروني.</span>
            </label>

            <label className="flex items-center gap-2 text-[13px] text-[#6B6A6A] cursor-pointer">
              <input
                type="checkbox"
                checked={notifyInApp}
                onChange={(e) => setNotifyInApp(e.target.checked)}
                className="rounded border-[#CBD5E1] text-primary focus:ring-primary size-4 cursor-pointer"
              />
              <span>داخل التطبيق.</span>
            </label>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-3 pt-3">
            <button
              type="submit"
              className={`flex-1 h-11 rounded-full text-[14px] font-bold text-white transition-colors cursor-pointer ${
                isDelete
                  ? 'bg-[#9C1E28] hover:bg-[#851821]'
                  : 'bg-primary hover:bg-[#0f243a]'
              }`}
            >
              {primaryBtnText}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex-1 h-11 rounded-full border border-[#ECECEC] bg-white hover:bg-slate-50 text-[#111111] text-[14px] font-bold transition-colors cursor-pointer"
            >
              إلغاء
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
