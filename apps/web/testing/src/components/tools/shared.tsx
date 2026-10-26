'use client'

import type { ReactNode } from 'react'
import { Search, X } from 'lucide-react'

export type PersonaType = 'INDIVIDUAL' | 'COMPANY' | 'OFFICE'

export const PERSONA_LABEL: Record<PersonaType, string> = {
  INDIVIDUAL: 'فرد',
  COMPANY: 'شركة',
  OFFICE: 'مكتب عقاري',
}

export const APPROVAL_LABEL: Record<string, string> = {
  APPROVED: 'معتمد',
  PENDING: 'بانتظار الاعتماد',
  REJECTED: 'مرفوض',
}

export interface CooldownEntry {
  key: string
  requestsToday: number
  dailyLimit: number
  dailyLimitReached: boolean
  waitUntil: string | null
  failedAttempts: number
  blocked: boolean
}

export function SearchBox({
  value,
  onChange,
  placeholder,
}: {
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <div className="relative">
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-line bg-primary py-2.5 pl-9 pr-9 text-sm outline-none focus:border-accent"
      />
      <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
      {value && (
        <button
          onClick={() => onChange('')}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
          aria-label="مسح"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export function Button({
  children,
  onClick,
  disabled,
  tone = 'accent',
  type = 'button',
}: {
  children: ReactNode
  onClick?: () => void
  disabled?: boolean
  tone?: 'accent' | 'outline' | 'danger'
  type?: 'button' | 'submit'
}) {
  const style =
    tone === 'accent'
      ? 'bg-accent text-primary'
      : tone === 'danger'
        ? 'border border-down/50 text-down'
        : 'border border-line text-white'
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex shrink-0 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-sm font-bold disabled:opacity-50 ${style}`}
    >
      {children}
    </button>
  )
}

export const inputClass =
  'w-full rounded-xl border border-line bg-primary px-3 py-2.5 text-base text-white outline-none focus:border-accent'

/** One rate-limit entry: what's blocking new codes, and «فك القفل». */
export function CooldownRow({
  entry,
  onUnlock,
  busy,
}: {
  entry: CooldownEntry
  onUnlock: () => void
  busy: boolean
}) {
  const waitSeconds = entry.waitUntil
    ? Math.max(0, Math.ceil((new Date(entry.waitUntil).getTime() - Date.now()) / 1000))
    : 0
  const reasons = [
    waitSeconds > 0 ? `انتظار ${waitSeconds} ث` : null,
    entry.dailyLimitReached ? `بلغ الحد اليومي (${entry.dailyLimit})` : null,
    entry.blocked ? 'مقفل بعد محاولات خاطئة' : null,
  ].filter(Boolean)
  return (
    <li className="flex items-center justify-between gap-3 py-2.5">
      <div className="min-w-0">
        <p className="truncate font-mono text-sm" dir="ltr" style={{ textAlign: 'right' }}>
          {entry.key}
        </p>
        <p className="text-[11px] text-muted">
          {entry.requestsToday} طلب اليوم · {entry.failedAttempts} محاولة خاطئة
          {reasons.length ? ` · ${reasons.join(' · ')}` : ''}
        </p>
      </div>
      <Button tone="outline" onClick={onUnlock} disabled={busy}>
        فك القفل
      </Button>
    </li>
  )
}
