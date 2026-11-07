'use client'

import { useEffect, useState } from 'react'
import { X } from 'lucide-react'
import {
  AdminDiscountCode,
  DiscountCodeInput,
  DiscountPurpose,
  PURPOSE_LABELS,
} from '@/lib/admin-discount-codes'

interface DiscountCodeDrawerProps {
  open: boolean
  // null: a new code
  code: AdminDiscountCode | null
  onClose: () => void
  onSave: (data: DiscountCodeInput) => Promise<void>
}

const EMPTY: DiscountCodeInput = {
  code: '',
  type: 'PERCENT',
  value: 10,
  maxDiscount: null,
  minAmount: null,
  appliesTo: ['PLAN', 'SUBSCRIPTION', 'FEATURE'],
  startsAt: null,
  expiresAt: null,
  maxUses: null,
  onePerAccount: true,
  isActive: true,
}

const toDateInput = (iso: string | null) => (iso ? iso.slice(0, 10) : '')
const fromDateInput = (value: string, endOfDay = false) =>
  value ? new Date(`${value}T${endOfDay ? '23:59:59' : '00:00:00'}`).toISOString() : null
const numberOrNull = (value: string) => (value.trim() === '' ? null : Number(value))

const INPUT =
  'h-10 w-full rounded-xl border border-[#ECECEC] bg-white px-3 text-[14px] text-[#111111] outline-none focus:border-primary'
const LABEL = 'text-[13px] font-bold text-[#111111]'

