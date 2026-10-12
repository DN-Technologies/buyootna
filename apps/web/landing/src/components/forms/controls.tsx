'use client'

import { Check, ChevronDown, Minus, Plus, X } from 'lucide-react'
import Image from 'next/image'
import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

import { Field } from '@/components/auth/fields'
import { useDismiss } from '@/lib/useDismiss'

export interface Choice {
  id: string
  label: string
}

const BOX =
  'flex h-[46px] w-full items-center gap-2 rounded-lg border bg-white px-3 text-sm tracking-[-0.408px]'
const MENU =
  'panel-scroll absolute inset-x-0 top-full z-30 mt-1 flex max-h-64 flex-col gap-0.5 overflow-y-auto rounded-lg bg-white px-2.5 py-3 shadow-[0_4px_6px_rgba(33,37,41,0.2),0_0_1px_rgba(33,37,41,0.32)]'
const ROW =
  'flex h-10 shrink-0 items-center justify-between rounded-xl px-3 text-sm font-medium tracking-[-0.408px] text-ink transition hover:bg-surface'

/** A bordered card that groups part of a form under a heading. */
export function FormCard({
  title,
  children,
}: {
  title?: string
  children: ReactNode
}) {
  return (
    <section className="flex flex-col gap-5 rounded-lg border border-line bg-white p-5">
      {title && <h2 className="text-base font-bold text-ink">{title}</h2>}
      {children}
    </section>
  )
}

/** Two fields side by side from tablet width up. */
export function Row({ children }: { children: ReactNode }) {
  return <div className="grid gap-5 sm:grid-cols-2">{children}</div>
}

/** One choice out of a few, as round radio buttons in a row. */
export function RadioRow<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string
  options: { id: T; label: string }[]
  value: T
  onChange: (value: T) => void
}) {
  return (
    <div
      role="radiogroup"
      aria-label={label}
      className="grid grid-cols-3 gap-3"
    >
      {options.map((option) => {
        const checked = option.id === value
        return (
          <button
            key={option.id}
            type="button"
            role="radio"
            aria-checked={checked}
            onClick={() => onChange(option.id)}
            className="flex h-10 items-center gap-2 text-[15px] font-medium text-ink"
          >
            <span
              className={`flex h-4 w-4 items-center justify-center rounded-full border-[1.5px] ${
                checked ? 'border-brand' : 'border-[#D7D7D7]'
              }`}
            >
              {checked && <span className="h-2 w-2 rounded-full bg-brand" />}
            </span>
            {option.label}
          </button>
        )
      })}
    </div>
  )
}

