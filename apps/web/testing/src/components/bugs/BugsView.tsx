'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Image as ImageIcon, MessageSquare, Plus } from 'lucide-react'
import { usePolling } from '@/lib/usePolling'
import { Notice, PageTitle } from '../ui'
import { SearchBox } from '../tools/shared'
import { useDebounced } from '../tools/ToolsView'
import { Bug, BugStatus, SEVERITY, STATUS, areaLabel, timeAgo } from './labels'

const FILTERS: ({ value: '' } | { value: BugStatus })[] = [
  { value: '' },
  { value: 'NEW' },
  { value: 'IN_PROGRESS' },
  { value: 'RESOLVED' },
  { value: 'NOT_A_BUG' },
]

/** الأخطاء: the bugs testers reported, newest first. */
export default function BugsView() {
  const [status, setStatus] = useState<'' | BugStatus>('')
  const [search, setSearch] = useState('')
  const q = useDebounced(search)
  const params = new URLSearchParams()
  if (status) params.set('status', status)
  if (q) params.set('q', q)
  const query = params.toString()
  const { data, error, loading } = usePolling<{
    data: Bug[]
    counts: Partial<Record<BugStatus, number>>
  }>(`bugs${query ? `?${query}` : ''}`, 15_000)

  const total = data
    ? Object.values(data.counts).reduce((n, c) => n + (c ?? 0), 0)
    : 0

  return (
    <>
      <PageTitle
        title="الأخطاء"
        subtitle="ما وجده فريق الاختبار، مع الصور والتعليقات"
        action={
          <Link
            href="/bugs/new"
            className="flex items-center gap-1 rounded-full bg-accent px-3 py-1.5 text-xs font-bold text-primary"
          >
            <Plus className="h-4 w-4" />
            إبلاغ
          </Link>
        }
      />

      <div className="mb-3 flex gap-1.5 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f.value || 'all'}
            onClick={() => setStatus(f.value)}
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
              status === f.value
                ? 'bg-accent text-primary'
                : 'border border-line text-muted'
            }`}
          >
            {f.value ? STATUS[f.value].label : 'الكل'}
            {data && ` (${f.value ? (data.counts[f.value] ?? 0) : total})`}
          </button>
        ))}
      </div>
      <div className="mb-3">
        <SearchBox
          value={search}
          onChange={setSearch}
          placeholder="ابحث في العنوان أو الخطوات أو المُبلغ"
        />
      </div>

      {error && <Notice>{error}</Notice>}
      {loading && !data && (
        <p className="py-16 text-center text-sm text-muted">جاري التحميل...</p>
      )}
      {data && data.data.length === 0 && (
        <p className="py-16 text-center text-sm text-muted">
          لا توجد أخطاء هنا
        </p>
      )}

      <ul className="flex flex-col gap-2">
        {data?.data.map((bug) => (
          <li key={bug.id}>
            <Link
              href={`/bugs/${bug.id}`}
              className="block rounded-2xl border border-line bg-surface p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <p className="font-bold">{bug.title}</p>
                <span
                  className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS[bug.status].style}`}
                >
                  {STATUS[bug.status].label}
                </span>
              </div>
              <p className="mt-1 flex flex-wrap items-center gap-x-2 text-[11px] text-muted">
                <span className={SEVERITY[bug.severity].style}>
                  {SEVERITY[bug.severity].label}
                </span>
                <span>·</span>
                <span>{areaLabel(bug.area)}</span>
                <span>·</span>
                <span>{bug.reporterName}</span>
                <span>·</span>
                <span>{timeAgo(bug.createdAt)}</span>
                {bug.screenshots.length > 0 && (
                  <span className="flex items-center gap-0.5">
                    · <ImageIcon className="h-3 w-3" /> {bug.screenshots.length}
                  </span>
                )}
                {!!bug.commentsCount && (
                  <span className="flex items-center gap-0.5">
                    · <MessageSquare className="h-3 w-3" /> {bug.commentsCount}
                  </span>
                )}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </>
  )
}
