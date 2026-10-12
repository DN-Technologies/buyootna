'use client'

import { Eye } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import {
  useId,
  useRef,
  useState,
  type InputHTMLAttributes,
  type ReactNode,
} from 'react'

const INPUT_BOX =
  'flex w-full items-center gap-2 rounded-lg border bg-white px-3 transition focus-within:border-brand'
const INPUT_TEXT =
  'w-full min-w-0 flex-1 bg-transparent text-sm tracking-[-0.408px] text-ink outline-none placeholder:text-[#979797]'

/** A label over its control, with the red star for required fields. */
export function Field({
  label,
  required,
  error,
  htmlFor,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  htmlFor?: string
  children: ReactNode
}) {
  return (
    <div className="flex w-full flex-col gap-3">
      {label && (
        <label
          htmlFor={htmlFor}
          className="text-sm leading-none font-medium tracking-[-0.408px] text-ink"
        >
          {label}
          {required && <span className="text-[#D12121]">*</span>}
        </label>
      )}
      {children}
      {error && (
        <p role="alert" className="-mt-1 text-xs font-medium text-[#D12121]">
          {error}
        </p>
      )}
    </div>
  )
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string
  error?: string
  // Shown at the far end of the box
  icon?: ReactNode
}

export function TextField({
  label,
  error,
  icon,
  required,
  ...input
}: TextFieldProps) {
  const id = useId()
  return (
    <Field label={label} required={required} error={error} htmlFor={id}>
      <div
        className={`${INPUT_BOX} h-11.5 ${error ? 'border-[#D12121]' : 'border-line'}`}
      >
        <input
          id={id}
          aria-invalid={!!error}
          className={INPUT_TEXT}
          {...input}
        />
        {icon}
      </div>
    </Field>
  )
}

/** A password box with the show / hide eye. */
export function PasswordField(props: Omit<TextFieldProps, 'type' | 'icon'>) {
  const [shown, setShown] = useState(false)
  return (
    <TextField
      {...props}
      type={shown ? 'text' : 'password'}
      dir="ltr"
      style={{ textAlign: 'right' }}
      icon={
        <button
          type="button"
          aria-label={shown ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
          aria-pressed={shown}
          onClick={() => setShown((value) => !value)}
          className="flex h-4.5 w-4.5 shrink-0 items-center justify-center"
        >
          {shown ? (
            <Eye className="h-4.5 w-4.5 text-ink" strokeWidth={1.5} />
          ) : (
            <Image src="/landing/auth-eye.svg" alt="" width={18} height={18} />
          )}
        </button>
      }
    />
  )
}

export function TextArea({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
}) {
  const id = useId()
  return (
    <Field label={label} htmlFor={id}>
      <textarea
        id={id}
        rows={3}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`${INPUT_BOX} ${INPUT_TEXT} h-22 resize-none border-line py-3 leading-normal`}
      />
    </Field>
  )
}

/** "تذكرني" and the like. */
export function Checkbox({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <label className="flex h-6.5 cursor-pointer items-center gap-1 text-xs text-muted">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="peer sr-only"
      />
      <span className="flex h-4.5 w-4.5 items-center justify-center peer-focus-visible:outline-2 peer-focus-visible:outline-2 peer-focus-visible:outline-brand">
        {checked ? (
          <span className="flex h-[13.5px] w-[13.5px] items-center justify-center rounded-[2.7px] bg-brand text-[10px] leading-none text-white">
            ✓
          </span>
        ) : (
          <Image
            src="/landing/auth-checkbox.svg"
            alt=""
            width={18}
            height={18}
          />
        )}
      </span>
      {label}
    </label>
  )
}

