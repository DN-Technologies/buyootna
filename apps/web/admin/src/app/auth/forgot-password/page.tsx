'use client'

import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { ForgotPasswordForm } from '@/components/ForgotPasswordForm'
import { BuyootnaFullLogo } from '@/components/BuyootnaLogo'

export default function ForgotPasswordPage() {
  const router = useRouter()

  const handleForgotPassword = async (identifier: string) => {
    await api.post('/auth/recovery/request-otp', { identifier })
    router.push(
      `/auth/verify-otp?identifier=${encodeURIComponent(identifier)}`,
    )
  }

  return (
    <div
      className="min-h-screen w-full flex bg-white font-sans text-right"
      dir="rtl"
    >
      {/* ── Right Panel: Forgot Password Form (White Background) ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-16 bg-white">
        <ForgotPasswordForm
          onSubmit={handleForgotPassword}
          onBackToLogin={() => router.push('/auth/login')}
        />
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
