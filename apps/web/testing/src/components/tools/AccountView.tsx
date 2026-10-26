'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Minus, Plus } from 'lucide-react'
import { usePolling } from '@/lib/usePolling'
import { mutate } from '@/lib/mutate'
import { Card, Notice } from '../ui'
import {
  APPROVAL_LABEL,
  Button,
  CooldownEntry,
  CooldownRow,
  PERSONA_LABEL,
  PersonaType,
} from './shared'

interface Wallet {
  freeAdsRemaining: number
  history: {
    id: string
    planName: string
    status: string
    adsRemaining: number
    dateText: string
  }[]
}

interface Identity {
  id: string
  type: PersonaType
  name: string | null
  status: string | null
  licenseNumber: string | null
  freeAdsRemaining: number
  wallet: Wallet
}

interface Account {
  id: string
  email: string | null
  phone: string | null
  name: string | null
  isBlocked: boolean
  isDisabled: boolean
  createdAt: string
  activeSessions: number
  identities: Identity[]
  cooldowns: CooldownEntry[]
}

interface Plan {
  id: string
  name: string
  maxActiveAds: number
}

const DEMO = [
  { command: 'all', label: 'كل حالات النبض', hint: 'عرض، إعلان ينتهي، مطابقة تنبيه، قصة' },
  { command: 'company', label: 'الشركة', hint: 'فاتورة متأخرة، طلبات، عرض مقبول، قصة' },
  { command: 'office', label: 'المكتب', hint: 'إعلان ينتهي غداً، قصة' },
  { command: 'studio', label: 'الاستوديو', hint: 'قصص سابقة ومميزات' },
] as const

