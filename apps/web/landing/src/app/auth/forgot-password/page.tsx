'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'

import {
  BackLink,
  FormError,
  PasswordField,
  PrimaryButton,
  StepHeading,
  TextField,
} from '@/components/auth/fields'
import OtpStep from '@/components/auth/OtpStep'
import SuccessDialog from '@/components/auth/SuccessDialog'
import {
  cleanIdentifier,
  errorMessage,
  isEmail,
  isPhone,
  requestPasswordCode,
  resetPassword,
  verifyPasswordCode,
} from '@/lib/auth'
import { LOGIN_PATH } from '@/lib/siteLinks'

const BackToLogin = (
  <p className="flex h-11.5 items-center justify-center gap-1 text-sm tracking-[-0.408px] text-ink">
    هل تذكرت كلمة المرور ؟
    <Link href={LOGIN_PATH} className="font-bold">
      تسجيل الدخول
    </Link>
  </p>
)

/**
 * A forgotten password in three steps: where to send the code, the code,
 * then the new password.
 */
export default function ForgotPasswordPage() {
  const router = useRouter()
  const [step, setStep] = useState<'identifier' | 'code' | 'password'>(
    'identifier',
  )
  const [identifier, setIdentifier] = useState('')
  const [resetToken, setResetToken] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [fieldError, setFieldError] = useState('')
  const [confirmError, setConfirmError] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const cleaned = cleanIdentifier(identifier)

  const sendCode = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!isEmail(cleaned) && !isPhone(cleaned)) {
      setFieldError('أدخل بريد إلكتروني أو رقم هاتف صحيح')
      return
    }
    setLoading(true)
    setFieldError('')
    try {
      await requestPasswordCode(cleaned)
      setStep('code')
    } catch (err) {
      setFieldError(
        errorMessage(err, 'لم نتمكن من العثور على حساب مرتبط بهذه البيانات.'),
      )
    } finally {
      setLoading(false)
    }
  }

  const savePassword = async (event: React.FormEvent) => {
    event.preventDefault()
    setFieldError(
      password.length < 8 ? 'كلمة المرور يجب أن تكون 8 أحرف على الأقل' : '',
    )
    setConfirmError(confirm !== password ? 'كلمتا المرور غير متطابقتين' : '')
    if (password.length < 8 || confirm !== password) return

    setLoading(true)
    setError('')
    try {
      await resetPassword(resetToken, password)
      setDone(true)
    } catch (err) {
      setError(
        errorMessage(
          err,
          'تعذر تغيير كلمة المرور. اطلب رمزاً جديداً وحاول مجدداً.',
        ),
      )
    } finally {
      setLoading(false)
    }
  }

  if (step === 'code') {
    return (
      <OtpStep
        identifier={cleaned}
        onBack={() => setStep('identifier')}
        onVerify={async (code) => {
          setResetToken(await verifyPasswordCode(cleaned, code))
          setFieldError('')
          setStep('password')
        }}
        onResend={() => requestPasswordCode(cleaned)}
        footer={BackToLogin}
      />
    )
  }

  if (step === 'password') {
    return (
      <>
        <form
          onSubmit={savePassword}
          noValidate
          className="flex w-full flex-col items-center gap-8"
        >
          <BackLink onClick={() => setStep('identifier')} />
          <StepHeading
            title="كلمة مرور جديدة"
            text="اختر كلمة مرور جديدة لحسابك من 8 أحرف على الأقل."
          />
          <div className="flex w-full flex-col gap-6">
            <PasswordField
              label="كلمة المرور الجديدة"
              placeholder="**************"
              autoComplete="new-password"
              required
              value={password}
              error={fieldError}
              onChange={(event) => setPassword(event.target.value)}
            />
            <PasswordField
              label="تأكيد كلمة المرور"
              placeholder="**************"
              autoComplete="new-password"
              required
              value={confirm}
              error={confirmError}
              onChange={(event) => setConfirm(event.target.value)}
            />
          </div>
          <FormError message={error} />
          <div className="flex w-full flex-col gap-2">
            <PrimaryButton loading={loading}>تغيير كلمة المرور</PrimaryButton>
            <Link
              href={LOGIN_PATH}
              className="flex h-11.5 items-center justify-center text-sm font-bold text-brand"
            >
              تخطي
            </Link>
          </div>
        </form>
        <SuccessDialog
          open={done}
          title="تم تحديث كلمة المرور بنجاح!"
          text="يمكنك الآن تسجيل الدخول باستخدام كلمة المرور الجديدة."
          action="تسجيل الدخول"
          onAction={() => router.push(LOGIN_PATH)}
        />
      </>
    )
  }

  return (
    <form
      onSubmit={sendCode}
      noValidate
      className="flex w-full flex-col items-center gap-8"
    >
      <BackLink href={LOGIN_PATH} />
      <StepHeading
        title="هل نسيت كلمة المرور ؟"
        text="أدخل رقم الهاتف أو البريد الإلكتروني المرتبط بحسابك لإرسال رمز إعادة تعيين كلمة المرور."
      />
      <div className="w-full">
        <TextField
          label="رقم الهاتف أو البريد الالكتروني"
          placeholder="alisalem@gmail.com"
          autoComplete="username"
          dir="ltr"
          style={{ textAlign: 'right' }}
          value={identifier}
          error={fieldError}
          onChange={(event) => setIdentifier(event.target.value)}
        />
      </div>
      <div className="flex w-full flex-col gap-2">
        <PrimaryButton loading={loading}>ارسال الرمز</PrimaryButton>
        {BackToLogin}
      </div>
    </form>
  )
}