/** The dashed box a logo or licence image is picked from. */
export function FileDrop({
  label,
  action,
  note,
  file,
  onPick,
}: {
  label: string
  // e.g. "لرفع ملفك"
  action: string
  note?: string
  file: File | null
  onPick: (file: File | null) => void
}) {
  const input = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')

  const pick = (picked: File | undefined) => {
    if (!picked) return
    if (picked.size > 10 * 1024 * 1024) {
      setError('حجم الملف يتجاوز 10 ميجا.')
      return
    }
    setError('')
    onPick(picked)
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <span className="text-sm leading-none font-medium tracking-[-0.408px] text-ink">
        {label}
      </span>
      <div className="flex flex-col gap-2">
        <button
          type="button"
          onClick={() => input.current?.click()}
          className="flex w-full flex-col items-center justify-center gap-2 rounded border border-dashed border-[#D7D7D7] bg-white px-6 py-4 transition hover:border-brand"
        >
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-tag">
            <Image
              src="/landing/auth-upload.svg"
              alt=""
              width={24}
              height={24}
            />
          </span>
          {file ? (
            <span
              className="max-w-full truncate text-sm font-medium text-ink"
              dir="auto"
            >
              {file.name}
            </span>
          ) : (
            <span className="text-sm tracking-[-0.408px] text-ink">
              <span className="font-bold text-brand">اضغط هنا</span>{' '}
              <span className="font-medium">{action}</span>
            </span>
          )}
          <span className="text-xs leading-[1.2] font-medium text-muted">
            الصيغ المدعومة: SVG, JPG, PNG (بحد أقصى 10 ميجا لكل ملف)
          </span>
        </button>
        <input
          ref={input}
          type="file"
          accept="image/png,image/jpeg,image/svg+xml"
          className="hidden"
          onChange={(event) => pick(event.target.files?.[0])}
        />
        {file && (
          <button
            type="button"
            onClick={() => onPick(null)}
            className="self-start text-xs font-bold text-brand"
          >
            إزالة الملف
          </button>
        )}
        {error && (
          <p role="alert" className="text-xs font-medium text-[#D12121]">
            {error}
          </p>
        )}
        {note && <p className="text-xs font-medium text-ink">{note}</p>}
      </div>
    </div>
  )
}

export function PrimaryButton({
  children,
  loading,
  disabled,
  type = 'submit',
  onClick,
  className = 'w-full',
}: {
  children: ReactNode
  loading?: boolean
  disabled?: boolean
  type?: 'submit' | 'button'
  onClick?: () => void
  className?: string
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      aria-busy={loading}
      className={`flex h-12 items-center justify-center rounded-3xl bg-brand px-4.5 text-sm font-bold text-white transition hover:bg-brand-dark disabled:bg-[#A0A0A0] ${className}`}
    >
      {loading ? 'جارٍ التنفيذ…' : children}
    </button>
  )
}

/** A form-level error from the API. */
export function FormError({ message }: { message: string }) {
  if (!message) return null
  return (
    <p
      role="alert"
      className="w-full rounded-lg bg-[#FFEBEB] px-3 py-2.5 text-sm font-medium text-[#9C1E28]"
    >
      {message}
    </p>
  )
}

/** "العودة" at the top of a step. */
export function BackLink({
  href,
  onClick,
}: {
  href?: string
  onClick?: () => void
}) {
  const className =
    'flex h-10 items-center gap-2 self-start text-base font-medium text-ink'
  const content = (
    <>
      <Image
        src="/landing/auth-back.svg"
        alt=""
        width={20}
        height={20}
        className="-scale-x-100"
      />
      العودة
    </>
  )
  return href ? (
    <Link href={href} className={className}>
      {content}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {content}
    </button>
  )
}

/** The brand mark that heads every auth step. */
export function AuthMark() {
  return (
    <Image src="/landing/logo-mark.png" alt="بيوتنا" width={37} height={37} />
  )
}

/** A step's title and the line under it. */
export function StepHeading({
  title,
  text,
}: {
  title: string
  text?: ReactNode
}) {
  return (
    <div className="flex flex-col items-center gap-4 text-center">
      <AuthMark />
      <h1 className="text-2xl leading-5.5 font-bold text-ink">{title}</h1>
      {text && (
        <p className="text-[15px] leading-normal font-semibold tracking-[0.3px] text-muted">
          {text}
        </p>
      )}
    </div>
  )
}