/** Free ads, plan slots and «منح باقة» for one persona. */
function CreditsEditor({
  identity,
  plans,
  onChanged,
}: {
  identity: Identity
  plans: Plan[]
  onChanged: () => void
}) {
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)
  const [planId, setPlanId] = useState('')
  const [ads, setAds] = useState('')

  const run = async (action: () => Promise<unknown>, done: string) => {
    setBusy(true)
    setMessage(null)
    try {
      await action()
      setMessage(done)
      onChanged()
    } catch (error) {
      setMessage((error as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const free = identity.wallet.freeAdsRemaining
  const setFree = (value: number) =>
    run(
      () => mutate(`identities/${identity.id}/free-ads`, 'PUT', { freeAdsRemaining: value }),
      `الإعلانات المجانية: ${value}`,
    )

  return (
    <div className="mt-3 flex flex-col gap-3 border-t border-line pt-3">
      <div className="flex items-center justify-between">
        <span className="text-sm text-muted">إعلانات مجانية</span>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFree(Math.max(0, free - 1))}
            disabled={busy || free === 0}
            className="rounded-full border border-line p-1.5 disabled:opacity-40"
            aria-label="أقل"
          >
            <Minus className="h-4 w-4" />
          </button>
          <span className="w-6 text-center font-bold">{free}</span>
          <button
            onClick={() => setFree(free + 1)}
            disabled={busy}
            className="rounded-full border border-line p-1.5 disabled:opacity-40"
            aria-label="أكثر"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
      </div>

      {identity.wallet.history.length > 0 && (
        <ul className="divide-y divide-line rounded-xl bg-primary px-3">
          {identity.wallet.history.map((slot) => (
            <li key={slot.id} className="flex items-center justify-between gap-2 py-2">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{slot.planName}</p>
                <p className="text-[11px] text-muted">
                  {slot.status === 'ACTIVE' ? `${slot.adsRemaining} إعلان متبقٍ` : 'انتهت'} · {slot.dateText}
                </p>
              </div>
              {slot.status === 'ACTIVE' && (
                <div className="flex gap-1">
                  <Button
                    tone="outline"
                    disabled={busy}
                    onClick={() => {
                      const value = window.prompt('عدد الإعلانات المتبقية', String(slot.adsRemaining))
                      if (value === null || !/^\d+$/.test(value)) return
                      run(
                        () => mutate(`slots/${slot.id}`, 'PATCH', { adsRemaining: Number(value) }),
                        'عُدّلت الباقة',
                      )
                    }}
                  >
                    تعديل
                  </Button>
                  <Button
                    tone="danger"
                    disabled={busy}
                    onClick={() =>
                      run(
                        () => mutate(`slots/${slot.id}`, 'PATCH', { status: 'EXHAUSTED', adsRemaining: 0 }),
                        'أُنهيت الباقة',
                      )
                    }
                  >
                    إنهاء
                  </Button>
                </div>
              )}
            </li>
          ))}
        </ul>
      )}

      {plans.length > 0 ? (
        <div className="flex gap-2">
          <select
            value={planId}
            onChange={(e) => setPlanId(e.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-line bg-primary px-2 py-2 text-sm text-white outline-none focus:border-accent"
          >
            <option value="">اختر باقة لمنحها</option>
            {plans.map((plan) => (
              <option key={plan.id} value={plan.id}>
                {plan.name} ({plan.maxActiveAds} إعلانات)
              </option>
            ))}
          </select>
          <input
            value={ads}
            onChange={(e) => setAds(e.target.value.replace(/\D/g, ''))}
            placeholder="العدد"
            inputMode="numeric"
            className="w-16 shrink-0 rounded-xl border border-line bg-primary px-2 py-2 text-center text-sm text-white outline-none focus:border-accent"
          />
          <Button
            disabled={busy || !planId}
            onClick={() =>
              run(
                () =>
                  mutate(`identities/${identity.id}/plans`, 'POST', {
                    planId,
                    ...(ads ? { adsRemaining: Number(ads) } : {}),
                  }),
                'مُنحت الباقة',
              )
            }
          >
            منح
          </Button>
        </div>
      ) : (
        <p className="text-xs text-muted">لا توجد باقات مفعّلة لمنحها</p>
      )}
      {message && <p className="text-xs text-accent">{message}</p>}
    </div>
  )
}

/** One account: its identities, credits, demo data and OTP cooldowns. */
export default function AccountView({ id }: { id: string }) {
  const account = usePolling<Account>(`accounts/${id}`, 0)
  const plans = usePolling<Plan[]>('plans', 0)
  const [busy, setBusy] = useState<string | null>(null)
  const [demoLines, setDemoLines] = useState<string[] | null>(null)
  const [error, setError] = useState<string | null>(null)

  const runDemo = async (command: string) => {
    if (command === 'clear' && !window.confirm('حذف كل البيانات التجريبية (لكل الحسابات)؟')) return
    setBusy(command)
    setError(null)
    try {
      const res = await mutate<{ lines: string[] }>(`accounts/${id}/demo`, 'POST', { command })
      setDemoLines(res.lines)
      await account.reload()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const unlock = async (key: string) => {
    setBusy(key)
    try {
      await mutate('cooldowns/unlock', 'POST', { key })
      await account.reload()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  const data = account.data

  return (
    <>
      <Link href="/tools" className="mb-3 flex items-center gap-1 text-sm text-muted">
        <ChevronRight className="h-4 w-4" />
        الأدوات
      </Link>
      {account.error && <Notice>{account.error}</Notice>}
      {account.loading && !data && <p className="py-16 text-center text-sm text-muted">جاري التحميل...</p>}
      {data && (
        <div className="flex flex-col gap-3">
          <Card>
            <h1 className="text-xl font-bold">{data.name ?? data.email ?? data.phone}</h1>
            <p className="mt-1 font-mono text-sm text-muted" dir="ltr" style={{ textAlign: 'right' }}>
              {[data.email, data.phone].filter(Boolean).join(' · ')}
            </p>
            <p className="mt-1 text-xs text-muted">
              {data.activeSessions} جلسة نشطة
              {data.isBlocked ? ' · محظور' : data.isDisabled ? ' · موقوف' : ''}
            </p>
          </Card>

          {data.identities.map((identity) => (
            <Card key={identity.id}>
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-bold">
                    {PERSONA_LABEL[identity.type]}
                    {identity.name ? ` · ${identity.name}` : ''}
                  </p>
                  {identity.licenseNumber && (
                    <p className="text-xs text-muted" dir="ltr" style={{ textAlign: 'right' }}>
                      {identity.licenseNumber}
                    </p>
                  )}
                </div>
                {identity.status && (
                  <span
                    className={`rounded-full px-2 py-0.5 text-[11px] ${
                      identity.status === 'APPROVED' ? 'bg-ok/15 text-ok' : 'bg-warn/15 text-warn'
                    }`}
                  >
                    {APPROVAL_LABEL[identity.status] ?? identity.status}
                  </span>
                )}
              </div>
              <CreditsEditor identity={identity} plans={plans.data ?? []} onChanged={account.reload} />
            </Card>
          ))}

          <Card>
            <h2 className="font-bold">بيانات تجريبية</h2>
            <p className="mt-0.5 text-xs text-muted">
              تملأ الحساب لعرض النبض والاستوديو. الشركة والمكتب يُنشآن إن لم يكونا موجودين.
            </p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              {DEMO.map((demo) => (
                <button
                  key={demo.command}
                  onClick={() => runDemo(demo.command)}
                  disabled={busy !== null}
                  className="rounded-xl border border-line bg-primary p-3 text-right disabled:opacity-50"
                >
                  <p className="text-sm font-bold">{busy === demo.command ? 'جاري...' : demo.label}</p>
                  <p className="mt-0.5 text-[11px] text-muted">{demo.hint}</p>
                </button>
              ))}
            </div>
            <div className="mt-2">
              <Button tone="danger" disabled={busy !== null} onClick={() => runDemo('clear')}>
                حذف كل البيانات التجريبية
              </Button>
            </div>
            {demoLines && (
              <div className="mt-3 rounded-xl bg-primary p-3 text-[11px] text-muted">
                {demoLines.map((line, i) => (
                  // Each line in its own direction: English with Arabic names
                  <p key={i} dir="auto" className="whitespace-pre-wrap">
                    {line.trim()}
                  </p>
                ))}
              </div>
            )}
            {error && <p className="mt-2 text-xs text-down">{error}</p>}
          </Card>

          <Card>
            <h2 className="font-bold">قفل رموز التحقق لهذا الحساب</h2>
            {data.cooldowns.length === 0 ? (
              <p className="mt-1 text-xs text-muted">لا يوجد قفل</p>
            ) : (
              <ul className="mt-1 divide-y divide-line">
                {data.cooldowns.map((entry) => (
                  <CooldownRow
                    key={entry.key}
                    entry={entry}
                    busy={busy === entry.key}
                    onUnlock={() => unlock(entry.key)}
                  />
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </>
  )
}
