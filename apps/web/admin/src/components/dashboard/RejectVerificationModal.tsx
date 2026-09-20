'use client'

import { useState, useEffect } from 'react'
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
  isRevoke?: boolean
  targetName?: string
  title?: string
  subtitle?: string
  confirmButtonText?: string
}

export default function RejectVerificationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  isRevoke = false,
  targetName,
  title,
  subtitle,
  confirmButtonText,
}: RejectVerificationModalProps) {
  const [reason, setReason] = useState('')
  const [notifyEmail, setNotifyEmail] = useState(false)
  const [notifyInApp, setNotifyInApp] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setReason('')
      setNotifyEmail(false)
      setNotifyInApp(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const modalTitle = title || (isRevoke ? 'إلغاء التوثيق' : 'رفض طلب التوثيق')
  const modalSubtitle =
    subtitle ||
    (isRevoke
      ? targetName
        ? `سيتم إلغاء توثيق ${targetName} وإبلاغ صاحب الحساب بسبب الرفض.`
        : 'سيتم إلغاء توثيق شركة “المستقبل” وإبلاغ صاحب الحساب بسبب الرفض.'
      : 'سيتم رفض طلب التوثيق وإبلاغ صاحب الحساب بسبب الرفض.')
  const modalButtonText = confirmButtonText || 'رفض الطلب'

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

      {/* Modal Card matching Figma node 2769:52213 & 2772:54805 */}
      <div
        className="relative bg-white rounded-xl p-6 w-125 max-w-[calc(100vw-32px)] shadow-2xl flex flex-col gap-8 items-center z-10 animate-in fade-in zoom-in-95 duration-200"
        data-node-id={isRevoke ? '2772:54805' : '2769:52213'}
        data-name="remove verification popup"
      >
        <div
          className="flex flex-col gap-6 items-center w-full"
          data-node-id={isRevoke ? '2772:54806' : '2769:52214'}
        >
          {/* Warning Icon & Headings matching Figma 2769:52215 & 2772:54807 */}
          <div
            className="flex flex-col gap-1 items-center justify-center w-full text-center"
            data-node-id={isRevoke ? '2772:54807' : '2769:52215'}
            data-name="page title"
          >
            <div
              className="bg-[#F9FAFE] flex items-center justify-center rounded-full size-16 shrink-0 mb-2"
              data-node-id={isRevoke ? '2772:54808' : '2769:52216'}
            >
              <div
                className="size-8 flex items-center justify-center"
                data-node-id={isRevoke ? '2772:54809' : '2769:52217'}
                data-name="Frame"
              >
                <AlertWarningTriangleIcon className="w-8 h-8 text-[#111111]" />
              </div>
            </div>

            <div
              className="flex flex-col gap-2 items-center justify-center text-center w-full"
              data-node-id={isRevoke ? '2772:54810' : '2769:52218'}
            >
              <h3
                className="font-['Cairo'] font-bold text-[18px] text-[#111111] leading-normal"
                data-node-id={isRevoke ? '2772:54811' : '2769:52219'}
              >
                {modalTitle}
              </h3>
              <p
                className="font-['Cairo'] font-normal text-[14px] text-[#6B6A6A] leading-normal tracking-[-0.408px]"
                data-node-id={isRevoke ? '2772:54812' : '2769:52220'}
              >
                {modalSubtitle}
              </p>
            </div>
          </div>

          {/* Form Fields Section matching Figma 2769:52221 & 2772:54813 */}
          <div
            className="flex flex-col gap-4 items-start w-full"
            data-node-id={isRevoke ? '2772:54813' : '2769:52221'}
          >
            {/* Reason Textarea (Optional) matching Figma 2769:52222 & 2772:54814 */}
            <div
              className="flex flex-col gap-2 items-start w-full text-right"
              data-node-id={isRevoke ? '2772:54814' : '2769:52222'}
              data-name="Component 39"
            >
              <label className="font-['Cairo'] font-medium text-[14px] text-[#111111]">
                <span className="leading-normal">السبب </span>
                <span className="leading-normal">(اختياري)</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="سبب التعطيل..."
                rows={3}
                className="w-full bg-white border border-[#ECECEC] rounded-lg px-3.5 py-3 text-right font-['Cairo'] text-[14px] text-[#111111] placeholder:text-[#979797] focus:outline-none focus:border-[#9C1E28] focus:ring-1 focus:ring-[#9C1E28] transition resize-none"
              />
            </div>

            {/* Notification Options matching Figma 2769:52223 & 2772:54815 */}
            <div
              className="flex flex-col gap-3 items-start w-full text-right"
              data-node-id={isRevoke ? '2772:54815' : '2769:52223'}
              data-name="Input"
            >
              <p
                className="font-['Cairo'] font-medium text-[14px] text-[#111111] leading-normal tracking-[-0.408px]"
                data-node-id={isRevoke ? '2772:54816' : '2769:52224'}
              >
                ارسال اشعار للمستخدم عبر :
              </p>

              <div
                className="flex flex-col gap-1 items-start w-full"
                data-node-id={isRevoke ? '2772:54817' : '2769:52225'}
              >
                {/* Email Notification matching Figma 2769:52226 & 2772:54818 */}
                <label
                  onClick={() => setNotifyEmail(!notifyEmail)}
                  className="flex items-center gap-2 py-1 cursor-pointer select-none group"
                  data-node-id={isRevoke ? '2772:54818' : '2769:52226'}
                >
                  <div
                    className={`size-4 rounded-sm border flex items-center justify-center transition-colors ${
                      notifyEmail
                        ? 'bg-[#9C1E28] border-[#9C1E28] text-white'
                        : 'border-[#D7D7D7] bg-white group-hover:border-[#9C1E28]'
                    }`}
                    data-node-id={isRevoke ? '2772:54820' : '2769:52228'}
                  >
                    {notifyEmail && (
                      <svg className="size-2.5" viewBox="0 0 12 12" fill="none">
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
                  <span
                    className="font-['Cairo'] font-medium text-[14px] text-[#6B6A6A] leading-normal tracking-[-0.408px]"
                    data-node-id={isRevoke ? '2772:54819' : '2769:52227'}
                  >
                    البريد الالكتروني.
                  </span>
                </label>

                {/* In-App Notification matching Figma 2769:52229 & 2772:54821 */}
                <label
                  onClick={() => setNotifyInApp(!notifyInApp)}
                  className="flex items-center gap-2 py-1 cursor-pointer select-none group"
                  data-node-id={isRevoke ? '2772:54821' : '2769:52229'}
                >
                  <div
                    className={`size-4 rounded-sm border flex items-center justify-center transition-colors ${
                      notifyInApp
                        ? 'bg-[#9C1E28] border-[#9C1E28] text-white'
                        : 'border-[#D7D7D7] bg-white group-hover:border-[#9C1E28]'
                    }`}
                    data-node-id={isRevoke ? '2772:54823' : '2769:52231'}
                  >
                    {notifyInApp && (
                      <svg className="size-2.5" viewBox="0 0 12 12" fill="none">
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
                  <span
                    className="font-['Cairo'] font-medium text-[14px] text-[#6B6A6A] leading-normal tracking-[-0.408px]"
                    data-node-id={isRevoke ? '2772:54822' : '2769:52230'}
                  >
                    داخل التطبيق.
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons matching Figma 2769:52232 & 2772:54824 */}
        <div
          className="flex items-center gap-3 w-full"
          data-node-id={isRevoke ? '2772:54824' : '2769:52232'}
        >
          {/* Primary Danger Action (Right in RTL): رفض الطلب */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 h-12 bg-[#9C1E28] hover:bg-[#801820] text-white rounded-3xl font-['Cairo'] font-semibold text-[14px] tracking-[0.28px] flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            data-node-id={isRevoke ? '2772:54826' : '2769:52234'}
          >
            {isLoading ? 'جاري التنفيذ...' : modalButtonText}
          </button>

          {/* Secondary Action (Left in RTL): إلغاء */}
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-11.5 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#111111] rounded-3xl font-['Cairo'] font-semibold text-[14px] tracking-[0.28px] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            data-node-id={isRevoke ? '2772:54825' : '2769:52233'}
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}
