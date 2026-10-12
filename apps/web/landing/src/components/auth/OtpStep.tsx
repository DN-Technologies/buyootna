'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

import {
  BackLink,
  FormError,
  PrimaryButton,
  StepHeading,
} from '@/components/auth/fields'
import { errorMessage, maskIdentifier, retryAfterOf } from '@/lib/auth'

const LENGTH = 6
const RESEND_AFTER = 45

const clock = (seconds: number) =>
  `${String(Math.floor(seconds / 60)).padStart(2, '0')}:${String(seconds % 60).padStart(2, '0')}`

/**
 * "تحقق من الرمز": six boxes for the code sent by SMS or email, a countdown
 * before another can be requested, and the button that checks it.
 */
export default function OtpStep({
  identifier,
  onBack,
  onVerify,
  onResend,
  footer,
}: {
  // Where the code went
  identifier: string
  onBack: () => void
  // Rejects with the API error when the code is wrong
  onVerify: (code: string) => Promise<void>
  onResend: () => Promise<void>
  footer?: ReactNode
}) {
  const [digits, setDigits] = useState<string[]>(Array(LENGTH).fill(''))
  const [wait, setWait] = useState(RESEND_AFTER)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const boxes = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    boxes.current[0]?.focus()
  }, [])

  useEffect(() => {
    if (wait <= 0) return
    const timer = setTimeout(() => setWait((seconds) => seconds - 1), 1000)
    return () => clearTimeout(timer)
  }, [wait])

  const code = digits.join('')

  // Typing or pasting fills from `index` onwards and moves the caret along
  const fill = (index: number, text: string) => {
    const typed = text.replace(/\D/g, '').slice(0, LENGTH - index)
    if (!typed) return
    setDigits((current) => {
      const next = [...current]
      typed.split('').forEach((digit, offset) => (next[index + offset] = digit))
      return next
    })
    boxes.current[Math.min(index + typed.length, LENGTH - 1)]?.focus()
  }

  const onKeyDown = (
    index: number,
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key !== 'Backspace') return
    event.preventDefault()
    setDigits((current) => {
      const next = [...current]
      // Clear this box, or the one before it when this one is already empty
      next[current[index] ? index : Math.max(index - 1, 0)] = ''
      return next
    })
    if (!digits[index]) boxes.current[Math.max(index - 1, 0)]?.focus()
  }

  const verify = async (event: React.FormEvent) => {
    event.preventDefault()
    if (code.length !== LENGTH) return
    setLoading(true)
    setError('')
    try {
      await onVerify(code)
    } catch (err) {
      setError(errorMessage(err, 'رمز التحقق غير صحيح أو منتهي الصلاحية'))
      // Start over on a wrong code
      setDigits(Array(LENGTH).fill(''))
      boxes.current[0]?.focus()
    } finally {
      setLoading(false)
    }
  }

  const resend = async () => {
    setError('')
    try {
      await onResend()
      setDigits(Array(LENGTH).fill(''))
      setWait(RESEND_AFTER)
      boxes.current[0]?.focus()
    } catch (err) {
      // The API says how long to wait when codes are asked for too often
      const retryAfter = retryAfterOf(err)
      if (retryAfter) setWait(Math.ceil(retryAfter))
      setError(errorMessage(err, 'تعذر إعادة إرسال رمز التحقق'))
    }
  }

  return (
    <form onSubmit={verify} className="flex w-full flex-col items-center gap-8">
      <BackLink onClick={onBack} />
      <StepHeading
        title="تحقق من الرمز"
        text={
          <>
            أرسلنا رمز التحقق المكون من 6 ارقام إلى{' '}
            <span dir="ltr">{maskIdentifier(identifier)}</span>
          </>
        }
      />

      <div className="flex w-full flex-col items-center gap-6">
        <p className="flex items-center gap-2 text-sm">
          {wait > 0 ? (
            <>
              <span className="text-[#A0A0A0]">اعادة ارسال الرمز</span>
              <span className="font-bold tracking-[-0.408px] text-brand">
                خلال {clock(wait)}
              </span>
            </>
          ) : (
            <button
              type="button"
              onClick={resend}
              className="font-bold text-brand"
            >
              اعادة ارسال الرمز
            </button>
          )}
        </p>
        {/* Codes read left to right even on a right-to-left page */}
        <div
          dir="ltr"
          className="flex w-full items-center justify-between gap-1"
        >
          {digits.map((digit, index) => (
            <input
              key={index}
              ref={(element) => {
                boxes.current[index] = element
              }}
              type="text"
              inputMode="numeric"
              autoComplete={index === 0 ? 'one-time-code' : 'off'}
              aria-label={`الرقم ${index + 1} من رمز التحقق`}
              value={digit}
              onChange={(event) => {
                const text = event.target.value
                // A whole code at once (autofill); otherwise a digit typed
                // over a filled box replaces it
                if (text.length >= LENGTH) fill(0, text)
                else {
                  fill(
                    index,
                    digit && text.startsWith(digit) ? text.slice(1) : text,
                  )
                }
              }}
              onPaste={(event) => {
                event.preventDefault()
                fill(index, event.clipboardData.getData('text'))
              }}
              onKeyDown={(event) => onKeyDown(index, event)}
              className="h-14 w-14 max-w-[15%] rounded-[5px] border-[1.27px] border-line bg-white text-center text-xl font-bold text-ink outline-none focus:border-brand"
            />
          ))}
        </div>
      </div>

      <FormError message={error} />
      <div className="flex w-full flex-col gap-2">
        <PrimaryButton loading={loading} disabled={code.length !== LENGTH}>
          التحقق من الرمز
        </PrimaryButton>
        {footer}
      </div>
    </form>
  )
}
