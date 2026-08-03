'use client'

import { useRouter } from 'next/navigation'
import { api } from '@/lib/api'
import { saveSession } from '@/lib/auth'
import { AdminLoginForm } from '@/components/AdminLoginForm'
import { BuyootnaFullLogo } from '@/components/BuyootnaLogo'

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = async (data: {
    identifier: string
    password: string
    rememberMe: boolean
  }) => {
    const res = await api.post('/auth/login', {
      identifier: data.identifier,
      password: data.password,
    })

    const { access_token: accessToken, user } = res.data ?? {}

    if (!accessToken || !user) {
      throw new Error('تعذر تسجيل الدخول. يرجى المحاولة مرة أخرى.')
    }

    if (!user.isAdmin) {
      throw new Error('هذا الحساب لا يملك صلاحية الوصول إلى لوحة التحكم')
    }

    saveSession(accessToken, user, data.rememberMe)
    router.push('/')
  }

  return (
    <div
      className="min-h-screen w-full flex bg-[#FFFFFF] font-sans text-right"
      dir="rtl"
    >
      {/* ── Right Panel: Login Form (White Background) ── */}
      <div className="flex-1 flex flex-col justify-center items-center px-6 py-12 lg:px-16 bg-[#FFFFFF]">
        <AdminLoginForm
          onSubmit={handleLogin}
          onForgotPasswordClick={() => router.push('/auth/forgot-password')}
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
