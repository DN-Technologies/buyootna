'use client'

import { useEffect, useState } from 'react'
import { Eye } from 'lucide-react'

export interface RepublishAdDialogProps {
  open: boolean
  onClose: () => void
  onConfirm?: () => void
}

export default function RepublishAdDialog({
  open,
  onClose,
  onConfirm,
}: RepublishAdDialogProps) {
  const [reason, setReason] = useState('')
  const [sendEmail, setSendEmail] = useState(false)
  const [sendInApp, setSendInApp] = useState(false)

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

  return (
    <div className="fixed inset-0 z-50 font-['Cairo'] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal Dialog Box */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col items-center justify-center text-right gap-5 z-10"
        dir="rtl"
      >
        {/* Eye Icon Badge */}
        <div className="size-16 rounded-full bg-[#F0F6FF] flex items-center justify-center text-primary">
          <Eye className="w-7 h-7" />
        </div>

        {/* Title & Description */}
        <div className="flex flex-col gap-2 text-center w-full">
          <h2 className="text-[20px] font-bold text-[#111111]">
            اعادة نشر الاعلان
          </h2>
          <p className="text-[14px] font-medium text-[#6B6A6A] leading-relaxed">
            هل انت متأكد من اعادة نشر اعلان &quot;شقة للبيع في السالمية برقم
            649780494#&quot; سيظهر مرة اخرى في صفحة المالك وللمستخدمين .
          </p>
        </div>

        {/* Optional Reason Input */}
        <div className="flex flex-col gap-1.5 w-full text-right">
          <label className="text-[13px] font-bold text-[#111111]">
            السبب (اختياري)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="سبب التعطيل..."
            rows={3}
            className="w-full p-3 bg-white border border-[#ECECEC] rounded-xl text-[14px] text-[#111111] focus:outline-none focus:border-primary resize-none"
          />
        </div>

        {/* Notification Options */}
        <div className="flex flex-col gap-2 w-full text-right text-[13px] font-medium text-[#111111]">
          <span>ارسال اشعار للمستخدم عبر :</span>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sendEmail}
              onChange={(e) => setSendEmail(e.target.checked)}
              className="rounded border-[#ECECEC] text-primary focus:ring-primary size-4"
            />
            <span>البريد الالكتروني.</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={sendInApp}
              onChange={(e) => setSendInApp(e.target.checked)}
              className="rounded border-[#ECECEC] text-primary focus:ring-primary size-4"
            />
            <span>داخل التطبيق.</span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full pt-2">
          <button
            type="button"
            onClick={() => {
              onConfirm?.()
              onClose()
            }}
            className="flex-1 h-11 bg-primary hover:bg-[#0F2238] text-white font-bold text-[14px] rounded-xl transition-colors cursor-pointer"
          >
            اعادة نشر الاعلان
          </button>
          <button
            type="button"
            onClick={onClose}
            className="flex-1 h-11 bg-white border border-[#ECECEC] hover:bg-[#F8FAFC] text-[#111111] font-bold text-[14px] rounded-xl transition-colors cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}
