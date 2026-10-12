'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import AuthTabs from '@/components/auth/AuthTabs'
import {
  AuthMark,
  Checkbox,
  FormError,
  PasswordField,
  PrimaryButton,
  TextField,
} from '@/components/auth/fields'
import OtpStep from '@/components/auth/OtpStep'
import SuccessDialog from '@/components/auth/SuccessDialog'
import {
  cleanIdentifier,
  errorMessage,
  isEmail,
  isPhone,
  registerIndividual,
  verifySignupCode,
} from '@/lib/auth'

type Errors = Partial<Record<'name' | 'identifier' | 'password', string>>

/**
 * An individual's sign-up: name, phone or email and a password, then the
 * code sent to that phone or email, then the welcome dialog.
 */
export default function IndividualSignup() {
  const router = useRouter()
  const [step, setStep] = useState<'form' | 'code'>('form')
  const [name, setName] = useState('')
  const [identifier, setIdentifier] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [errors, setErrors] = useState<Errors>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const cleaned = cleanIdentifier(identifier)

  // The same rules the API applies, checked before the request
  const validate = (): Errors => {
    const found: Errors = {}
    const trimmed = name.trim()
    if (trimmed.length < 2) found.name = 'الاسم يجب أن يكون حرفين على الأقل'
    else if (trimmed.length > 32) found.name = 'الاسم يجب ألا يتجاوز 32 حرفاً'
    if (!isEmail(cleaned) && !isPhone(cleaned)) {
      found.identifier = 'أدخل بريد إلكتروني أو رقم هاتف صحيح'
    }
    if (password.length < 6) {
      found.password = 'كلمة المرور يجب أن تكون 6 أحرف على الأقل'
    }
    return found
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    const found = validate()
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setLoading(true)
    setError('')
    try {
      await registerIndividual({ name, identifier, password })
      setStep('code')
    } catch (err) {
      setError(errorMessage(err, 'تعذر إنشاء الحساب. حاول مجدداً.'))
    } finally {
      setLoading(false)
    }
  }

  if (step === 'code') {
    return (
      <>
        <OtpStep
          identifier={cleaned}
          onBack={() => setStep('form')}
          onVerify={async (code) => {
            await verifySignupCode(cleaned, code, remember)
            setDone(true)
          }}
          onResend={() => registerIndividual({ name, identifier, password })}
        />
        <SuccessDialog
          open={done}
          title="تم إنشاء حسابك بنجاح!"
          text="أهلاً بك في بيوتنا، ابدأ الآن باستكشاف العقارات والخدمات والفرص القريبة منك."
          action="ابدأ الاستكشاف"
          onAction={() => router.push('/')}
        />
      </>
    )
  }

  return (
    <>
      <div className="flex w-full flex-col items-center gap-4">
        <AuthMark />
        <AuthTabs active="signup" />
      </div>

      <form onSubmit={submit} noValidate className="flex w-full flex-col gap-8">
        <div className="flex flex-col gap-6">
          <TextField
            label="الاسم"
            placeholder="علي سالم"
            autoComplete="name"
            required
            value={name}
            error={errors.name}
            onChange={(event) => setName(event.target.value)}
          />
          <TextField
            label="رقم الهاتف أو البريد الالكتروني"
            placeholder="alisalem@gmail.com"
            autoComplete="username"
            dir="ltr"
            style={{ textAlign: 'right' }}
            required
            value={identifier}
            error={errors.identifier}
            onChange={(event) => setIdentifier(event.target.value)}
          />
          <div className="flex flex-col gap-1.5">
            <PasswordField
              label="كلمة المرور"
              placeholder="**************"
              autoComplete="new-password"
              required
              value={password}
              error={errors.password}
              onChange={(event) => setPassword(event.target.value)}
            />
            <Checkbox
              label="تذكرني"
              checked={remember}
              onChange={setRemember}
            />
          </div>
        </div>

        <FormError message={error} />
        <PrimaryButton loading={loading}>إنشاء حساب</PrimaryButton>
      </form>
    </>
  )
}
