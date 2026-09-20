'use client'

import React, { useState } from 'react'

export interface RequestEditModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (options: { notes: string; notifyEmail: boolean; notifyInApp: boolean }) => void
  isLoading?: boolean
}

export default function RequestEditModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: RequestEditModalProps) {
  const [notes, setNotes] = useState('')
  const [notifyEmail, setNotifyEmail] = useState(true)
  const [notifyInApp, setNotifyInApp] = useState(true)

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm({ notes, notifyEmail, notifyInApp })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center select-none" dir="rtl">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={onClose}
      />

      {/* Modal Card matching Figma node 2804:65127 */}
      <div
        className="relative bg-white rounded-[12px] pb-6 pt-7 px-6 w-[500px] max-w-[calc(100vw-32px)] shadow-2xl flex flex-col gap-8 items-center z-10 animate-in fade-in zoom-in-95 duration-200"
        data-node-id="2804:65127"
        data-name="request edit popup"
      >
        <div className="flex flex-col gap-6 items-center w-full">
          {/* Header Title & Description */}
          <div className="flex flex-col gap-2 items-center justify-center w-full text-center">
            <h3 className="font-['Cairo'] font-bold text-[18px] text-[#111111] leading-normal">
              طلب تعديل بيانات التوثيق
            </h3>
            <p className="font-['Cairo'] font-normal text-[14px] text-[#6b6a6a] leading-relaxed">
              سيتم إبلاغ صاحب الحساب بالملاحظات المطلوبة، وسيتمكن من إعادة رفع بيانات التوثيق بعد إجراء التعديلات.
            </p>
          </div>

          {/* Form Fields */}
          <div className="flex flex-col gap-4 items-start w-full text-right">
            {/* Notes / Problem Type */}
            <div className="flex flex-col gap-2 items-start w-full">
              <label className="font-['Cairo'] font-medium text-[14px] text-[#111111]">
                نوع المشكلة
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="اكتب الملاحظات أو التعديلات المطلوبة..."
                rows={3}
                className="w-full bg-white border border-[#ECECEC] rounded-[8px] px-3.5 py-3 text-right font-['Cairo'] text-[14px] text-[#111111] placeholder:text-[#979797] focus:outline-none focus:border-[#15304D] focus:ring-1 focus:ring-[#15304D] transition resize-none"
              />
            </div>

            {/* Notification Channels */}
            <div className="flex flex-col gap-3 items-start w-full">
              <p className="font-['Cairo'] font-medium text-[14px] text-[#111111] leading-normal">
                ارسال اشعار للمستخدم عبر :
              </p>

              <div className="flex flex-col gap-2 w-full">
                {/* Email Checkbox */}
                <label
                  onClick={() => setNotifyEmail(!notifyEmail)}
                  className="flex items-center gap-2 py-1 cursor-pointer select-none group"
                >
                  <div
                    className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${
                      notifyEmail
                        ? 'bg-[#15304D] border-[#15304D] text-white'
                        : 'border-[#D7D7D7] bg-white group-hover:border-[#15304D]'
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

                {/* In-App Checkbox */}
                <label
                  onClick={() => setNotifyInApp(!notifyInApp)}
                  className="flex items-center gap-2 py-1 cursor-pointer select-none group"
                >
                  <div
                    className={`w-4 h-4 rounded-[4px] border flex items-center justify-center transition-colors ${
                      notifyInApp
                        ? 'bg-[#15304D] border-[#15304D] text-white'
                        : 'border-[#D7D7D7] bg-white group-hover:border-[#15304D]'
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
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-3 w-full">
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 h-[46px] bg-[#15304D] hover:bg-[#15304D]/90 text-white rounded-[24px] font-['Cairo'] font-semibold text-[14px] flex items-center justify-center transition disabled:opacity-50 cursor-pointer"
          >
            {isLoading ? 'جاري الإرسال...' : 'إرسال طلب التعديل'}
          </button>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-[46px] bg-white border border-[#E2E8F0] hover:bg-[#F9FAFB] text-[#111111] rounded-[24px] font-['Cairo'] font-semibold text-[14px] flex items-center justify-center transition cursor-pointer"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}