/** A dropdown that picks one of a list. */
export function SelectField({
  label,
  placeholder,
  options,
  value,
  onChange,
  required,
  error,
  disabled,
  emptyText = 'لا توجد خيارات.',
}: {
  label: string
  placeholder: string
  options: Choice[]
  value: string
  onChange: (id: string) => void
  required?: boolean
  error?: string
  disabled?: boolean
  emptyText?: string
}) {
  const [open, setOpen] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(container, open, close)
  const chosen = options.find((option) => option.id === value)

  return (
    <Field label={label} required={required} error={error}>
      <div ref={container} className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={label}
          disabled={disabled}
          onClick={() => setOpen((current) => !current)}
          className={`${BOX} text-right disabled:opacity-60 ${error ? 'border-[#D12121]' : 'border-line'}`}
        >
          <span
            className={`min-w-0 flex-1 truncate ${chosen ? 'text-ink' : 'text-[#979797]'}`}
          >
            {chosen?.label ?? placeholder}
          </span>
          <ChevronDown
            className="h-4.5 w-4.5 shrink-0 text-ink"
            strokeWidth={1.5}
          />
        </button>
        {open && (
          <div role="listbox" className={MENU}>
            {options.length === 0 && (
              <p className="px-3 py-2 text-sm font-medium text-muted">
                {emptyText}
              </p>
            )}
            {options.map((option) => (
              <button
                key={option.id}
                type="button"
                role="option"
                aria-selected={option.id === value}
                onClick={() => {
                  onChange(option.id)
                  close()
                }}
                className={`${ROW} ${option.id === value ? 'bg-surface font-bold' : ''}`}
              >
                {option.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </Field>
  )
}

/** A dropdown that picks any number of a list, shown as chips in the box. */
export function MultiSelectField({
  label,
  placeholder,
  options,
  value,
  onChange,
}: {
  label: string
  placeholder: string
  options: Choice[]
  value: string[]
  onChange: (ids: string[]) => void
}) {
  const [open, setOpen] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(container, open, close)
  const toggle = (id: string) =>
    onChange(
      value.includes(id) ? value.filter((item) => item !== id) : [...value, id],
    )
  const chosen = options.filter((option) => value.includes(option.id))

  return (
    <Field label={label}>
      <div ref={container} className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          aria-label={label}
          onClick={() => setOpen((current) => !current)}
          className={`${BOX} h-auto min-h-11.5 border-line py-2 text-right`}
        >
          <span className="flex min-w-0 flex-1 flex-wrap gap-1.5">
            {chosen.length === 0 && (
              <span className="text-[#979797]">{placeholder}</span>
            )}
            {chosen.map((option) => (
              <span
                key={option.id}
                className="flex h-7 items-center rounded-2xl border border-line bg-tag px-3 text-sm font-medium text-ink"
              >
                {option.label}
              </span>
            ))}
          </span>
          <ChevronDown
            className="h-4.5 w-4.5 shrink-0 text-ink"
            strokeWidth={1.5}
          />
        </button>
        {open && (
          <div role="listbox" aria-multiselectable="true" className={MENU}>
            {options.map((option) => {
              const selected = value.includes(option.id)
              return (
                <button
                  key={option.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => toggle(option.id)}
                  className={`${ROW} ${selected ? 'bg-surface font-bold' : ''}`}
                >
                  {option.label}
                  {selected && (
                    <Check className="h-4 w-4 text-brand" strokeWidth={2} />
                  )}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </Field>
  )
}

/** A count with minus and plus buttons. */
export function Stepper({
  label,
  value,
  onChange,
  min = 0,
  max = 50,
}: {
  label: string
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}) {
  const button =
    'flex h-8 w-8 items-center justify-center text-muted disabled:opacity-30'
  return (
    <Field label={label}>
      <div className={`${BOX} justify-between border-line px-1`}>
        <button
          type="button"
          aria-label={`زيادة ${label}`}
          disabled={value >= max}
          onClick={() => onChange(value + 1)}
          className={button}
        >
          <Plus className="h-4 w-4" strokeWidth={1.5} />
        </button>
        <span aria-live="polite" className="text-sm font-medium text-ink">
          {value}
        </span>
        <button
          type="button"
          aria-label={`إنقاص ${label}`}
          disabled={value <= min}
          onClick={() => onChange(value - 1)}
          className={button}
        >
          <Minus className="h-4 w-4" strokeWidth={1.5} />
        </button>
      </div>
    </Field>
  )
}

/** An on / off switch beside its label. */
export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm font-medium tracking-[-0.408px] text-ink">
        {label}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        onClick={() => onChange(!checked)}
        className={`flex h-5 w-9 items-center rounded-full p-0.5 transition ${
          checked ? 'justify-end bg-brand' : 'justify-start bg-[#C9CDD3]'
        }`}
      >
        <span className="h-4 w-4 rounded-full bg-white" />
      </button>
    </div>
  )
}

/** A text area with the form's label, star and error line. */
export function TextBlock({
  label,
  value,
  onChange,
  placeholder,
  required,
  error,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  required?: boolean
  error?: string
}) {
  return (
    <Field label={label} required={required} error={error}>
      <textarea
        aria-label={label}
        rows={3}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className={`h-22 w-full resize-none rounded-lg border bg-white px-3 py-3 text-sm leading-normal tracking-[-0.408px] text-ink outline-none placeholder:text-[#979797] focus:border-brand ${
          error ? 'border-[#D12121]' : 'border-line'
        }`}
      />
    </Field>
  )
}

/** Photos to send with a form: a dashed box to add them, then thumbnails. */
export function ImagesField({
  label,
  action,
  files,
  onChange,
  max = 10,
  hint,
}: {
  label: string
  // e.g. "لرفع صورة"
  action: string
  files: File[]
  onChange: (files: File[]) => void
  max?: number
  // Shown as a bubble beside the label
  hint?: string
}) {
  const input = useRef<HTMLInputElement>(null)
  const [error, setError] = useState('')
  const [previews, setPreviews] = useState<string[]>([])

  useEffect(() => {
    const urls = files.map((file) => URL.createObjectURL(file))
    setPreviews(urls)
    return () => urls.forEach((url) => URL.revokeObjectURL(url))
  }, [files])

  const add = (picked: FileList | null) => {
    if (!picked) return
    const ok = [...picked].filter((file) => file.size <= 10 * 1024 * 1024)
    setError(
      ok.length < picked.length
        ? 'بعض الملفات تتجاوز 10 ميجا ولم تُضف.'
        : files.length + ok.length > max
          ? `يمكن إضافة ${max} صور كحد أقصى.`
          : '',
    )
    onChange([...files, ...ok].slice(0, max))
  }

  return (
    <div className="flex flex-col gap-3">
      <span className="flex items-center gap-1.5 text-sm font-medium tracking-[-0.408px] text-ink">
        {label}
        {hint && <Hint text={hint} />}
      </span>
      <button
        type="button"
        onClick={() => input.current?.click()}
        className="flex w-full flex-col items-center justify-center gap-2 rounded border border-dashed border-[#D7D7D7] bg-white px-6 py-4 transition hover:border-brand"
      >
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-tag">
          <Image src="/landing/auth-upload.svg" alt="" width={24} height={24} />
        </span>
        <span className="text-sm tracking-[-0.408px] text-ink">
          <span className="font-bold text-brand">اضغط هنا</span>{' '}
          <span className="font-medium">{action}</span>
        </span>
        <span className="text-xs font-medium text-muted">
          الصيغ المدعومة: JPG, PNG, WEBP (بحد أقصى 10 ميجا لكل ملف)
        </span>
      </button>
      <input
        ref={input}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(event) => {
          add(event.target.files)
          event.target.value = ''
        }}
      />
      {error && (
        <p role="alert" className="text-xs font-medium text-[#D12121]">
          {error}
        </p>
      )}
      {previews.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {previews.map((url, index) => (
            <div
              key={url}
              className="relative h-20 w-24 overflow-hidden rounded-md bg-tag"
            >
              {/* eslint-disable-next-line @next/next/no-img-element -- a local preview */}
              <img src={url} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                aria-label={`إزالة الصورة ${index + 1}`}
                onClick={() => onChange(files.filter((_, at) => at !== index))}
                className="absolute top-1 left-1 flex h-5 w-5 items-center justify-center rounded-full bg-ink/80 text-white"
              >
                <X className="h-3 w-3" strokeWidth={2} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

/** An "i" that shows a short explanation on hover or focus. */
export function Hint({ text }: { text: string }) {
  return (
    <span className="group relative inline-flex">
      <button
        type="button"
        aria-label={text}
        className="flex h-4 w-4 items-center justify-center rounded-full border border-muted text-[10px] leading-none font-bold text-muted"
      >
        i
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute top-full right-1/2 z-30 mt-2 hidden translate-x-1/2 rounded-xl bg-white px-4 py-3 text-sm font-medium whitespace-nowrap text-ink shadow-[0_4px_6px_rgba(33,37,41,0.2),0_0_1px_rgba(33,37,41,0.32)] group-focus-within:block group-hover:block"
      >
        {text}
      </span>
    </span>
  )
}

/** The bar of buttons that stays at the bottom of a form. */
export function FormFooter({ children }: { children: ReactNode }) {
  return (
    <div className="sticky bottom-0 z-20 border-t border-line bg-white shadow-[0_-2px_6px_rgba(33,37,41,0.06)]">
      <div className="mx-auto flex w-full max-w-275 items-center justify-between gap-3 px-5 py-4">
        {children}
      </div>
    </div>
  )
}

export const OUTLINE_BUTTON =
  'flex h-10 items-center justify-center rounded-3xl border border-[#E2E8F0] bg-white px-6 text-sm font-bold text-ink transition hover:bg-surface disabled:opacity-50'
export const SOLID_BUTTON =
  'flex h-10 min-w-[170px] items-center justify-center rounded-3xl bg-brand px-6 text-sm font-bold text-white transition hover:bg-brand-dark disabled:bg-[#A0A0A0]'

/** A green-edged note that confirms something and fades by itself. */
export function Toast({ text, onDone }: { text: string; onDone: () => void }) {
  useEffect(() => {
    if (!text) return
    const timer = setTimeout(onDone, 3500)
    return () => clearTimeout(timer)
  }, [text, onDone])

  if (!text) return null
  return (
    <p
      role="status"
      className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-xl border-2 border-[#00A447] bg-white px-4 py-3 text-[15px] font-medium text-ink shadow-[0_4px_12px_rgba(33,37,41,0.16)]"
    >
      <Image src="/landing/auth-success.svg" alt="" width={24} height={24} />
      {text}
    </p>
  )
}
