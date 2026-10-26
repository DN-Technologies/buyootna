'use client'

import { useState } from 'react'
import { usePolling } from '@/lib/usePolling'
import { Card, Notice, PageTitle, Stat, UpdatedAgo } from './ui'

interface MetricsResponse {
  traffic: {
    windowMinutes: number
    totals: {
      requests: number
      clientErrors: number
      serverErrors: number
      p50Ms: number | null
      p95Ms: number | null
    }
    perMinute: { at: string; requests: number; serverErrors: number; p95Ms: number | null }[]
    slowestRoutes: { route: string; avgMs: number; maxMs: number; requests: number }[]
    failingRoutes: { route: string; serverErrors: number; clientErrors: number; requests: number }[]
  }
  platform: {
    users: { total: number; today: number; last7Days: number }
    newIdentities7Days: { individual: number; company: number; office: number }
    activeSessions: number
    appsOpenNow: number
    activeAds: number
    liveStories: number
    pendingReports: number
    paidToday: { invoices: number; amount: number }
  }
}

const WINDOWS = [
  { minutes: 15, label: '15 د' },
  { minutes: 60, label: 'ساعة' },
  { minutes: 360, label: '6 س' },
  { minutes: 1440, label: '24 س' },
]

const ms = (value: number | null) => (value == null ? '—' : `${value} ms`)
const percent = (part: number, total: number) =>
  total ? `${((part / total) * 100).toFixed(1)}%` : '0%'

/** Requests per minute as bars (server errors in red), newest on the left in RTL. */
function TrafficBars({ points }: { points: MetricsResponse['traffic']['perMinute'] }) {
  if (!points.length) {
    return <p className="py-6 text-center text-xs text-muted">لا طلبات في هذه الفترة بعد</p>
  }
  // A day has too many minutes for a phone: group them into ~60 bars
  const size = Math.max(1, Math.ceil(points.length / 60))
  const bars: { requests: number; serverErrors: number; at: string }[] = []
  for (let i = 0; i < points.length; i += size) {
    const group = points.slice(i, i + size)
    bars.push({
      at: group[0].at,
      requests: group.reduce((n, p) => n + p.requests, 0),
      serverErrors: group.reduce((n, p) => n + p.serverErrors, 0),
    })
  }
  const max = Math.max(...bars.map((b) => b.requests), 1)
  return (
    <div className="flex h-28 items-end justify-end gap-[2px]" dir="ltr">
      {bars.map((bar) => (
        <div
          key={bar.at}
          className="relative max-w-3 flex-1 rounded-t-sm bg-accent/70"
          style={{ height: `${Math.max(4, (bar.requests / max) * 100)}%` }}
          title={`${new Date(bar.at).toLocaleTimeString('ar', { numberingSystem: 'latn' })}: ${bar.requests}`}
        >
          {bar.serverErrors > 0 && (
            <div
              className="absolute inset-x-0 bottom-0 rounded-t-sm bg-down"
              style={{ height: `${(bar.serverErrors / bar.requests) * 100}%` }}
            />
          )}
        </div>
      ))}
    </div>
  )
}

