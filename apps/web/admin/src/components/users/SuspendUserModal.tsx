'use client'

import React, { useState, useEffect } from 'react'
import { Loader2 } from 'lucide-react'
import { UserRow } from './UserTable'

export interface SuspendUserModalProps {
  user: UserRow | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (
    user: UserRow,
    durationDays?: number,
    reason?: string,
  ) => Promise<void> | void
}

export function SuspendIcon({ className = 'size-8' }: { className?: string }) {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g id="lsicon:suspend-outline">
        <path
          id="Vector"
          d="M13 10V22M19 22V10M29 16C29 19.4478 27.6304 22.7544 25.1924 25.1924C22.7544 27.6304 19.4478 29 16 29C12.5522 29 9.24558 27.6304 6.80761 25.1924C4.36964 22.7544 3 19.4478 3 16C3 12.5522 4.36964 9.24558 6.80761 6.80761C9.24558 4.36964 12.5522 3 16 3C19.4478 3 22.7544 4.36964 25.1924 6.80761C27.6304 9.24558 29 12.5522 29 16Z"
          stroke="#B97500"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      </g>
    </svg>
  )
}

export function CaretUpDownIcon({
  className = 'size-5',
}: {
  className?: string
}) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <g id="CaretUpDown">
        <path
          id="Vector"
          d="M14.1922 13.3078C14.2503 13.3659 14.2964 13.4348 14.3279 13.5107C14.3593 13.5865 14.3755 13.6679 14.3755 13.75C14.3755 13.8321 14.3593 13.9135 14.3279 13.9893C14.2964 14.0652 14.2503 14.1341 14.1922 14.1922L10.4422 17.9422C10.3841 18.0003 10.3152 18.0464 10.2393 18.0778C10.1635 18.1093 10.0821 18.1255 10 18.1255C9.91787 18.1255 9.83654 18.1093 9.76066 18.0778C9.68479 18.0464 9.61586 18.0003 9.55781 17.9422L5.80781 14.1922C5.69054 14.0749 5.62465 13.9159 5.62465 13.75C5.62465 13.5841 5.69054 13.4251 5.80781 13.3078C5.92509 13.1905 6.08415 13.1247 6.25 13.1247C6.41585 13.1247 6.57491 13.1905 6.69219 13.3078L10 16.6164L13.3078 13.3078C13.3659 13.2497 13.4348 13.2036 13.5107 13.1721C13.5865 13.1407 13.6679 13.1245 13.75 13.1245C13.8321 13.1245 13.9135 13.1407 13.9893 13.1721C14.0652 13.2036 14.1341 13.2497 14.1922 13.3078ZM6.69219 6.69219L10 3.38359L13.3078 6.69219C13.4251 6.80946 13.5841 6.87535 13.75 6.87535C13.9159 6.87535 14.0749 6.80946 14.1922 6.69219C14.3095 6.57491 14.3753 6.41585 14.3753 6.25C14.3753 6.08415 14.3095 5.92509 14.1922 5.80781L10.4422 2.05781C10.3841 1.9997 10.3152 1.9536 10.2393 1.92215C10.1635 1.8907 10.0821 1.87451 10 1.87451C9.91787 1.87451 9.83654 1.8907 9.76066 1.92215C9.68479 1.9536 9.61586 1.9997 9.55781 2.05781L5.80781 5.80781C5.69054 5.92509 5.62465 6.08415 5.62465 6.25C5.62465 6.41585 5.69054 6.57491 5.80781 6.69219C5.92509 6.80946 6.08415 6.87535 6.25 6.87535C6.41585 6.87535 6.57491 6.80946 6.69219 6.69219Z"
          fill="#121414"
        />
      </g>
    </svg>
  )
}

