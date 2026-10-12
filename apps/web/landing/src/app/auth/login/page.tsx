'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import AuthTabs from '@/components/auth/AuthTabs'
import {
  AuthMark,
  Checkbox,
  FormError,
  PasswordField,
  PrimaryButton,
  TextField,
} from '@/components/auth/fields'
import ProfilePickerDialog from '@/components/auth/ProfilePickerDialog'
import { errorMessage, login, savedProfiles } from '@/lib/auth'

export default function LoginPage() {
  const router = useRouter()
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // Offered only when this browser remembers an account
  const [hasSaved, setHasSaved] = useState(false)
  const [pickerOpen, setPickerOpen] = useState(false)

  useEffect(() => {
    setHasSaved(savedProfiles() !== null)
  }, [])

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!identifier.trim() || !password) {
      setError('أدخل رقم الهاتف أو البريد الالكتروني وكلمة المرور.')
      return
    }
    setLoading(true)
    setError('')
    try {
      await login(identifier, password, remember)
      router.push('/')
    } catch (err) {
      setError(
        errorMessage(err, 'تعذر تسجيل الدخول. تحقق من البيانات وحاول مجدداً.'),
      )
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex w-full flex-col items-center gap-4">
        <AuthMark />
        <AuthTabs active="login" />
      </div>

      <form onSubmit={submit} className="flex w-full flex-col gap-8">
        <div className="flex flex-col gap-6">
          <TextField
            label="رقم الهاتف أو البريد الالكتروني"
            placeholder="alisalem@gmail.com"
            autoComplete="username"
            dir="ltr"
            style={{ textAlign: 'right' }}
            value={identifier}
            onChange={(event) => setIdentifier(event.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <PasswordField
              label="كلمة المرور"
              placeholder="**************"
              autoComplete="current-password"
                value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <div className="flex items-center justify-between">
              <Checkbox
                label="تذكرني"
                checked={remember}
                onChange={setRemember}
              />
              <Link
                href="/auth/forgot-password"
                className="py-1.5 text-sm font-bold tracking-[-0.408px] text-brand"
              >
                هل نسيت كلمة المرور؟
              </Link>
            </div>
          </div>
        </div>

        <FormError message={error} />

        <div className="flex flex-col gap-2">
          <PrimaryButton loading={loading}>تسجيل الدخول</PrimaryButton>
          {hasSaved && (
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="flex h-11.5 items-center justify-center rounded-3xl text-sm font-bold tracking-[-0.408px] text-ink"
            >
              المتابعة بحساب محفوظ
            </button>
          )}
        </div>
      </form>

      <ProfilePickerDialog
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onContinue={() => router.push('/')}
      />
    </>
  )
}
