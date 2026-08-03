'use client'

import { useState } from 'react'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { BuyootnaIconMark } from './BuyootnaLogo'

interface AdminLoginFormProps {
  onSubmit: (data: {
    identifier: string
    password: string
    rememberMe: boolean
  }) => Promise<void>
  onForgotPasswordClick?: () => void
}

export function AdminLoginForm({
  onSubmit,
  onForgotPasswordClick,
}: AdminLoginFormProps) {
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!identifier.trim() || !password.trim()) {
      setError('يرجى إدخال اسم المستخدم وكلمة المرور')
      return
    }

    try {
      setError(null)
      setLoading(true)
      await onSubmit({ identifier, password, rememberMe })
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'تعذر تسجيل الدخول. يرجى التأكد من صحة البيانات.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-130 flex flex-col">
      {/* ── Brand Logo Icon ── */}
      <div className="mb-6 flex">
        <BuyootnaIconMark className="w-11 h-auto" fill="#15304D" />
      </div>

      {/* ── Title & Subtitle ── */}
      <div className="w-full flex flex-col gap-5 text-right mb-16">
        <h1 className="text-2xl font-bold leading-snug text-[#111111] font-sans">
          تسجيل الدخول
        </h1>
        <p className="text-[15px] font-semibold leading-6 tracking-[0.3px] text-[#6B6A6A]">
          مرحبًا بعودتك، سجّل الدخول للوصول إلى لوحة التحكم وإدارة المنصة.
        </p>
      </div>

      {/* ── Form ── */}
      <form onSubmit={handleSubmit} className="w-full flex flex-col gap-15.5">
        <div className="w-full flex flex-col gap-6">
        {error && (
          <div className="w-full rounded-lg bg-red-50 p-3.5 text-right text-sm text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {/* Field 1: Phone or Email */}
        <div className="w-full flex flex-col gap-2.5 text-right">
          <label className="text-[14px] font-semibold text-[#111111]">
            رقم الهاتف أو البريد الالكتروني
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

        {/* Field 2: Password */}
        <div className="w-full flex flex-col gap-2">
          <div className="w-full flex flex-col gap-2.5 text-right">
            <label className="text-[14px] font-semibold text-[#111111]">
              كلمة المرور
            </label>
            <div className="relative w-full">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="**************"
                className="w-full h-11.5 rounded-lg border border-[#ECECEC] bg-white pl-10 pr-3.5 text-[14px] text-[#111111] placeholder:text-[#979797] focus:border-primary focus:outline-none transition-colors text-right"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#979797] hover:text-[#111111] focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-4.5 h-4.5" />
                ) : (
                  <Eye className="w-4.5 h-4.5" />
                )}
              </button>
            </div>
          </div>

          {/* Sub-row: Forgot Password & Remember Me */}
          <div className="w-full flex items-center justify-between pt-1">
            {onForgotPasswordClick ? (
              <button
                type="button"
                onClick={onForgotPasswordClick}
                className="text-[14px] font-bold text-primary hover:underline"
              >
                هل نسيت كلمة المرور؟
              </button>
            ) : (
              <div />
            )}

            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-[12px] font-normal text-[#6B6A6A]">
                تذكري
              </span>
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 rounded border-[#ECECEC] text-primary focus:ring-primary"
              />
            </label>
          </div>
        </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 flex items-center justify-center rounded-full bg-primary px-5 text-[14px] font-bold text-white shadow-sm hover:bg-primary/80 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 transition-all"
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            'تسجيل الدخول'
          )}
        </button>
      </form>
    </div>
  )
}
