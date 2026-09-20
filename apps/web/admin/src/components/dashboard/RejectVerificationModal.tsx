'use client'

import { useState } from 'react'
import { AlertWarningTriangleIcon } from '@/components/icons/AdminIcons'

export interface RejectVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (options: {
    reason: string
    notifyEmail: boolean
    notifyInApp: boolean
  }) => void
  isLoading?: boolean
}

export default function RejectVerificationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: RejectVerificationModalProps) {
  const [reason, setReason] = useState('')
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifyInApp, setNotifyInApp] = useState(true)

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm({ reason, notifyEmail, notifyInApp })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center select-none"
      dir="rtl"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card matching Figma 2734:152236 */}
      <div
        className="relative bg-white rounded-xl p-6 w-125 max-w-[calc(100vw-32px)] shadow-2xl flex flex-col gap-6 items-center z-10 animate-in fade-in zoom-in-95 duration-200"
        data-node-id="2734:152236"
        data-name="remove verification popup"
      >
        <div className="flex flex-col gap-5 items-center w-full">
          {/* Warning Icon & Headings */}
          <div className="flex flex-col gap-2 items-center justify-center w-full text-center">
            <div className="bg-[#f9fafe] flex items-center justify-center p-3 rounded-full size-16 shrink-0 mb-1">
              <AlertWarningTriangleIcon className="w-8 h-8 text-[#111111]" />
            </div>

            <h3 className="font-['Cairo'] font-bold text-[18px] text-[#111111] leading-normal">
              رفض طلب التوثيق
            </h3>
            <p className="font-['Cairo'] font-normal text-[14px] text-[#6b6a6a] leading-relaxed">
              سيتم رفض طلب التوثيق وإبلاغ صاحب الحساب بسبب الرفض.
            </p>
          </div>

          {/* Reason Textarea (Optional) */}
          <div className="flex flex-col gap-2 items-start w-full text-right">
            <label className="font-['Cairo'] font-medium text-[14px] text-[#111111]">
              <span>السبب </span>
              <span className="text-[#6B6A6A]">(اختياري)</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="سبب الرفض..."
              rows={3}
              className="w-full bg-white border border-[#ECECEC] rounded-lg px-3.5 py-2.5 text-right font-['Cairo'] text-[14px] text-[#111111] placeholder:text-[#979797] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition resize-none"
            />
          </div>

          {/* Notification Options */}
          <div className="flex flex-col gap-3 items-start w-full text-right">
            <p className="font-['Cairo'] font-medium text-[14px] text-[#111111] leading-normal">
              ارسال اشعار للمستخدم عبر :
            </p>

            <div className="flex flex-col gap-2 w-full">
              {/* Email Notification */}
              <label
                onClick={() => setNotifyEmail(!notifyEmail)}
                className="flex items-center gap-2 py-1 cursor-pointer select-none group"
              >
                <div
                  className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
                    notifyEmail
                      ? 'bg-primary border-primary text-white'
                      : 'border-[#D7D7D7] bg-white group-hover:border-primary'
                  }`}
                >
                  {notifyEmail && (
                    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2.5 6L5 8.5L9.5 3.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span className="font-['Cairo'] font-medium text-[14px] text-[#6b6a6a]">
                  البريد الالكتروني.
                </span>
              </label>

              {/* In-App Notification */}
              <label
                onClick={() => setNotifyInApp(!notifyInApp)}
                className="flex items-center gap-2 py-1 cursor-pointer select-none group"
              >
                <div
                  className={`w-4 h-4 rounded-sm border flex items-center justify-center transition-colors ${
                    notifyInApp
                      ? 'bg-primary border-primary text-white'
                      : 'border-[#D7D7D7] bg-white group-hover:border-primary'
                  }`}
                >
                  {notifyInApp && (
                    <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none">
                      <path
                        d="M2.5 6L5 8.5L9.5 3.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  )}
                </div>
                <span className="font-['Cairo'] font-medium text-[14px] text-[#6b6a6a]">
                  داخل التطبيق.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full pt-1">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 h-11.5 bg-[#9C1E28] hover:bg-[#9C1E28]/90 text-white rounded-3xl font-['Cairo'] font-semibold text-[14px] flex items-center justify-center transition disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'جاري الرفض...' : 'رفض الطلب'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-11.5 bg-white border border-[#E2E8F0] hover:bg-[#F9FAFB] text-[#111111] rounded-3xl font-['Cairo'] font-semibold text-[14px] flex items-center justify-center transition cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}
