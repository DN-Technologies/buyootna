'use client'

import { useEffect, useState } from 'react'
import { Check, Copy, Eye, Mail, MessageSquare, Search, X } from 'lucide-react'
import { usePolling } from '@/lib/usePolling'
import { Notice, PageTitle, UpdatedAgo } from './ui'

interface OtpItem {
  id: string
  channel: 'EMAIL' | 'SMS'
  purpose: string
  recipient: string
  provider: 'resend' | 'mock-mail' | 'twilio' | 'mock-sms'
  sentAt: string
  expiresAt: string
  status: 'PENDING' | 'USED' | 'REPLACED' | 'EXPIRED'
  hasCode: boolean
}

const PURPOSE: Record<string, string> = {
  SIGNUP: 'إنشاء حساب',
  PASSWORD_RESET: 'استعادة كلمة المرور',
  PASSWORD_CHANGE: 'تغيير كلمة المرور',
  RECOVERY: 'استعادة الحساب',
  ACCOUNT_SUSPEND: 'تعطيل الحساب',
  EMAIL_CHANGE: 'تغيير البريد',
  PHONE_CHANGE: 'تغيير رقم الهاتف',
  CONTACT_PHONE: 'رقم التواصل',
  OTHER: 'رمز تحقق',
}

const STATUS: Record<OtpItem['status'], { label: string; style: string }> = {
  PENDING: { label: 'صالح', style: 'bg-ok/15 text-ok' },
  USED: { label: 'استُخدم', style: 'bg-line text-muted' },
  REPLACED: { label: 'استُبدل برمز أحدث', style: 'bg-line text-muted' },
  EXPIRED: { label: 'انتهت صلاحيته', style: 'bg-line text-muted' },
}

const SHOW_FOR_MS = 60_000

function minutesLeft(iso: string, now: number) {
  const ms = new Date(iso).getTime() - now
  if (ms <= 0) return null
  const m = Math.floor(ms / 60_000)
  const s = Math.floor((ms % 60_000) / 1000)
  return `${m}:${String(s).padStart(2, '0')}`
}

function sentAgo(iso: string, now: number) {
  const min = Math.floor((now - new Date(iso).getTime()) / 60_000)
  return min < 1 ? 'الآن' : `قبل ${min} د`
}

