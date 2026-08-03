'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import { VerifyOtpForm } from '@/components/VerifyOtpForm'
import { BuyootnaFullLogo } from '@/components/BuyootnaLogo'

function VerifyOtpContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const identifier = searchParams.get('identifier') ?? ''

  if (!identifier) {
    return (
      <div className="w-full max-w-130 flex flex-col text-right">
        <p className="text-[15px] font-semibold text-[#6B6A6A]">
          الرجاء العودة إلى صفحة استعادة كلمة المرور والمحاولة مرة أخرى.
        </p>
        <button
          type="button"
          onClick={() => router.push('/auth/forgot-password')}
          className="mt-6 w-full h-12 flex items-center justify-center rounded-full bg-primary px-5 text-[14px] font-bold text-white transition-all hover:bg-primary/80"
        >
          العودة الى نسيت كلمة المرور
        </button>
      </div>
    )
  }

  const handleVerify = async (otp: string) => {
    const res = await api.post('/auth/recovery/verify-otp', {
      identifier,
      otp,
    })
    const resetToken = res.data?.resetToken
    if (!resetToken) {
      throw new Error('تعذر التحقق من الرمز. يرجى المحاولة مرة أخرى.')
    }
    router.push(`/auth/reset-password?token=${encodeURIComponent(resetToken)}`)
  }

  const handleResend = async () => {
    await api.post('/auth/recovery/request-otp', { identifier })
  }

  return (
    <VerifyOtpForm
      identifier={identifier}
      onSubmit={handleVerify}
      onResend={handleResend}
      onBackToLogin={() => router.push('/auth/login')}
    />
  )
}

export default function VerifyOtpPage() {
  return (
    <div
      className="min-h-screen w-full flex bg-white font-sans text-right"
      dir="rtl"
    >
      {/* ── Right Panel: Verify OTP Form (White Background) ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-16 bg-white">
        <Suspense fallback={null}>
          <VerifyOtpContent />
        </Suspense>
      </div>

      {/* ── Left Panel: Large Branding Banner (#15304D) ── */}
      <div className="hidden lg:flex w-1/2 bg-primary items-center justify-center relative overflow-hidden">
        <div className="relative z-10 flex items-center justify-center p-12">
          <BuyootnaFullLogo className="w-70 h-auto" fill="#FFFFFF" />
        </div>
      </div>
    </div>
  )
}
