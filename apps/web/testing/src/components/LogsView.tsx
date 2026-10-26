'use client'

import { useEffect, useState } from 'react'
import { Pause, Play, Search, X } from 'lucide-react'
import { usePolling } from '@/lib/usePolling'
import { Notice, PageTitle, UpdatedAgo } from './ui'

interface LogEntry {
  id: number
  at: string
  level: 'log' | 'error' | 'warn' | 'debug' | 'verbose' | 'fatal'
  context: string | null
  message: string
  requestId: string | null
  stack: string | null
}

const LEVELS = [
  { value: '', label: 'الكل' },
  { value: 'error', label: 'أخطاء' },
  { value: 'warn', label: 'تنبيهات' },
  { value: 'log', label: 'معلومات' },
]

const LEVEL_STYLE: Record<string, string> = {
  error: 'text-down',
  fatal: 'text-down',
  warn: 'text-warn',
  log: 'text-ok',
  debug: 'text-muted',
  verbose: 'text-muted',
}

function time(iso: string) {
  return new Date(iso).toLocaleTimeString('ar', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    numberingSystem: 'latn',
  })
}

/** السجلات: the API's newest log lines, live, filterable by level, text or request. */
export default function LogsView() {
  const [level, setLevel] = useState('')
  const [search, setSearch] = useState('')
  const [q, setQ] = useState('')
  const [live, setLive] = useState(true)
  const [open, setOpen] = useState<number | null>(null)

  // Ask the server once typing pauses
  useEffect(() => {
    const timer = setTimeout(() => setQ(search.trim()), 400)
    return () => clearTimeout(timer)
  }, [search])

  const params = new URLSearchParams({ limit: '200' })
  if (level) params.set('level', level)
  if (q) params.set('q', q)
  const { data, error, loading, updatedAt } = usePolling<{ data: LogEntry[] }>(
    `logs?${params.toString()}`,
    live ? 5_000 : 0,
  )

  return (
    <>
      <PageTitle
        title="السجلات"
        subtitle="آخر 3000 سطر من خادم الـ API"
        action={
          <button
            onClick={() => setLive((v) => !v)}
            className={`flex items-center gap-1 rounded-full border px-3 py-1.5 text-xs font-semibold ${
              live ? 'border-ok/50 text-ok' : 'border-line text-muted'
            }`}
          >
            {live ? <Pause className="h-3.5 w-3.5" /> : <Play className="h-3.5 w-3.5" />}
            {live ? 'مباشر' : 'متوقف'}
          </button>
        }
      />

      <div className="sticky top-0 z-10 -mx-4 mb-3 bg-[#0a1118]/95 px-4 pb-2 pt-1 backdrop-blur">
        <div className="relative">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="ابحث في النص أو برقم الطلب"
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
        <div className="mt-2 flex gap-1.5 overflow-x-auto">
          {LEVELS.map((l) => (
            <button
              key={l.value}
              onClick={() => setLevel(l.value)}
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                level === l.value ? 'bg-accent text-primary' : 'border border-line text-muted'
              }`}
            >
              {l.label}
            </button>
          ))}
          <span className="mr-auto self-center">
            <UpdatedAgo at={updatedAt} />
          </span>
        </div>
      </div>

      {error && <Notice>{error}</Notice>}
      {loading && !data && <p className="py-16 text-center text-sm text-muted">جاري التحميل...</p>}
      {data && data.data.length === 0 && (
        <p className="py-16 text-center text-sm text-muted">لا توجد سطور مطابقة</p>
      )}

      <ul className="flex flex-col gap-1.5">
        {data?.data.map((entry) => (
          <li key={entry.id} className="rounded-xl border border-line bg-surface px-3 py-2">
            <button className="w-full text-right" onClick={() => setOpen(open === entry.id ? null : entry.id)}>
              <div className="flex items-center gap-2 text-[11px]">
                <span className={`font-bold uppercase ${LEVEL_STYLE[entry.level] ?? ''}`} dir="ltr">
                  {entry.level}
                </span>
                {entry.context && <span className="truncate text-muted" dir="ltr">{entry.context}</span>}
                <span className="mr-auto shrink-0 text-muted">{time(entry.at)}</span>
              </div>
              <p
                className={`mt-1 break-words font-mono text-xs ${open === entry.id ? '' : 'line-clamp-3'}`}
                dir="auto"
              >
                {entry.message}
              </p>
            </button>
            {open === entry.id && entry.stack && (
              <pre className="mt-2 max-h-64 overflow-auto rounded-lg bg-primary p-2 text-[10px] text-muted" dir="ltr">
                {entry.stack}
              </pre>
            )}
            {entry.requestId && (
              <button
                onClick={() => setSearch(entry.requestId!)}
                className="mt-1 font-mono text-[11px] text-accent"
                dir="ltr"
              >
                #{entry.requestId}
              </button>
            )}
          </li>
        ))}
      </ul>
    </>
  )
}
