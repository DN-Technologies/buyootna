'use client'

import React, { useState } from 'react'
import { VerifyBadgeIcon } from '@/components/icons/AdminIcons'

export interface ConfirmVerificationModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (options: { notifyEmail: boolean; notifyInApp: boolean }) => void
  isLoading?: boolean
}

export default function ConfirmVerificationModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
}: ConfirmVerificationModalProps) {
  const [notifyEmail, setNotifyEmail] = useState(false)
  const [notifyInApp, setNotifyInApp] = useState(false)

  if (!isOpen) return null

  const handleConfirm = () => {
    onConfirm({ notifyEmail, notifyInApp })
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

      {/* Modal Card matching Figma node 2769:52235 */}
      <div
        className="relative bg-white rounded-xl p-6 w-125 max-w-[calc(100vw-32px)] shadow-2xl flex flex-col gap-8 items-center z-10 animate-in fade-in zoom-in-95 duration-200"
        data-node-id="2769:52235"
        data-name="verification popup"
      >
        <div
          className="flex flex-col gap-6 items-center w-full"
          data-node-id="2769:52236"
        >
          {/* Badge Icon & Headings matching Figma 2769:52237 */}
          <div
            className="flex flex-col gap-1 items-center justify-center w-full text-center"
            data-node-id="2769:52237"
            data-name="page title"
          >
            <div
              className="bg-[#F9FAFE] flex items-center justify-center rounded-full size-16 shrink-0 mb-2"
              data-node-id="2769:52238"
            >
              <div
                className="w-8 h-8.5 flex items-center justify-center"
                data-node-id="2769:52239"
                data-name="bitcoin-icons:verify-filled"
              >
                <VerifyBadgeIcon className="w-8 h-8.5" color="#1791E7" />
              </div>
            </div>

            <div
              className="flex flex-col gap-2 items-center justify-center text-center w-full"
              data-node-id="2769:52241"
            >
              <h3
                className="font-['Cairo'] font-bold text-[18px] text-[#111111] leading-normal"
                data-node-id="2769:52242"
              >
                تأكيد اعتماد التوثيق
              </h3>
              <p
                className="font-['Cairo'] font-normal text-[14px] text-[#6B6A6A] leading-normal tracking-[-0.408px]"
                data-node-id="2769:52243"
              >
                سيتم توثيق هذا الحساب وإظهار شارة التوثيق للمستخدم.
              </p>
            </div>
          </div>

          {/* Notification Options matching Figma 2769:52244 */}
          <div
            className="flex flex-col gap-3 items-start w-full text-right"
            data-node-id="2769:52244"
            data-name="Input"
          >
            <p
              className="font-['Cairo'] font-medium text-[14px] text-[#111111] leading-normal tracking-[-0.408px]"
              data-node-id="2769:52245"
            >
              ارسال اشعار للمستخدم عبر :
            </p>

            <div
              className="flex flex-col gap-1 items-start w-full"
              data-node-id="2769:52246"
            >
              {/* Email Notification matching Figma 2769:52247 */}
              <label
                onClick={() => setNotifyEmail(!notifyEmail)}
                className="flex items-center gap-2 py-1 cursor-pointer select-none group"
                data-node-id="2769:52247"
              >
                <div
                  className={`size-4 rounded-sm border flex items-center justify-center transition-colors ${
                    notifyEmail
                      ? 'bg-primary border-primary text-white'
                      : 'border-[#D7D7D7] bg-white group-hover:border-primary'
                  }`}
                  data-node-id="2769:52249"
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
                  data-node-id="2769:52248"
                >
                  البريد الالكتروني.
                </span>
              </label>

              {/* In-App Notification matching Figma 2769:52250 */}
              <label
                onClick={() => setNotifyInApp(!notifyInApp)}
                className="flex items-center gap-2 py-1 cursor-pointer select-none group"
                data-node-id="2769:52250"
              >
                <div
                  className={`size-4 rounded-sm border flex items-center justify-center transition-colors ${
                    notifyInApp
                      ? 'bg-primary border-primary text-white'
                      : 'border-[#D7D7D7] bg-white group-hover:border-primary'
                  }`}
                  data-node-id="2769:52252"
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
                  data-node-id="2769:52251"
                >
                  داخل التطبيق.
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Action Buttons matching Figma 2769:52253 */}
        <div
          className="flex items-center gap-3 w-full"
          data-node-id="2769:52253"
        >
          {/* Primary Action (Right in RTL): منح الشارة */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading}
            className="flex-1 h-12 bg-primary hover:bg-[#1E4368] text-white rounded-3xl font-['Cairo'] font-semibold text-[14px] flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            data-node-id="2769:52255"
          >
            {isLoading ? 'جاري الاعتماد...' : 'منح الشارة'}
          </button>

          {/* Secondary Action (Left in RTL): إلغاء */}
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-11.5 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#111111] rounded-3xl font-['Cairo'] font-semibold text-[14px] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            data-node-id="2769:52254"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}
