'use client'

import { useState } from 'react'
import { Lock, Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'

interface ResetPasswordFormProps {
  onSubmit: (newPassword: string) => Promise<void>
  onBackToLogin: () => void
}

export function ResetPasswordForm({
  onSubmit,
  onBackToLogin,
}: ResetPasswordFormProps) {
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newPassword.trim() || !confirmPassword.trim()) {
      setError('يرجى تعبئة جميع الحقول')
      return
    }
    if (newPassword.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('كلمتا المرور غير متطابقتين')
      return
    }

    try {
      setError(null)
      setLoading(true)
      await onSubmit(newPassword)
      setSuccess(true)
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          'تعذر تغيير كلمة المرور. يرجى المحاولة مرة أخرى.',
      )
    } finally {
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
          تعيين كلمة مرور جديدة
        </h1>
        <p className="text-[15px] font-semibold leading-6 tracking-[0.3px] text-[#6B6A6A]">
          الرجاء إدخال كلمة المرور الجديدة الخاصة بحسابك
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

          {/* Field 1: New Password */}
          <div className="w-full flex flex-col gap-2.5 text-right">
            <div className="w-full flex items-center justify-end gap-0.5">
              <span className="text-[14px] font-medium text-[#D12121]">*</span>
              <label className="text-[14px] font-semibold text-[#111111]">
                كلمة المرور الجديدة
              </label>
            </div>
            <div className="relative w-full">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="**************"
                className="w-full h-11.5 rounded-lg border border-[#ECECEC] bg-white pl-10 pr-3.5 text-[14px] text-[#111111] placeholder:text-[#979797] focus:border-primary focus:outline-none transition-colors text-right"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#979797] hover:text-[#111111] focus:outline-none"
              >
                {showNewPassword ? (
                  <EyeOff className="w-4.5 h-4.5" />
                ) : (
                  <Eye className="w-4.5 h-4.5" />
                )}
              </button>
            </div>
          </div>

          {/* Field 2: Confirm Password */}
          <div className="w-full flex flex-col gap-2.5 text-right">
            <div className="w-full flex items-center justify-end gap-0.5">
              <span className="text-[14px] font-medium text-[#D12121]">*</span>
              <label className="text-[14px] font-semibold text-[#111111]">
                تأكيد كلمة المرور
              </label>
            </div>
            <div className="relative w-full">
              <input
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="**************"
                className="w-full h-11.5 rounded-lg border border-[#ECECEC] bg-white pl-10 pr-3.5 text-[14px] text-[#111111] placeholder:text-[#979797] focus:border-primary focus:outline-none transition-colors text-right"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#979797] hover:text-[#111111] focus:outline-none"
              >
                {showConfirmPassword ? (
                  <EyeOff className="w-4.5 h-4.5" />
                ) : (
                  <Eye className="w-4.5 h-4.5" />
                )}
              </button>
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
            'تغيير كلمة المرور'
          )}
        </button>
      </form>

      {/* ── Success Modal ── */}
      {success && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4">
          <div className="w-full max-w-[495px] flex flex-col items-center gap-8 rounded-2xl bg-white p-8 shadow-[0px_2px_1px_rgba(33,37,41,0.06),0px_0px_0.5px_rgba(33,37,41,0.08)]">
            <div className="w-full flex flex-col items-center gap-6">
              <CheckCircle2 className="w-16 h-16 text-[#018B1B]" />
              <div className="w-full flex flex-col gap-4 text-center">
                <h2 className="text-[22px] font-bold leading-snug text-[#111111] font-sans">
                  تم تغيير كلمة المرور بنجاح!
                </h2>
                <p className="text-[16px] font-medium leading-tight text-[#6B6A6A]">
                  يمكنك الان تسجيل الدخول بكلمة المرور الجديدة
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={onBackToLogin}
              className="w-full h-12 flex items-center justify-center rounded-full bg-primary px-5 text-[14px] font-bold text-white shadow-sm hover:bg-primary/80 transition-all"
            >
              العودة الى تسجيل الدخول
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
