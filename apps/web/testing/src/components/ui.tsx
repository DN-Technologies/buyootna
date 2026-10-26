import type { ReactNode } from 'react'

export type Status = 'ok' | 'warn' | 'down'

export const STATUS_COLOR: Record<Status, string> = {
  ok: 'bg-ok',
  warn: 'bg-warn',
  down: 'bg-down',
}

export const STATUS_LABEL: Record<Status, string> = {
  ok: 'يعمل',
  warn: 'تنبيه',
  down: 'متوقف',
}

export function StatusDot({ status }: { status: Status }) {
  return <span className={`inline-block size-2.5 shrink-0 rounded-full ${STATUS_COLOR[status]}`} />
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <section className={`rounded-2xl border border-line bg-surface p-4 ${className}`}>{children}</section>
}

export function PageTitle({
  title,
  subtitle,
  action,
}: {
  title: string
  subtitle?: string
  action?: ReactNode
}) {
  return (
    <header className="mb-4 flex items-start justify-between gap-3">
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        {subtitle && <p className="mt-0.5 text-xs text-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  )
}

export function Stat({ label, value, tone }: { label: string; value: ReactNode; tone?: Status }) {
  const color = tone === 'down' ? 'text-down' : tone === 'warn' ? 'text-warn' : 'text-white'
  return (
    <div className="rounded-xl bg-primary px-3 py-2.5">
      <p className="text-xs text-muted">{label}</p>
      <p className={`mt-0.5 text-lg font-bold ${color}`} dir="ltr" style={{ textAlign: 'right' }}>
        {value}
      </p>
    </div>
  )
}

export function Notice({ children, tone = 'down' }: { children: ReactNode; tone?: Status }) {
  const border = tone === 'down' ? 'border-down/40 text-down' : 'border-warn/40 text-warn'
  return <p className={`rounded-xl border px-3 py-2 text-sm ${border}`}>{children}</p>
}

/** «آخر تحديث قبل 5 ث»: tells the tester the screen is live. */
export function UpdatedAgo({ at }: { at: Date | null }) {
  if (!at) return null
  return (
    <span className="text-[11px] text-muted">
      آخر تحديث {at.toLocaleTimeString('ar', { hour: 'numeric', minute: '2-digit', second: '2-digit', numberingSystem: 'latn' })}
    </span>
  )
}
