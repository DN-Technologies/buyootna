'use client'

import React, { useState, useEffect } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { UserRow } from './UserTable'

export interface BlockUserModalProps {
  user: UserRow | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (
    user: UserRow,
    reason?: string,
    sendEmail?: boolean,
    preventNewAccount?: boolean,
  ) => Promise<void> | void
}

export function WarningTriangleIcon({
  className = 'size-8',
}: {
  className?: string
}) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g id="Frame">
        <path
          id="Vector"
          d="M29.6 23.5113L18.6688 4.5275C18.3956 4.06241 18.0056 3.67677 17.5375 3.40883C17.0694 3.14088 16.5394 2.99992 16 2.99992C15.4606 2.99992 14.9306 3.14088 14.4625 3.40883C13.9944 3.67677 13.6044 4.06241 13.3313 4.5275L2.4 23.5113C2.13717 23.9611 1.99866 24.4727 1.99866 24.9938C1.99866 25.5148 2.13717 26.0264 2.4 26.4763C2.66966 26.9442 3.05896 27.3319 3.52795 27.5997C3.99694 27.8674 4.52873 28.0056 5.06875 28H26.9312C27.4708 28.0052 28.0021 27.8668 28.4706 27.599C28.9391 27.3313 29.328 26.9438 29.5975 26.4763C29.8607 26.0266 29.9997 25.5151 30.0001 24.9941C30.0005 24.4731 29.8625 23.9613 29.6 23.5113ZM27.8662 25.475C27.771 25.6376 27.6341 25.7719 27.4698 25.8641C27.3055 25.9564 27.1197 26.0033 26.9312 26H5.06875C4.88035 26.0033 4.69446 25.9564 4.53016 25.8641C4.36586 25.7719 4.22905 25.6376 4.13375 25.475C4.04743 25.3289 4.0019 25.1622 4.0019 24.9925C4.0019 24.8228 4.04743 24.6561 4.13375 24.51L15.065 5.52625C15.1622 5.36447 15.2997 5.23059 15.4639 5.13765C15.6282 5.04471 15.8138 4.99587 16.0025 4.99587C16.1912 4.99587 16.3768 5.04471 16.5411 5.13765C16.7053 5.23059 16.8428 5.36447 16.94 5.52625L27.8713 24.51C27.9568 24.6566 28.0015 24.8235 28.0006 24.9932C27.9997 25.1629 27.9533 25.3293 27.8662 25.475ZM15 18V13C15 12.7348 15.1054 12.4804 15.2929 12.2929C15.4804 12.1054 15.7348 12 16 12C16.2652 12 16.5196 12.1054 16.7071 12.2929C16.8946 12.4804 17 12.7348 17 13V18C17 18.2652 16.8946 18.5196 16.7071 18.7071C16.5196 18.8946 16.2652 19 16 19C15.7348 19 15.4804 18.8946 15.2929 18.7071C15.1054 18.5196 15 18.2652 15 18ZM17.5 22.5C17.5 22.7967 17.412 23.0867 17.2472 23.3334C17.0824 23.58 16.8481 23.7723 16.574 23.8858C16.2999 23.9994 15.9983 24.0291 15.7074 23.9712C15.4164 23.9133 15.1491 23.7704 14.9393 23.5607C14.7296 23.3509 14.5867 23.0836 14.5288 22.7926C14.4709 22.5017 14.5006 22.2001 14.6142 21.926C14.7277 21.6519 14.92 21.4176 15.1666 21.2528C15.4133 21.088 15.7033 21 16 21C16.3978 21 16.7794 21.158 17.0607 21.4393C17.342 21.7206 17.5 22.1022 17.5 22.5Z"
          fill="#9C1E28"
        />
      </g>
    </svg>
  )
}

