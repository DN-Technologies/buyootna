'use client'

import React, { useState, useEffect } from 'react'
import type {
  VerificationIssueField,
  VerificationIssues,
} from '@/lib/admin-dashboard'

export interface RequestEditOptions {
  notes: string
  issues?: VerificationIssues
  notifyEmail: boolean
  notifyInApp: boolean
}

export interface RequestEditModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: (options: RequestEditOptions) => void
  isLoading?: boolean
  // A company's «طلب التوثيق»: pick the fields to fix, a reason each
  withFields?: boolean
}

// The company sees each reason under that field («استكمال البيانات»)
const FIELDS: { key: VerificationIssueField; label: string; hint: string }[] = [
  {
    key: 'licenseFile',
    label: 'صورة الرخصة',
    hint: 'صورة الرخصة غير واضحة، يرجى رفعها مرة اخرى.',
  },
  {
    key: 'licenseNumber',
    label: 'رقم الرخصة',
    hint: 'غير مطابق لصورة الرخصة، يرجى ادخاله مرة اخرى.',
  },
  {
    key: 'licenseActivity',
    label: 'النشاط',
    hint: 'النشاط غير مطابق للرخصة، يرجى اختياره مرة اخرى.',
  },
  {
    key: 'licenseExpiry',
    label: 'تاريخ الانتهاء',
    hint: 'تاريخ الانتهاء غير مطابق للرخصة، يرجى اختياره مرة اخرى.',
  },
]

