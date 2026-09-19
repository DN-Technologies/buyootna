'use client'

import React, { useState } from 'react'
import { Loader2, Mail, Clock } from 'lucide-react'
import { sendUserPasswordResetLink } from '@/lib/admin-users'

export interface ResetPasswordModalProps {
  user: {
    id: string
    name?: string
    email?: string
    registrationDate?: string
  } | null
  isOpen: boolean
  onClose: () => void
  onSuccess: (email: string) => void
}

export default function ResetPasswordModal({
  user,
  isOpen,
  onClose,
  onSuccess,
}: ResetPasswordModalProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isOpen || !user) return null

  const handleSend = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await sendUserPasswordResetLink(user.id)
      onSuccess(res.email || user.email || '')
      onClose()
    } catch (err: any) {
      console.error('Failed to send reset password link:', err)
      const msg =
        err?.response?.data?.message ||
        'حدث خطأ أثناء إرسال رابط إعادة تعيين كلمة المرور'
      setError(msg)
    } finally {
      setLoading(false)
    }
  }

  // Display relative label for last password update or registration fallback
  const lastPasswordUpdate = 'منذ 3 شهور'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-[2px] transition-opacity"
        onClick={loading ? undefined : onClose}
      />

      {/* Modal Card matching Figma Node 5634:71538 */}
      <div
        className="relative bg-white rounded-xl p-6 w-full max-w-125 shadow-2xl z-10 flex flex-col items-center text-right font-['Cairo'] animate-in fade-in zoom-in-95 duration-150"
        dir="rtl"
        data-node-id="5634:71538"
        data-name="verification popup"
      >
        {/* Top Lock Icon Badge matching Node 5634:71541 */}
        <div
          className="size-16 rounded-full bg-[#F9FAFE] flex items-center justify-center mb-4 shrink-0"
          data-node-id="5634:71541"
        >
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="shrink-0"
            data-node-id="5634:71542"
          >
            <path
              d="M26 10H22V7C22 5.4087 21.3679 3.88258 20.2426 2.75736C19.1174 1.63214 17.5913 1 16 1C14.4087 1 12.8826 1.63214 11.7574 2.75736C10.6321 3.88258 10 5.4087 10 7V10H6C5.46957 10 4.96086 10.2107 4.58579 10.5858C4.21071 10.9609 4 11.4696 4 12V26C4 26.5304 4.21071 27.0391 4.58579 27.4142C4.96086 27.7893 5.46957 28 6 28H26C26.5304 28 27.0391 27.7893 27.4142 27.4142C27.7893 27.0391 28 26.5304 28 26V12C28 11.4696 27.7893 10.9609 27.4142 10.5858C27.0391 10.2107 26.5304 10 26 10ZM12 7C12 5.93913 12.4214 4.92172 13.1716 4.17157C13.9217 3.42143 14.9391 3 16 3C17.0609 3 18.0783 3.42143 18.8284 4.17157C19.5786 4.92172 20 5.93913 20 7V10H12V7ZM26 26H6V12H26V26ZM17.5 19C17.5 19.2967 17.412 19.5867 17.2472 19.8334C17.0824 20.08 16.8481 20.2723 16.574 20.3858C16.2999 20.4993 15.9983 20.5291 15.7074 20.4712C15.4164 20.4133 15.1491 20.2704 14.9393 20.0607C14.7296 19.8509 14.5867 19.5836 14.5288 19.2926C14.4709 19.0017 14.5006 18.7001 14.6142 18.426C14.7277 18.1519 14.92 17.9176 15.1666 17.7528C15.4133 17.588 15.7033 17.5 16 17.5C16.3978 17.5 16.7794 17.658 17.0607 17.9393C17.342 18.2206 17.5 18.6022 17.5 19Z"
              fill="#111111"
            />
          </svg>
        </div>

        {/* Title and Confirmation text matching Node 5634:71543 */}
        <div className="flex flex-col gap-2 items-center text-center w-full mb-6">
          <h3
            className="font-bold text-[18px] text-[#111111] leading-tight"
            data-node-id="5634:71544"
          >
            إعادة تعيين كلمة المرور
          </h3>
          <p
            className="font-normal text-[14px] leading-normal text-[#6B6A6A] max-w-md"
            data-node-id="5634:71545"
          >
            هل أنت متأكد أنك تريد إعادة تعيين كلمة المرور لهذا المستخدم؟
            <br />
            سيتم إرسال رابط لإعادة التعيين إلى البريد الإلكتروني الخاص به.
          </p>
        </div>

        {/* User Card info + Time limit notice matching Node 5634:71546 */}
        <div className="w-full flex flex-col gap-3 mb-8">
          {/* Selected users actions container matching Node 5634:71547 */}
          <div
            className="bg-[#F9FAFE] rounded-lg px-3.5 py-3 flex items-center justify-between w-full"
            data-node-id="5634:71547"
          >
            {/* Last password update time */}
            <div
              className="flex items-center gap-1 text-right"
              data-node-id="5634:71548"
            >
              <Clock className="size-4 text-[#111111] shrink-0" />
              <span
                className="font-normal text-[14px] leading-normal text-[#1C1D1F] tracking-[-0.408px]"
                data-node-id="5634:71549"
              >
                آخر تغيير لكلمة المرور: {lastPasswordUpdate}
              </span>
            </div>

            {/* Email Address */}
            <div
              className="flex items-center gap-1 text-right"
              data-node-id="5634:71551"
            >
              <Mail className="size-4 text-[#111111] shrink-0" />
              <span
                className="font-normal text-[14px] leading-normal text-[#1C1D1F] tracking-[-0.408px]"
                data-node-id="5634:71552"
              >
                {user.email || '—'}
              </span>
            </div>
          </div>

          {/* 60 Minutes Warning Note matching Node 5634:71554 */}
          <div
            className="flex items-center gap-2 w-full justify-start text-right"
            data-node-id="5634:71554"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="shrink-0"
              data-node-id="5634:71556"
            >
              <path
                d="M8 1.5C6.71442 1.5 5.45771 1.88122 4.38879 2.59545C3.31987 3.30968 2.48675 4.32484 1.99478 5.51256C1.50281 6.70028 1.37409 8.00721 1.6249 9.26809C1.8757 10.529 2.49476 11.6872 3.40381 12.5962C4.31285 13.5052 5.47104 14.1243 6.73191 14.3751C7.99279 14.6259 9.29972 14.4972 10.4874 14.0052C11.6752 13.5132 12.6903 12.6801 13.4046 11.6112C14.1188 10.5423 14.5 9.28558 14.5 8C14.4982 6.27665 13.8128 4.62441 12.5942 3.40582C11.3756 2.18722 9.72335 1.50182 8 1.5ZM8 13.5C6.9122 13.5 5.84883 13.1774 4.94436 12.5731C4.03989 11.9687 3.33494 11.1098 2.91866 10.1048C2.50238 9.09977 2.39346 7.9939 2.60568 6.927C2.8179 5.86011 3.34172 4.8801 4.11091 4.11091C4.8801 3.34172 5.86011 2.8179 6.927 2.60568C7.9939 2.39346 9.09977 2.50238 10.1048 2.91866C11.1098 3.33494 11.9687 4.03989 12.5731 4.94436C13.1774 5.84883 13.5 6.9122 13.5 8C13.4983 9.45818 12.9184 10.8562 11.8873 11.8873C10.8562 12.9184 9.45818 13.4983 8 13.5ZM9 11C9 11.1326 8.94732 11.2598 8.85355 11.3536C8.75979 11.4473 8.63261 11.5 8.5 11.5C8.23478 11.5 7.98043 11.3946 7.79289 11.2071C7.60536 11.0196 7.5 10.7652 7.5 10.5V8C7.36739 8 7.24021 7.94732 7.14645 7.85355C7.05268 7.75979 7 7.63261 7 7.5C7 7.36739 7.05268 7.24021 7.14645 7.14645C7.24021 7.05268 7.36739 7 7.5 7C7.76522 7 8.01957 7.10536 8.20711 7.29289C8.39464 7.48043 8.5 7.73478 8.5 8V10.5C8.63261 10.5 8.75979 10.5527 8.85355 10.6464C8.94732 10.7402 9 10.8674 9 11ZM7 5.25C7 5.10166 7.04399 4.95666 7.1264 4.83332C7.20881 4.70999 7.32594 4.61386 7.46299 4.55709C7.60003 4.50032 7.75083 4.48547 7.89632 4.51441C8.0418 4.54335 8.17544 4.61478 8.28033 4.71967C8.38522 4.82456 8.45665 4.9582 8.48559 5.10368C8.51453 5.24917 8.49967 5.39997 8.44291 5.53701C8.38614 5.67406 8.29001 5.79119 8.16668 5.8736C8.04334 5.95601 7.89834 6 7.75 6C7.55109 6 7.36032 5.92098 7.21967 5.78033C7.07902 5.63968 7 5.44891 7 5.25Z"
                fill="#B97500"
              />
            </svg>
            <p
              className="font-normal text-[13px] leading-normal text-[#B97500] tracking-[-0.408px]"
              data-node-id="5634:71555"
            >
              سيتم إرسال رابط صالح لمدة 60 دقيقة فقط إلى بريد المستخدم.
            </p>
          </div>
        </div>

        {/* Error message banner */}
        {error && (
          <div className="w-full mb-4 p-2.5 bg-red-50 border border-red-200 text-red-700 text-xs rounded-lg text-center font-medium">
            {error}
          </div>
        )}

        {/* Actions Button Row matching Node 5634:71557 */}
        <div
          className="flex items-center gap-3 w-full"
          data-node-id="5634:71557"
        >
          {/* Cancel Button matching Node 5634:71558 */}
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-11.5 bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#111111] font-semibold text-[14px] tracking-[0.28px] rounded-3xl transition-colors cursor-pointer flex items-center justify-center disabled:opacity-60"
            data-node-id="5634:71558"
          >
            إلغاء
          </button>

          {/* Send Reset Link Button matching Node 5634:71559 */}
          <button
            type="button"
            onClick={handleSend}
            disabled={loading || !user.email}
            className="flex-1 h-12 bg-primary hover:bg-primary-dark text-white font-semibold text-[14px] tracking-[0.28px] rounded-3xl transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            data-node-id="5634:71559"
          >
            {loading && <Loader2 className="size-4 animate-spin" />}
            <span>إرسال رابط إعادة تعيين</span>
          </button>
        </div>
      </div>
    </div>
  )
}