export default function BlockUserModal({
  user,
  isOpen,
  onClose,
  onConfirm,
}: BlockUserModalProps) {
  const [reason, setReason] = useState('')
  const [sendNotification, setSendNotification] = useState(false)
  const [preventNewAccount, setPreventNewAccount] = useState(false)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (isOpen) {
      document.addEventListener('keydown', handleKeyDown)
    }
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose])

  if (!isOpen || !user) return null

  const handleConfirm = async () => {
    try {
      setLoading(true)
      await onConfirm(
        user,
        reason.trim() || undefined,
        sendNotification,
        preventNewAccount,
      )
      onClose()
    } catch (err) {
      console.error('Failed to block user:', err)
    } finally {
      setLoading(false)
    }
  }

  const displayName = user.name || user.email.split('@')[0] || 'المستخدم'
  const hasPlan =
    user.subscriptionPlan &&
    user.subscriptionPlan !== '—' &&
    user.subscriptionPlan !== 'العادية'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-['Cairo']">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container matching Figma Node 5634:70377 */}
      <div
        className="relative bg-white rounded-xl p-6 w-full max-w-125 shadow-2xl z-10 flex flex-col gap-8 items-center text-right animate-in fade-in zoom-in-95 duration-150"
        dir="rtl"
        data-node-id="5634:70377"
        data-name="banned user"
      >
        <div
          className="flex flex-col gap-6 items-center w-full"
          data-node-id="5634:70378"
        >
          {/* Header Icon & Texts */}
          <div
            className="flex flex-col gap-1 items-center justify-center w-full text-center"
            data-node-id="5634:70379"
            data-name="page title"
          >
            {/* Circular Badge */}
            <div
              className="bg-[#FFEBEB] rounded-full p-3 size-16 flex items-center justify-center shrink-0 mb-1"
              data-node-id="5634:70380"
            >
              <WarningTriangleIcon />
            </div>

            <div className="flex flex-col gap-2 items-center text-center w-full">
              <h3
                className="text-[18px] font-bold text-[#111111] leading-normal"
                data-node-id="5634:70383"
              >
                هل تريد حظر المستخدم؟
              </h3>
              <p
                className="text-[14px] font-normal text-[#6B6A6A] leading-normal tracking-[-0.408px] max-w-md"
                data-node-id="5634:70384"
              >
                {hasPlan
                  ? `هل أنت متأكد من حظر “${displayName}” ؟ هذا المستخدم لديه اشتراك “${user.subscriptionPlan}”. هل تريد الاستمرار في الحظر ؟`
                  : `هل أنت متأكد من حظر “${displayName}” ؟ لن يتمكن المستخدم من تسجيل الدخول أو استخدام المنصة حتى يتم رفع الحظر.`}
              </p>
            </div>
          </div>

          {/* Form Fields & Checkboxes */}
          <div
            className="flex flex-col gap-4 items-start w-full text-right"
            data-node-id="5634:70385"
          >
            {/* السبب (اختياري) */}
            <div className="flex flex-col gap-1.5 w-full">
              <label
                className="text-[14px] font-medium text-[#111111] tracking-[-0.408px]"
                data-node-id="I5634:70386;301:27756"
              >
                <span>السبب </span>
                <span className="text-[#6B6A6A] font-normal">(اختياري)</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="...سبب الحظر"
                rows={3}
                className="w-full h-29.75 p-3 bg-white border border-[#ECECEC] rounded-lg text-[14px] text-right text-[#111111] placeholder:text-[#979797] resize-none focus:outline-none focus:border-[#9C1E28] transition-colors"
              />
            </div>

            {/* Checkboxes */}
            <div className="flex flex-col gap-1.5 w-full">
              {/* ارسال اشعار للمستخدم عبر البريد الالكتروني */}
              <label
                className="flex items-center gap-2 py-1 cursor-pointer select-none group"
                data-node-id="5634:70388"
              >
                <input
                  type="checkbox"
                  checked={sendNotification}
                  onChange={(e) => setSendNotification(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`size-4 rounded-xs border flex items-center justify-center transition-colors shrink-0 ${
                    sendNotification
                      ? 'bg-primary border-primary text-white'
                      : 'border-[#D7D7D7] bg-white group-hover:border-[#94A3B8]'
                  }`}
                >
                  {sendNotification && <Check className="w-3 h-3 stroke-3" />}
                </div>
                <span
                  className="text-[14px] font-medium text-[#111111] tracking-[-0.408px]"
                  data-node-id="5634:70389"
                >
                  ارسال اشعار للمستخدم عبر البريد الالكتروني.
                </span>
              </label>

              {/* منع إنشاء حساب جديد بنفس البريد */}
              <label
                className="flex items-center gap-2 py-1 cursor-pointer select-none group"
                data-node-id="5634:70391"
              >
                <input
                  type="checkbox"
                  checked={preventNewAccount}
                  onChange={(e) => setPreventNewAccount(e.target.checked)}
                  className="sr-only"
                />
                <div
                  className={`size-4 rounded-xs border flex items-center justify-center transition-colors shrink-0 ${
                    preventNewAccount
                      ? 'bg-primary border-primary text-white'
                      : 'border-[#D7D7D7] bg-white group-hover:border-[#94A3B8]'
                  }`}
                >
                  {preventNewAccount && <Check className="w-3 h-3 stroke-3" />}
                </div>
                <span
                  className="text-[14px] font-medium text-[#111111] tracking-[-0.408px]"
                  data-node-id="5634:70392"
                >
                  منع إنشاء حساب جديد بنفس البريد.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons (Figma Node 5634:70394) */}
        <div
          className="flex gap-3 items-center justify-between w-full"
          data-node-id="5634:70394"
        >
          {/* Primary Button: حظر المستخدم */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 h-12 bg-[#9C1E28] hover:bg-[#7D161F] text-white font-semibold text-[14px] tracking-[0.28px] rounded-3xl transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            data-node-id="5634:70396"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري الحظر...</span>
              </>
            ) : (
              <span>حظر المستخدم</span>
            )}
          </button>

          {/* Secondary Button: إلغاء */}
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-11.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#111111] font-semibold text-[14px] tracking-[0.28px] rounded-3xl transition-colors cursor-pointer flex items-center justify-center"
            data-node-id="5634:70395"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}