/** One code: hidden until «إظهار الرمز» (written to the audit log), then hidden again. */
function OtpCard({ item, now }: { item: OtpItem; now: number }) {
  const [code, setCode] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (!code) return
    const timer = setTimeout(() => setCode(null), SHOW_FOR_MS)
    return () => clearTimeout(timer)
  }, [code])

  // The code stopped being valid (used / replaced / expired): hide it
  useEffect(() => {
    if (!item.hasCode) setCode(null)
  }, [item.hasCode])

  const reveal = async () => {
    setBusy(true)
    setError(null)
    try {
      const res = await fetch(`/api/t/otps/${item.id}/reveal`, { method: 'POST' })
      const body = (await res.json()) as { code?: string | null; message?: string }
      if (!res.ok) setError(body.message ?? 'تعذر إظهار الرمز')
      else if (!body.code) setError('لم يعد هذا الرمز صالحاً')
      else setCode(body.code)
    } catch {
      setError('تعذر الاتصال')
    } finally {
      setBusy(false)
    }
  }

  const copy = async () => {
    if (!code) return
    await navigator.clipboard?.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  const Icon = item.channel === 'EMAIL' ? Mail : MessageSquare
  const left = item.status === 'PENDING' ? minutesLeft(item.expiresAt, now) : null
  const realTwilio = item.provider === 'twilio'

  return (
    <li className={`rounded-2xl border border-line bg-surface p-4 ${item.status === 'PENDING' ? '' : 'opacity-60'}`}>
      <div className="flex items-start gap-3">
        <span className="mt-0.5 rounded-xl bg-primary p-2 text-accent">
          <Icon className="h-4 w-4" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <p className="font-bold">{PURPOSE[item.purpose] ?? item.purpose}</p>
            <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS[item.status].style}`}>
              {STATUS[item.status].label}
            </span>
          </div>
          <p className="mt-0.5 truncate font-mono text-sm" dir="ltr" style={{ textAlign: 'right' }}>
            {item.recipient}
          </p>
          <p className="mt-0.5 text-[11px] text-muted">
            {sentAgo(item.sentAt, now)}
            {left && ` · ينتهي خلال ${left}`}
            {item.provider.startsWith('mock') && ' · وضع تجريبي'}
          </p>
        </div>
      </div>

      {code ? (
        <div className="mt-3 flex items-center justify-between rounded-xl bg-primary px-4 py-3">
          <span className="font-mono text-3xl font-bold tracking-[0.3em]" dir="ltr">
            {code}
          </span>
          <div className="flex gap-1">
            <button onClick={copy} className="rounded-full p-2 text-accent" aria-label="نسخ">
              {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
            </button>
            <button onClick={() => setCode(null)} className="rounded-full p-2 text-muted" aria-label="إخفاء">
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      ) : item.hasCode ? (
        <button
          onClick={reveal}
          disabled={busy}
          className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-accent/40 py-2.5 text-sm font-bold text-accent disabled:opacity-60"
        >
          <Eye className="h-4 w-4" />
          {busy ? 'جاري الإظهار...' : 'إظهار الرمز'}
        </button>
      ) : realTwilio && item.status === 'PENDING' ? (
        <p className="mt-3 text-xs text-muted">
          أُرسل عبر Twilio Verify برمز صنعه Twilio (الرموز المخصصة غير مفعّلة في حساب Twilio)، فلا يمكن إظهاره.
        </p>
      ) : null}
      {error && <p className="mt-2 text-xs text-down">{error}</p>}
    </li>
  )
}

/** الرموز: the OTPs sent in the last 30 minutes; each code hidden until tapped. */
export default function OtpView() {
  const [search, setSearch] = useState('')
  const [q, setQ] = useState('')
  const [now, setNow] = useState(() => Date.now())

  useEffect(() => {
    const timer = setTimeout(() => setQ(search.trim()), 400)
    return () => clearTimeout(timer)
  }, [search])

  // The countdowns tick every second
  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(timer)
  }, [])

  const { data, error, loading, updatedAt } = usePolling<{ data: OtpItem[] }>(
    q ? `otps?q=${encodeURIComponent(q)}` : 'otps',
    5_000,
  )

  return (
    <>
      <PageTitle
        title="الرموز"
        subtitle="رموز التحقق المرسلة خلال آخر 30 دقيقة"
        action={<UpdatedAgo at={updatedAt} />}
      />
      <p className="mb-3 rounded-xl border border-warn/30 bg-warn/5 px-3 py-2 text-xs text-warn">
        كل إظهار لرمز يُسجَّل باسمك. الرمز يختفي بعد استخدامه أو انتهاء صلاحيته.
      </p>

      <div className="relative mb-3">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="ابحث بالبريد أو رقم الهاتف"
          inputMode="email"
          className="w-full rounded-xl border border-line bg-surface py-2.5 pl-9 pr-9 text-sm outline-none focus:border-accent"
        />
        <Search className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
            aria-label="مسح"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {error && <Notice>{error}</Notice>}
      {loading && !data && <p className="py-16 text-center text-sm text-muted">جاري التحميل...</p>}
      {data && data.data.length === 0 && (
        <p className="py-16 text-center text-sm text-muted">
          لا توجد رموز مرسلة{q ? ' لهذا البحث' : ' خلال آخر 30 دقيقة'}
        </p>
      )}
      <ul className="flex flex-col gap-2">
        {data?.data.map((item) => <OtpCard key={item.id} item={item} now={now} />)}
      </ul>
    </>
  )
}
