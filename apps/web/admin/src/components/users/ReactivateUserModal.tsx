'use client'

import React, { useState, useEffect } from 'react'
import { Check, Loader2 } from 'lucide-react'
import { UserRow } from './UserTable'
import { SuspendIcon } from './SuspendUserModal'

export interface ReactivateUserModalProps {
  user: UserRow | null
  isOpen: boolean
  onClose: () => void
  onConfirm: (user: UserRow, sendNotification: boolean) => Promise<void> | void
}

export default function ReactivateUserModal({
  user,
  isOpen,
  onClose,
  onConfirm,
}: ReactivateUserModalProps) {
  const [sendNotification, setSendNotification] = useState(true)
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
      await onConfirm(user, sendNotification)
      onClose()
    } catch (err) {
      console.error('Failed to reactivate user:', err)
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

      {/* Modal Container matching Figma Node 5634:70397 */}
      <div
        className="relative bg-white rounded-[12px] px-8 py-6 w-full max-w-[500px] shadow-2xl z-10 flex flex-col gap-8 items-center text-right animate-in fade-in zoom-in-95 duration-150"
        dir="rtl"
        data-node-id="5634:70397"
        data-name="account activation popup"
      >
        <div
          className="flex flex-col gap-6 items-center w-full"
          data-node-id="5634:70398"
        >
          {/* Header Icon & Texts */}
          <div
            className="flex flex-col gap-1 items-center justify-center w-full text-center"
            data-node-id="5634:70399"
            data-name="page title"
          >
            {/* Circular Badge */}
            <div
              className="bg-[#FFFEFA] border border-[#FFF3D6] rounded-full p-3 size-16 flex items-center justify-center shrink-0 mb-1"
              data-node-id="5634:70400"
            >
              <SuspendIcon />
            </div>

            <div className="flex flex-col gap-2 items-center text-center w-full">
              <h3
                className="text-[18px] font-bold text-[#111111] leading-normal"
                data-node-id="5634:70403"
              >
                إعادة تفعيل الحساب
              </h3>
              <p
                className="text-[14px] font-normal text-[#6B6A6A] leading-[1.5] tracking-[-0.408px] max-w-[448px]"
                data-node-id="5634:70404"
              >
                هل تريد إعادة تفعيل “{displayName}” ؟ سيتمكن المستخدم من تسجيل الدخول واستخدام جميع الخدمات مرة أخرى.
              </p>
            </div>
          </div>

          {/* Checkbox Section */}
          <div
            className="flex flex-col items-start w-full text-right"
            data-node-id="5634:70405"
          >
            <label
              className="flex items-center gap-2 py-1 cursor-pointer select-none group"
              data-node-id="5634:70406"
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
                    ? 'bg-[#15304D] border-[#15304D] text-white'
                    : 'border-[#D7D7D7] bg-white group-hover:border-[#94A3B8]'
                }`}
              >
                {sendNotification && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
              <span
                className="text-[14px] font-medium text-[#111111] tracking-[-0.408px]"
                data-node-id="5634:70407"
              >
                ارسال اشعار للمستخدم عبر البريد الالكتروني.
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons (Figma Node 5634:70409) */}
        <div
          className="flex gap-3 items-center justify-between w-full"
          data-node-id="5634:70409"
        >
          {/* Primary Button: إعادة التفعيل */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 h-[48px] bg-[#15304D] hover:bg-[#1E4268] text-white font-semibold text-[14px] tracking-[0.28px] rounded-[24px] transition-colors cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60"
            data-node-id="5634:70411"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>جاري التفعيل...</span>
              </>
            ) : (
              <span>إعادة التفعيل</span>
            )}
          </button>

          {/* Secondary Button: إلغاء */}
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="flex-1 h-[46px] bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#111111] font-semibold text-[14px] tracking-[0.28px] rounded-[24px] transition-colors cursor-pointer flex items-center justify-center"
            data-node-id="5634:70410"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}