export default function RequestEditModal({
  isOpen,
  onClose,
  onConfirm,
  isLoading = false,
  withFields = false,
}: RequestEditModalProps) {
  const [notes, setNotes] = useState('')
  const [issues, setIssues] = useState<VerificationIssues>({})
  const [notifyEmail, setNotifyEmail] = useState(false)
  const [notifyInApp, setNotifyInApp] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setNotes('')
      setIssues({})
      setNotifyEmail(false)
      setNotifyInApp(false)
    }
  }, [isOpen])

  if (!isOpen) return null

  const picked = FIELDS.filter((field) => field.key in issues)
  // Each picked field needs its reason; a note alone also works
  const canSend =
    picked.every((field) => issues[field.key]?.trim()) &&
    (picked.length > 0 || notes.trim().length > 0)

  const toggleField = (key: VerificationIssueField, hint: string) =>
    setIssues((prev) => {
      const next = { ...prev }
      if (key in next) delete next[key]
      else next[key] = hint
      return next
    })

  const handleConfirm = () => {
    onConfirm({
      notes,
      issues: picked.length ? issues : undefined,
      notifyEmail,
      notifyInApp,
    })
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

      {/* Modal Card matching Figma node 2804:65078 */}
      <div
        className="relative bg-white rounded-xl pb-6 pt-7 px-6 w-125 max-w-[calc(100vw-32px)] shadow-2xl flex flex-col gap-8 items-center z-10 animate-in fade-in zoom-in-95 duration-200"
        data-node-id="2804:65078"
        data-name="request edit popup"
      >
        <div
          className="flex flex-col gap-6 items-center w-full"
          data-node-id="2804:65079"
        >
          {/* Header Title & Description matching Figma 2804:65080 */}
          <div
            className="flex flex-col gap-2 items-center justify-center w-full text-center"
            data-node-id="2804:65080"
            data-name="page title"
          >
            <h3
              className="font-['Cairo'] font-bold text-[18px] text-[#111111] leading-normal"
              data-node-id="2804:65085"
            >
              طلب تعديل بيانات التوثيق
            </h3>
            <p
              className="font-['Cairo'] font-normal text-[14px] text-[#6B6A6A] leading-normal tracking-[-0.408px]"
              data-node-id="2804:65086"
            >
              سيتم إبلاغ صاحب الحساب بالملاحظات المطلوبة، وسيتمكن من إعادة رفع
              بيانات التوثيق بعد إجراء التعديلات.
            </p>
          </div>

          {/* Form Fields matching Figma 2804:65087 */}
          <div
            className="flex flex-col gap-4 items-start w-full text-right"
            data-node-id="2804:65087"
          >
            {withFields ? (
              <div className="flex flex-col gap-2 items-start w-full">
                <p className="font-['Cairo'] font-medium text-[14px] text-[#111111]">
                  البيانات المطلوب تعديلها
                </p>
                {FIELDS.map((field) => {
                  const checked = field.key in issues
                  return (
                    <div key={field.key} className="flex flex-col gap-1.5 w-full">
                      <label className="flex items-center gap-2 py-1 cursor-pointer select-none">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => toggleField(field.key, field.hint)}
                          className="size-4 accent-primary cursor-pointer"
                          data-testid={`issue-${field.key}`}
                        />
                        <span className="font-['Cairo'] font-medium text-[14px] text-[#111111]">
                          {field.label}
                        </span>
                      </label>
                      {checked ? (
                        <input
                          type="text"
                          value={issues[field.key] ?? ''}
                          onChange={(e) =>
                            setIssues((prev) => ({
                              ...prev,
                              [field.key]: e.target.value,
                            }))
                          }
                          placeholder="سبب التعديل"
                          className="w-full bg-white border border-[#ECECEC] rounded-lg px-3.5 py-2 text-right font-['Cairo'] text-[13px] text-[#9C1E28] placeholder:text-[#979797] focus:outline-none focus:border-primary"
                        />
                      ) : null}
                    </div>
                  )
                })}
              </div>
            ) : null}

            {/* Notes / Problem Type matching Figma 2804:65088 */}
            <div
              className="flex flex-col gap-2 items-start w-full"
              data-node-id="2804:65088"
              data-name="Component 39"
            >
              <label
                className="font-['Cairo'] font-medium text-[14px] text-[#111111]"
                data-node-id="I2804:65088;301:27756"
              >
                {withFields ? 'ملاحظة عامة (اختياري)' : 'نوع المشكلة'}
              </label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="اكتب الملاحظات أو التعديلات المطلوبة..."
                rows={3}
                className="w-full bg-white border border-[#ECECEC] rounded-lg px-3.5 py-3 text-right font-['Cairo'] text-[14px] text-[#111111] placeholder:text-[#979797] focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition resize-none"
                data-node-id="I2804:65088;301:27384"
              />
            </div>

            {/* Notification Channels matching Figma 2804:65089 */}
            <div
              className="flex flex-col gap-3 items-start w-full"
              data-node-id="2804:65089"
              data-name="Input"
            >
              <p
                className="font-['Cairo'] font-medium text-[14px] text-[#111111] leading-normal tracking-[-0.408px]"
                data-node-id="2804:65090"
              >
                ارسال اشعار للمستخدم عبر :
              </p>

              <div
                className="flex flex-col gap-1 items-start w-full"
                data-node-id="2804:65091"
              >
                {/* Email Checkbox matching Figma 2804:65092 */}
                <label
                  onClick={() => setNotifyEmail(!notifyEmail)}
                  className="flex items-center gap-2 py-1 cursor-pointer select-none group"
                  data-node-id="2804:65092"
                >
                  <div
                    className={`size-4 rounded-sm border flex items-center justify-center transition-colors ${
                      notifyEmail
                        ? 'bg-primary border-primary text-white'
                        : 'border-[#D7D7D7] bg-white group-hover:border-primary'
                    }`}
                    data-node-id="2804:65094"
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
                    data-node-id="2804:65093"
                  >
                    البريد الالكتروني.
                  </span>
                </label>

                {/* In-App Checkbox matching Figma 2804:65095 */}
                <label
                  onClick={() => setNotifyInApp(!notifyInApp)}
                  className="flex items-center gap-2 py-1 cursor-pointer select-none group"
                  data-node-id="2804:65095"
                >
                  <div
                    className={`size-4 rounded-sm border flex items-center justify-center transition-colors ${
                      notifyInApp
                        ? 'bg-primary border-primary text-white'
                        : 'border-[#D7D7D7] bg-white group-hover:border-primary'
                    }`}
                    data-node-id="2804:65097"
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
                    data-node-id="2804:65096"
                  >
                    داخل التطبيق.
                  </span>
                </label>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons matching Figma 2804:65098 */}
        <div
          className="flex items-center gap-3 w-full"
          data-node-id="2804:65098"
        >
          {/* Primary Action (Right in RTL): إرسال طلب التعديل */}
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isLoading || !canSend}
            className="flex-1 h-12 bg-primary hover:bg-[#1E4368] text-white rounded-3xl font-['Cairo'] font-semibold text-[14px] tracking-[0.28px] flex items-center justify-center transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            data-node-id="2804:65100"
          >
            {isLoading ? 'جاري الإرسال...' : 'إرسال طلب التعديل'}
          </button>

          {/* Secondary Action (Left in RTL): إلغاء */}
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 h-11.5 bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#111111] rounded-3xl font-['Cairo'] font-semibold text-[14px] tracking-[0.28px] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
            data-node-id="2804:65099"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}
