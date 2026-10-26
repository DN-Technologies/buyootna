'use client'

import { useState } from 'react'
import { LogOut } from 'lucide-react'
import { usePolling } from '@/lib/usePolling'
import InstallCard from './InstallCard'
import InstallQr from './InstallQr'
import { Card, Notice, PageTitle } from './ui'

interface VersionsResponse {
  api: { commit: string | null; builtAt: string | null; environment: string; node: string; startedAt: string }
  apps: {
    platform: string
    appVersion: string
    runtime: string
    requests: number
    firstSeenAt: string
    lastSeenAt: string
  }[]
  installLinks: { ios: string | null; android: string | null }
}

interface AuditResponse {
  data: {
    id: string
    actorName: string
    action: string
    target: string | null
    ip: string | null
    createdAt: string
  }[]
  meta: { page: number; totalPages: number; total: number }
}

const ACTION_LABEL: Record<string, string> = {
  SIGN_IN: 'تسجيل دخول',
  OTP_REVEALED: 'إظهار رمز تحقق',
}

function dateTime(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('ar', {
    day: 'numeric',
    month: 'short',
    hour: 'numeric',
    minute: '2-digit',
    numberingSystem: 'latn',
  })
}

/** المزيد: builds (API and app), install links, the portal's audit log, sign out. */
export default function MoreView({ name }: { name: string }) {
  const versions = usePolling<VersionsResponse>('versions', 60_000)
  const [page, setPage] = useState(1)
  const audit = usePolling<AuditResponse>(`audit?page=${page}&limit=20`, 30_000)

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  const api = versions.data?.api
  const links = versions.data?.installLinks

  return (
    <>
      <PageTitle title="المزيد" subtitle={`مسجّل باسم ${name}`} />
      <div className="flex flex-col gap-3">
        <InstallCard />

        <Card>
          <h2 className="font-bold">نسخة الخادم</h2>
          {versions.error && <Notice>{versions.error}</Notice>}
          {api && (
            <dl className="mt-2 grid grid-cols-2 gap-y-1.5 text-sm">
              <dt className="text-muted">البيئة</dt>
              <dd dir="ltr" className="text-left">{api.environment}</dd>
              <dt className="text-muted">الـ commit</dt>
              <dd dir="ltr" className="text-left font-mono">{api.commit ?? '—'}</dd>
              <dt className="text-muted">وقت البناء</dt>
              <dd className="text-left">{dateTime(api.builtAt)}</dd>
              <dt className="text-muted">يعمل منذ</dt>
              <dd className="text-left">{dateTime(api.startedAt)}</dd>
            </dl>
          )}
        </Card>

        <Card>
          <h2 className="font-bold">نسخ التطبيق المستخدمة</h2>
          <p className="mt-0.5 text-xs text-muted">من الطلبات التي يرسلها التطبيق (آخر 50)</p>
          {versions.data && versions.data.apps.length === 0 && (
            <p className="mt-2 text-xs text-muted">لم تصل طلبات من نسخة تُرسل رقمها بعد</p>
          )}
          <ul className="mt-2 divide-y divide-line">
            {versions.data?.apps.map((app) => (
              <li key={`${app.platform}-${app.appVersion}-${app.runtime}`} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-semibold" dir="ltr" style={{ textAlign: 'right' }}>
                    {app.platform} {app.appVersion}
                  </p>
                  <p className="text-[11px] text-muted" dir="ltr" style={{ textAlign: 'right' }}>
                    runtime {app.runtime}
                  </p>
                </div>
                <div className="text-left text-xs text-muted">
                  <p>{app.requests.toLocaleString('en-US')} طلب</p>
                  <p>آخر ظهور {dateTime(app.lastSeenAt)}</p>
                </div>
              </li>
            ))}
          </ul>
        </Card>

        {links && (links.ios || links.android) && (
          <Card>
            <h2 className="font-bold">تثبيت نسخ الاختبار</h2>
            <div className="mt-2 flex flex-col gap-2">
              {links.ios && <InstallQr label="iOS (TestFlight)" url={links.ios} />}
              {links.android && <InstallQr label="Android" url={links.android} />}
            </div>
          </Card>
        )}

        <Card>
          <h2 className="font-bold">سجل البوابة</h2>
          <p className="mt-0.5 text-xs text-muted">من فعل ماذا هنا</p>
          <ul className="mt-2 divide-y divide-line">
            {audit.data?.data.map((row) => (
              <li key={row.id} className="py-2 text-sm">
                <div className="flex items-center justify-between gap-2">
                  <span className="font-semibold">{row.actorName}</span>
                  <span className="text-[11px] text-muted">{dateTime(row.createdAt)}</span>
                </div>
                <p className="text-xs text-muted">
                  {ACTION_LABEL[row.action] ?? row.action}
                  {row.target ? ` · ${row.target}` : ''}
                </p>
              </li>
            ))}
          </ul>
          {audit.data && audit.data.meta.totalPages > 1 && (
            <div className="mt-2 flex items-center justify-between text-xs">
              <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="text-accent disabled:opacity-40">
                السابق
              </button>
              <span className="text-muted">
                {page} / {audit.data.meta.totalPages}
              </span>
              <button
                disabled={page >= audit.data.meta.totalPages}
                onClick={() => setPage(page + 1)}
                className="text-accent disabled:opacity-40"
              >
                التالي
              </button>
            </div>
          )}
        </Card>

        <button
          onClick={signOut}
          className="flex items-center justify-center gap-2 rounded-2xl border border-down/40 py-3 font-semibold text-down"
        >
          <LogOut className="h-4 w-4" />
          تسجيل الخروج
        </button>
      </div>
    </>
  )
}
