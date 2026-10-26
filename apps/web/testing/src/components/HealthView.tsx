'use client'

import Link from 'next/link'
import { ChevronLeft, Gauge, RefreshCw } from 'lucide-react'
import { usePolling } from '@/lib/usePolling'
import {
  Card,
  Notice,
  PageTitle,
  STATUS_LABEL,
  Status,
  StatusDot,
  UpdatedAgo,
} from './ui'

interface HealthCheck {
  key: string
  label: string
  status: Status
  detail: string
  latencyMs?: number
}

interface HealthResponse {
  status: Status
  checkedAt: string
  version: {
    commit: string | null
    builtAt: string | null
    environment: string
    startedAt: string
  }
  checks: HealthCheck[]
}

const BANNER: Record<Status, string> = {
  ok: 'border-ok/40 bg-ok/10 text-ok',
  warn: 'border-warn/40 bg-warn/10 text-warn',
  down: 'border-down/40 bg-down/10 text-down',
}

const SUMMARY: Record<Status, string> = {
  ok: 'كل شيء يعمل',
  warn: 'يعمل مع تنبيهات',
  down: 'هناك جزء متوقف',
}

/** الحالة: one row per part of the platform, refreshed every 15 s. */
export default function HealthView() {
  const { data, error, loading, updatedAt, reload } =
    usePolling<HealthResponse>('health', 15_000)

  return (
    <>
      <PageTitle
        title="الحالة"
        subtitle="قاعدة البيانات، الملفات، البريد، الرسائل، الخادم والمواقع"
        action={
          <button
            onClick={reload}
            className="rounded-full border border-line p-2 text-muted"
            aria-label="تحديث"
          >
            <RefreshCw className="h-4 w-4" />
          </button>
        }
      />
      {error && <Notice>{error}</Notice>}
      {loading && !data && (
        <p className="py-16 text-center text-sm text-muted">جاري الفحص...</p>
      )}
      {data && (
        <div className="flex flex-col gap-3">
          <div
            className={`rounded-2xl border px-4 py-3 ${BANNER[data.status]}`}
          >
            <div className="flex items-center gap-2 font-bold">
              <StatusDot status={data.status} />
              {SUMMARY[data.status]}
            </div>
            <p
              className="mt-1 text-xs opacity-80"
              dir="ltr"
              style={{ textAlign: 'right' }}
            >
              {data.version.environment}
              {data.version.commit ? ` · ${data.version.commit}` : ''}
            </p>
          </div>

          <Link
            href="/metrics"
            className="flex items-center justify-between rounded-2xl border border-line bg-surface px-4 py-3"
          >
            <span className="flex items-center gap-2 font-semibold">
              <Gauge className="h-4 w-4 text-accent" />
              المقاييس: الطلبات والأخطاء وزمن الاستجابة
            </span>
            <ChevronLeft className="h-4 w-4 text-muted" />
          </Link>

          <Card className="p-0">
            <ul className="divide-y divide-line">
              {data.checks.map((check) => (
                <li
                  key={check.key}
                  className="flex items-start gap-3 px-4 py-3"
                >
                  <span className="mt-1.5">
                    <StatusDot status={check.status} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold">{check.label}</p>
                      <span className="shrink-0 text-xs text-muted">
                        {STATUS_LABEL[check.status]}
                      </span>
                    </div>
                    <p className="mt-0.5 wrap-break-word text-xs text-muted">
                      {check.detail}
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          </Card>
          <div className="text-center">
            <UpdatedAgo at={updatedAt} />
          </div>
        </div>
      )}
    </>
  )
}
