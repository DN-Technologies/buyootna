'use client'

import { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { api } from '@/lib/api'
import { ResetPasswordForm } from '@/components/ResetPasswordForm'
import { BuyootnaFullLogo } from '@/components/BuyootnaLogo'

function ResetPasswordContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const resetToken = searchParams.get('token') ?? ''

  const handleResetPassword = async (newPassword: string) => {
    await api.post('/auth/recovery/reset-password', {
      resetToken,
      newPassword,
    })
  }

  return (
    <ResetPasswordForm
      onSubmit={handleResetPassword}
      onBackToLogin={() => router.push('/auth/login')}
    />
  )
}

export default function ResetPasswordPage() {
  return (
    <div
      className="min-h-screen w-full flex bg-white font-sans text-right"
      dir="rtl"
    >
      {/* ── Right Panel: Reset Password Form (White Background) ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-16 bg-white">
        <Suspense fallback={null}>
          <ResetPasswordContent />
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