/** Create or edit a discount code (أكواد الخصم). */
export default function DiscountCodeDrawer({
  open,
  code,
  onClose,
  onSave,
}: DiscountCodeDrawerProps) {
  const [form, setForm] = useState<DiscountCodeInput>(EMPTY)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!open) return
    setError(null)
    setForm(
      code
        ? {
            code: code.code,
            type: code.type,
            value: code.value,
            maxDiscount: code.maxDiscount,
            minAmount: code.minAmount,
            appliesTo: code.appliesTo,
            startsAt: code.startsAt,
            expiresAt: code.expiresAt,
            maxUses: code.maxUses,
            onePerAccount: code.onePerAccount,
            isActive: code.isActive,
          }
        : EMPTY,
    )
  }, [open, code])

  if (!open) return null

  const update = (patch: Partial<DiscountCodeInput>) =>
    setForm((prev) => ({ ...prev, ...patch }))

  const togglePurpose = (purpose: DiscountPurpose) =>
    update({
      appliesTo: form.appliesTo.includes(purpose)
        ? form.appliesTo.filter((p) => p !== purpose)
        : [...form.appliesTo, purpose],
    })

  const submit = async () => {
    if (!/^[A-Za-z0-9_-]{3,32}$/.test(form.code.trim())) {
      setError('الكود من 3 إلى 32 حرفاً إنجليزياً أو رقماً أو - أو _')
      return
    }
    if (!(form.value > 0)) {
      setError('أدخل قيمة الخصم')
      return
    }
    if (form.type === 'PERCENT' && form.value > 100) {
      setError('نسبة الخصم لا تتجاوز 100%')
      return
    }
    if (form.appliesTo.length === 0) {
      setError('اختر نوع شراء واحداً على الأقل')
      return
    }
    setSaving(true)
    setError(null)
    try {
      await onSave({ ...form, code: form.code.trim().toUpperCase() })
      onClose()
    } catch (e: unknown) {
      const message =
        (e as { response?: { data?: { message?: string | string[] } } })?.response?.data
          ?.message
      setError(
        Array.isArray(message) ? message[0] : message || 'تعذر حفظ الكود، حاول مرة أخرى',
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex" dir="rtl">
      <div className="flex-1 bg-black/40" onClick={onClose} />
      <div className="flex h-full w-full max-w-[460px] flex-col bg-white font-['Cairo'] text-right shadow-xl">
        <div className="flex items-center justify-between border-b border-[#ECECEC] p-5">
          <h2 className="text-[18px] font-bold text-[#111111]">
            {code ? `تعديل الكود ${code.code}` : 'إضافة كود خصم'}
          </h2>
          <button type="button" onClick={onClose} aria-label="إغلاق" className="cursor-pointer">
            <X className="h-5 w-5 text-[#6B6A6A]" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-5 overflow-y-auto p-5">
          <label className="flex flex-col gap-2">
            <span className={LABEL}>الكود</span>
            <input
              className={`${INPUT} font-mono uppercase`}
              dir="ltr"
              value={form.code}
              onChange={(e) => update({ code: e.target.value })}
              placeholder="WELCOME10"
            />
          </label>

          <div className="flex flex-col gap-2">
            <span className={LABEL}>نوع الخصم</span>
            <div className="flex gap-2">
              {(['PERCENT', 'FIXED'] as const).map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => update({ type, maxDiscount: type === 'FIXED' ? null : form.maxDiscount })}
                  className={`h-10 flex-1 cursor-pointer rounded-xl border text-[13px] font-bold ${
                    form.type === type
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-[#ECECEC] text-[#6B6A6A]'
                  }`}
                >
                  {type === 'PERCENT' ? 'نسبة مئوية %' : 'مبلغ ثابت د.ك'}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-2">
              <span className={LABEL}>{form.type === 'PERCENT' ? 'النسبة %' : 'المبلغ د.ك'}</span>
              <input
                type="number"
                min={0}
                step={form.type === 'PERCENT' ? 1 : 0.001}
                className={INPUT}
                value={form.value}
                onChange={(e) => update({ value: Number(e.target.value) })}
              />
            </label>
            {form.type === 'PERCENT' && (
              <label className="flex flex-col gap-2">
                <span className={LABEL}>أقصى خصم د.ك (اختياري)</span>
                <input
                  type="number"
                  min={0}
                  step={0.001}
                  className={INPUT}
                  value={form.maxDiscount ?? ''}
                  onChange={(e) => update({ maxDiscount: numberOrNull(e.target.value) })}
                />
              </label>
            )}
          </div>

          <div className="flex flex-col gap-2">
            <span className={LABEL}>يُستخدم في</span>
            <div className="flex flex-wrap gap-2">
              {(Object.keys(PURPOSE_LABELS) as DiscountPurpose[]).map((purpose) => (
                <button
                  key={purpose}
                  type="button"
                  onClick={() => togglePurpose(purpose)}
                  className={`h-9 cursor-pointer rounded-full border px-4 text-[13px] font-bold ${
                    form.appliesTo.includes(purpose)
                      ? 'border-primary bg-primary/5 text-primary'
                      : 'border-[#ECECEC] text-[#6B6A6A]'
                  }`}
                >
                  {PURPOSE_LABELS[purpose]}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-2">
              <span className={LABEL}>يبدأ (اختياري)</span>
              <input
                type="date"
                className={INPUT}
                value={toDateInput(form.startsAt)}
                onChange={(e) => update({ startsAt: fromDateInput(e.target.value) })}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className={LABEL}>ينتهي (اختياري)</span>
              <input
                type="date"
                className={INPUT}
                value={toDateInput(form.expiresAt)}
                onChange={(e) => update({ expiresAt: fromDateInput(e.target.value, true) })}
              />
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <label className="flex flex-col gap-2">
              <span className={LABEL}>عدد الاستخدامات (اختياري)</span>
              <input
                type="number"
                min={1}
                className={INPUT}
                value={form.maxUses ?? ''}
                placeholder="غير محدود"
                onChange={(e) => update({ maxUses: numberOrNull(e.target.value) })}
              />
            </label>
            <label className="flex flex-col gap-2">
              <span className={LABEL}>أقل مبلغ د.ك (اختياري)</span>
              <input
                type="number"
                min={0}
                step={0.001}
                className={INPUT}
                value={form.minAmount ?? ''}
                onChange={(e) => update({ minAmount: numberOrNull(e.target.value) })}
              />
            </label>
          </div>

          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.onePerAccount}
              onChange={(e) => update({ onePerAccount: e.target.checked })}
            />
            <span className="text-[14px] font-medium text-[#111111]">مرة واحدة لكل حساب</span>
          </label>
          <label className="flex cursor-pointer items-center gap-3">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(e) => update({ isActive: e.target.checked })}
            />
            <span className="text-[14px] font-medium text-[#111111]">فعّال</span>
          </label>

          {error && <p className="text-[13px] font-medium text-red-600">{error}</p>}
        </div>

        <div className="flex gap-3 border-t border-[#ECECEC] p-5">
          <button
            type="button"
            disabled={saving}
            onClick={() => void submit()}
            className="h-11 flex-1 cursor-pointer rounded-xl bg-primary text-[14px] font-bold text-white disabled:opacity-60"
          >
            {saving ? 'جارٍ الحفظ…' : 'حفظ'}
          </button>
          <button
            type="button"
            onClick={onClose}
            className="h-11 flex-1 cursor-pointer rounded-xl border border-[#ECECEC] text-[14px] font-bold text-[#111111]"
          >
            إلغاء
          </button>
        </div>
      </div>
    </div>
  )
}
