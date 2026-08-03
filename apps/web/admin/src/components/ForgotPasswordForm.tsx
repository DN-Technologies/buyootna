'use client'

import { useState } from 'react'
import { Lock, Loader2 } from 'lucide-react'

interface ForgotPasswordFormProps {
  onSubmit: (identifier: string) => Promise<void>
  onBackToLogin: () => void
}

export function ForgotPasswordForm({
  onSubmit,
  onBackToLogin,
}: ForgotPasswordFormProps) {
  const [identifier, setIdentifier] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier.trim()) {
      setError('يرجى إدخال البريد الإلكتروني أو رقم الهاتف')
      return
    }

    try {
      setError(null)
      setLoading(true)
      await onSubmit(identifier)
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'تعذر إرسال رمز التحقق. يرجى التأكد من صحة البيانات.',
      )
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-130 flex flex-col">
      {/* ── Lock Icon ── */}
      <div className="mb-6 flex">
        <Lock className="w-8 h-8 text-[#111111]" />
      </div>

      {/* ── Title & Subtitle ── */}
      <div className="w-full flex flex-col gap-5 text-right mb-16">
        <h1 className="text-2xl font-bold leading-snug text-[#111111] font-sans">
          هل نسيت كلمة المرور ؟
        </h1>
        <p className="text-[15px] font-semibold leading-6 tracking-[0.3px] text-[#6B6A6A]">
          أدخل البريد الإلكتروني أو رقم الهاتف المرتبط بحسابك وسنرسل لك رمز
          تحقق عبر الرسائل النصية.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-15.5">
        <div className="w-full flex flex-col gap-6">
          {error && (
            <div className="w-full rounded-lg bg-red-50 p-3.5 text-right text-sm text-red-600 border border-red-200">
              {error}
            </div>
          )}

          {/* Field: Identifier */}
          <div className="w-full flex flex-col gap-2.5 text-right">
            <label className="text-[14px] font-semibold text-[#111111]">
              البريد الإلكتروني أو رقم الهاتف
            </label>
            <input
              type="text"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="alisalem@gmail.com"
              dir="auto"
              className="w-full h-11.5 rounded-lg border border-[#ECECEC] bg-white px-3.5 text-[14px] text-[#111111] placeholder:text-[#979797] focus:border-primary focus:outline-none transition-colors text-right"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 flex items-center justify-center rounded-full bg-primary px-5 text-[14px] font-bold text-white shadow-sm hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-all"
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              'ارسال الرمز'
            )}
          </button>

          <button
            type="button"
            onClick={onBackToLogin}
            className="w-full h-12 flex items-center justify-center rounded-full text-primary text-[14px] font-bold hover:underline transition-all"
          >
            العودة الى تسجيل الدخول
          </button>
        </div>
      </form>
    </div>
  )
}
