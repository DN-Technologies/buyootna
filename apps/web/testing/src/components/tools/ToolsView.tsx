'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft, Database, UserPlus } from 'lucide-react'
import { usePolling } from '@/lib/usePolling'
import { mutate } from '@/lib/mutate'
import { Card, Notice, PageTitle } from '../ui'
import {
  APPROVAL_LABEL,
  CooldownEntry,
  CooldownRow,
  PERSONA_LABEL,
  PersonaType,
  SearchBox,
} from './shared'

interface AccountRow {
  id: string
  email: string | null
  phone: string | null
  name: string | null
  isBlocked: boolean
  isDisabled: boolean
  identities: {
    id: string
    type: PersonaType
    name: string | null
    status: string | null
  }[]
}

export function useDebounced(value: string, ms = 400) {
  const [debounced, setDebounced] = useState(value.trim())
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value.trim()), ms)
    return () => clearTimeout(timer)
  }, [value, ms])
  return debounced
}

/** الأدوات: find an account, add one, and unlock OTP cooldowns. */
export default function ToolsView() {
  const [search, setSearch] = useState('')
  const q = useDebounced(search)
  const accounts = usePolling<{ data: AccountRow[] }>(
    q.length >= 2 ? `accounts?q=${encodeURIComponent(q)}` : null,
    0,
  )

  const [cooldownSearch, setCooldownSearch] = useState('')
  const cq = useDebounced(cooldownSearch)
  const cooldowns = usePolling<{ data: CooldownEntry[] }>(
    `cooldowns${cq ? `?q=${encodeURIComponent(cq)}` : ''}`,
    10_000,
  )
  const [busyKey, setBusyKey] = useState<string | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const unlock = async (key: string) => {
    setBusyKey(key)
    setNotice(null)
    try {
      await mutate('cooldowns/unlock', 'POST', { key })
      setNotice(`فُك القفل عن ${key}`)
      await cooldowns.reload()
    } catch (error) {
      setNotice((error as Error).message)
    } finally {
      setBusyKey(null)
    }
  }

  return (
    <>
      <PageTitle
        title="الأدوات"
        subtitle="الحسابات، الباقات، البيانات التجريبية والرموز"
        action={
          <Link
            href="/tools/new"
            className="flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-primary"
          >
            <UserPlus className="h-4 w-4" />
            إضافة حساب
          </Link>
        }
      />

      <div className="flex flex-col gap-3">
        <Card>
          <h2 className="mb-2 font-bold">الحسابات</h2>
          <SearchBox
            value={search}
            onChange={setSearch}
            placeholder="بريد، رقم هاتف، أو اسم (فرد / شركة / مكتب)"
          />
          {q.length >= 2 && accounts.loading && (
            <p className="mt-3 text-center text-xs text-muted">جاري البحث...</p>
          )}
          {accounts.error && (
            <div className="mt-2">
              <Notice>{accounts.error}</Notice>
            </div>
          )}
          {q.length >= 2 &&
            accounts.data &&
            accounts.data.data.length === 0 && (
              <p className="mt-3 text-center text-xs text-muted">
                لا توجد حسابات مطابقة
              </p>
            )}
          <ul className="mt-2 divide-y divide-line">
            {q.length >= 2 &&
              accounts.data?.data.map((account) => (
                <li key={account.id}>
                  <Link
                    href={`/tools/accounts/${account.id}`}
                    className="flex items-center justify-between gap-3 py-3"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {account.name ?? account.email ?? account.phone}
                      </p>
                      <p
                        className="truncate font-mono text-xs text-muted"
                        dir="ltr"
                        style={{ textAlign: 'right' }}
                      >
                        {[account.email, account.phone]
                          .filter(Boolean)
                          .join(' · ')}
                      </p>
                      <p className="mt-1 flex flex-wrap gap-1">
                        {account.identities.map((i) => (
                          <span
                            key={i.id}
                            className="rounded-full bg-primary px-2 py-0.5 text-[10px] text-muted"
                          >
                            {PERSONA_LABEL[i.type]}
                            {i.type !== 'INDIVIDUAL' && i.name
                              ? ` · ${i.name}`
                              : ''}
                            {i.status && i.status !== 'APPROVED'
                              ? ` · ${APPROVAL_LABEL[i.status] ?? i.status}`
                              : ''}
                          </span>
                        ))}
                        {(account.isBlocked || account.isDisabled) && (
                          <span className="rounded-full bg-down/15 px-2 py-0.5 text-[10px] text-down">
                            {account.isBlocked ? 'محظور' : 'موقوف'}
                          </span>
                        )}
                      </p>
                    </div>
                    <ChevronLeft className="h-4 w-4 shrink-0 text-muted" />
                  </Link>
                </li>
              ))}
          </ul>
        </Card>

        <Card>
          <h2 className="font-bold">قفل رموز التحقق</h2>
          <p className="mb-2 mt-0.5 text-xs text-muted">
            من ينتظر قبل طلب رمز جديد، أو بلغ الحد اليومي، أو أُقفل بعد محاولات
            خاطئة.
          </p>
          <SearchBox
            value={cooldownSearch}
            onChange={setCooldownSearch}
            placeholder="بريد أو رقم هاتف"
          />
          {notice && <p className="mt-2 text-xs text-accent">{notice}</p>}
          {cooldowns.data && cooldowns.data.data.length === 0 && (
            <p className="mt-3 text-center text-xs text-muted">
              لا يوجد قفل حالياً
            </p>
          )}
          <ul className="mt-1 divide-y divide-line">
            {cooldowns.data?.data.map((entry) => (
              <CooldownRow
                key={entry.key}
                entry={entry}
                busy={busyKey === entry.key}
                onUnlock={() => unlock(entry.key)}
              />
            ))}
          </ul>
        </Card>

        <Link
          href="/tools/database"
          className="flex items-center justify-between gap-3 rounded-2xl border border-down/40 bg-surface p-4"
        >
          <div className="flex items-center gap-3">
            <Database className="h-5 w-5 text-down" />
            <div>
              <p className="font-bold">قاعدة البيانات</p>
              <p className="text-xs text-muted">تعبئة بيانات التطوير، أو مسح كل البيانات</p>
            </div>
          </div>
          <ChevronLeft className="h-4 w-4 shrink-0 text-muted" />
        </Link>
      </div>
    </>
  )
}
