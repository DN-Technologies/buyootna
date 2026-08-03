'use client'

import { useState } from 'react'
import { Lock, Loader2 } from 'lucide-react'

interface VerifyOtpFormProps {
  identifier: string
  onSubmit: (otp: string) => Promise<void>
  onResend: () => Promise<void>
  onBackToLogin: () => void
}

export function VerifyOtpForm({
  identifier,
  onSubmit,
  onResend,
  onBackToLogin,
}: VerifyOtpFormProps) {
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [resendMessage, setResendMessage] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (otp.trim().length !== 6) {
      setError('يرجى إدخال رمز التحقق المكون من 6 أرقام')
      return
    }

    try {
      setError(null)
      setLoading(true)
      await onSubmit(otp)
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'رمز التحقق غير صحيح أو منتهي الصلاحية.',
      )
      setLoading(false)
    }
  }

  const handleResend = async () => {
    try {
      setError(null)
      setResendMessage(null)
      setResending(true)
      await onResend()
      setResendMessage('تم إرسال رمز تحقق جديد')
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'تعذر إعادة إرسال الرمز. يرجى المحاولة مرة أخرى.',
      )
    } finally {
      setResending(false)
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
          التحقق من الرمز
        </h1>
        <p className="text-[15px] font-semibold leading-6 tracking-[0.3px] text-[#6B6A6A]">
          أدخل رمز التحقق المكون من 6 أرقام المرسل إلى رقم هاتفك المسجل
          بالحساب{' '}
          <span className="font-bold text-[#111111]" dir="ltr">
            {identifier}
          </span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-15.5">
        <div className="w-full flex flex-col gap-6">
          {error && (
            <div className="w-full rounded-lg bg-red-50 p-3.5 text-right text-sm text-red-600 border border-red-200">
              {error}
            </div>
          )}
          {resendMessage && !error && (
            <div className="w-full rounded-lg bg-emerald-50 p-3.5 text-right text-sm text-emerald-700 border border-emerald-200">
              {resendMessage}
            </div>
          )}

          {/* Field: OTP */}
          <div className="w-full flex flex-col gap-2.5 text-right">
            <label className="text-[14px] font-semibold text-[#111111]">
              رمز التحقق
            </label>
            <input
              type="text"
              inputMode="numeric"
              maxLength={6}
              value={otp}
              onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
              placeholder="000000"
              dir="ltr"
              className="w-full h-11.5 rounded-lg border border-[#ECECEC] bg-white px-3.5 text-[14px] tracking-[0.4em] text-center text-[#111111] placeholder:text-[#979797] focus:border-primary focus:outline-none transition-colors"
            />
          </div>

          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="self-end text-[14px] font-bold text-primary hover:underline disabled:opacity-50"
          >
            {resending ? 'جاري الإرسال...' : 'لم يصلك الرمز؟ إعادة الإرسال'}
          </button>
        </div>

        {/* Action Buttons */}
        <div className="w-full flex flex-col gap-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full h-12 flex items-center justify-center rounded-full bg-primary px-5 text-[14px] font-bold text-white shadow-sm hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-all"
          >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'تحقق'}
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