export default function SuspendUserModal({
  user,
  isOpen,
  onClose,
  onConfirm,
}: SuspendUserModalProps) {
  const [duration, setDuration] = useState('7')
  const [reason, setReason] = useState('')
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
      await onConfirm(user, Number(duration) || undefined, reason.trim() || undefined)
      onClose()
    } catch (err) {
      console.error('Failed to suspend user:', err)
    } finally {
      setLoading(false)
    }
  }

  const displayName = user.name || user.email.split('@')[0] || 'المستخدم'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 font-['Cairo']">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Modal Container matching Figma Node 5634:70346 */}
      <div
        className="relative bg-white rounded-[12px] p-6 w-full max-w-[500px] shadow-2xl z-10 flex flex-col gap-8 items-center text-right animate-in fade-in zoom-in-95 duration-150"
        dir="rtl"
        data-node-id="5634:70346"
        data-name="deactivate popup"
      >
        <div
          className="flex flex-col gap-6 items-center w-full"
          data-node-id="5634:70347"
        >
          {/* Header Icon & Texts */}
          <div
            className="flex flex-col gap-1 items-center justify-center w-full text-center"
            data-node-id="5634:70348"
            data-name="page title"
          >
            {/* Circular Badge */}
            <div
              className="bg-[#FFFEFA] border border-[#FFF3D6] rounded-full p-3 size-16 flex items-center justify-center shrink-0 mb-1"
              data-node-id="5634:70349"
            >
              <SuspendIcon />
            </div>

            <div className="flex flex-col gap-2 items-center text-center w-full">
              <h3
                className="text-[18px] font-bold text-[#111111] leading-normal"
                data-node-id="5634:70352"
              >
                هل تريد تعطيل هذا الحساب؟
              </h3>
              <p
                className="text-[14px] font-normal text-[#6B6A6A] leading-[1.5] tracking-[-0.408px] max-w-[448px]"
                data-node-id="5634:70353"
              >
                هل أنت متأكد من إيقاف حساب “{displayName}” ؟ لن يتمكن المستخدم من تسجيل الدخول أو استخدام المنصة حتى يتم إعادة تفعيل الحساب.
              </p>
            </div>
          </div>

          {/* Form Fields */}
          <div
            className="flex flex-col gap-4 items-start w-full text-right"
            data-node-id="5634:70354"
          >
            {/* مدة التعطيل */}
            <div className="flex flex-col gap-1.5 w-full">
              <label
                className="text-[14px] font-medium text-[#111111] tracking-[-0.408px]"
                data-node-id="5634:70359"
              >
                مدة التعطيل
              </label>
              <div className="relative w-full">
                <select
                  value={duration}
                  onChange={(e) => setDuration(e.target.value)}
                  className="w-full h-[46px] px-3 bg-white border border-[#ECECEC] rounded-[8px] text-[14px] text-right text-[#111111] appearance-none focus:outline-none focus:border-[#B97500] cursor-pointer transition-colors"
                >
                  <option value="3">3 أيام</option>
                  <option value="7">7 أيام</option>
                  <option value="14">14 يوم</option>
                  <option value="30">30 يوم</option>
                  <option value="90">90 يوم</option>
                  <option value="0">دائم / حتى إشعار آخر</option>
                </select>
                <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none text-[#121414]">
                  <CaretUpDownIcon />
                </div>
              </div>
            </div>

            {/* السبب (اختياري) */}
            <div className="flex flex-col gap-1.5 w-full">
              <label
                className="text-[14px] font-medium text-[#111111] tracking-[-0.408px]"
                data-node-id="I5634:70372;301:27756"
              >
                <span>السبب </span>
                <span className="text-[#6B6A6A] font-normal">(اختياري)</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="...سبب التعطيل"
                rows={3}
                className="w-full h-[119px] p-3 bg-white border border-[#ECECEC] rounded-[8px] text-[14px] text-right text-[#111111] placeholder:text-[#979797] resize-none focus:outline-none focus:border-[#B97500] transition-colors"
              />
            </div>

            {/* Warning Note */}
            <p
              className="text-[13px] font-normal text-[#B97500] leading-[1.5] tracking-[-0.408px] w-full"
              data-node-id="5634:70373"
            >
              سيؤدي هذا الإجراء إلى حجب وصول المستخدم الى حسابه مع الاحتفاظ بكامل بياناته واعلاناته وإمكانية إعادة تفعيل الحساب لاحقاً.
            </p>
          </div>
        </div>

        {/* Action Buttons (Figma Node 5634:70374) */}
        <div
          className="flex gap-3 items-center justify-between w-full"
          data-node-id="5634:70374"
        >
          {/* Primary Button: تعطيل الحساب */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 h-[48px] bg-[#B97500] hover:bg-[#A06200] text-white font-semibold text-[14px] tracking-[0.28px] rounded-[24px] transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            data-node-id="5634:70376"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري التعطيل...</span>
              </>
            ) : (
              <span>تعطيل الحساب</span>
            )}
          </button>

          {/* Secondary Button: إلغاء */}
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-[46px] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#111111] font-semibold text-[14px] tracking-[0.28px] rounded-[24px] transition-colors cursor-pointer flex items-center justify-center"
            data-node-id="5634:70375"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}