function RouteList({
  title,
  rows,
}: {
  title: string
  rows: { route: string; value: string; sub: string }[]
}) {
  return (
    <Card>
      <h2 className="font-bold">{title}</h2>
      {rows.length === 0 ? (
        <p className="mt-2 text-xs text-muted">لا شيء بعد</p>
      ) : (
        <ul className="mt-2 divide-y divide-line">
          {rows.map((row) => (
            <li key={row.route} className="flex items-center justify-between gap-3 py-2">
              <span className="min-w-0 truncate font-mono text-xs" dir="ltr">
                {row.route}
              </span>
              <span className="shrink-0 text-left">
                <span className="block text-sm font-bold" dir="ltr">
                  {row.value}
                </span>
                <span className="block text-[11px] text-muted">{row.sub}</span>
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

/** المقاييس: API traffic for a chosen window, and what's happening on the platform. */
export default function MetricsView() {
  const [minutes, setMinutes] = useState(60)
  const { data, error, loading, updatedAt } = usePolling<MetricsResponse>(
    `metrics?minutes=${minutes}`,
    10_000,
  )
  const totals = data?.traffic.totals
  const platform = data?.platform

  return (
    <>
      <PageTitle title="المقاييس" subtitle="طلبات الـ API ونشاط المنصة" action={<UpdatedAgo at={updatedAt} />} />

      <div className="mb-3 flex gap-1 rounded-xl border border-line bg-surface p-1">
        {WINDOWS.map((w) => (
          <button
            key={w.minutes}
            onClick={() => setMinutes(w.minutes)}
            className={`flex-1 rounded-lg py-1.5 text-sm font-semibold ${
              minutes === w.minutes ? 'bg-accent text-primary' : 'text-muted'
            }`}
          >
            {w.label}
          </button>
        ))}
      </div>

      {error && <Notice>{error}</Notice>}
      {loading && !data && <p className="py-16 text-center text-sm text-muted">جاري التحميل...</p>}

      {totals && platform && data && (
        <div className="flex flex-col gap-3">
          <Card>
            <div className="grid grid-cols-2 gap-2">
              <Stat label="الطلبات" value={totals.requests.toLocaleString('en-US')} />
              <Stat
                label="أخطاء الخادم (5xx)"
                value={`${totals.serverErrors} · ${percent(totals.serverErrors, totals.requests)}`}
                tone={totals.serverErrors ? 'down' : undefined}
              />
              <Stat label="زمن الاستجابة p50" value={ms(totals.p50Ms)} />
              <Stat
                label="زمن الاستجابة p95"
                value={ms(totals.p95Ms)}
                tone={(totals.p95Ms ?? 0) > 1000 ? 'warn' : undefined}
              />
            </div>
            <p className="mt-3 mb-2 text-xs text-muted">الطلبات بالدقيقة (الأحمر: أخطاء 5xx)</p>
            <TrafficBars points={data.traffic.perMinute} />
            <p className="mt-2 text-[11px] text-muted">
              أخطاء العميل (4xx): {totals.clientErrors} · العدّ في الذاكرة ويبدأ من الصفر عند إعادة تشغيل الخادم
            </p>
          </Card>

          <RouteList
            title="المسارات الأبطأ"
            rows={data.traffic.slowestRoutes.map((r) => ({
              route: r.route,
              value: `${r.avgMs} ms`,
              sub: `الأقصى ${r.maxMs} ms · ${r.requests} طلب`,
            }))}
          />
          <RouteList
            title="المسارات ذات الأخطاء"
            rows={data.traffic.failingRoutes.map((r) => ({
              route: r.route,
              value: `${r.serverErrors} / ${r.clientErrors}`,
              sub: `5xx / 4xx من ${r.requests}`,
            }))}
          />

          <Card>
            <h2 className="font-bold">المنصة الآن</h2>
            <div className="mt-2 grid grid-cols-2 gap-2">
              <Stat label="التطبيقات المفتوحة الآن" value={platform.appsOpenNow} />
              <Stat label="جلسات نشطة (15 د)" value={platform.activeSessions} />
              <Stat label="مستخدمون جدد اليوم" value={platform.users.today} />
              <Stat label="آخر 7 أيام" value={platform.users.last7Days} />
              <Stat label="إجمالي المستخدمين" value={platform.users.total.toLocaleString('en-US')} />
              <Stat label="إعلانات نشطة" value={platform.activeAds} />
              <Stat label="قصص حية" value={platform.liveStories} />
              <Stat
                label="بلاغات معلّقة"
                value={platform.pendingReports}
                tone={platform.pendingReports ? 'warn' : undefined}
              />
              <Stat label="مدفوعات اليوم" value={`${platform.paidToday.invoices} · ${platform.paidToday.amount} د.ك`} />
              <Stat
                label="هويات جديدة (7 أيام)"
                value={`${platform.newIdentities7Days.individual} · ${platform.newIdentities7Days.company} · ${platform.newIdentities7Days.office}`}
              />
            </div>
            <p className="mt-2 text-[11px] text-muted">الهويات: أفراد · شركات · مكاتب</p>
          </Card>
        </div>
      )}
    </>
  )
}
