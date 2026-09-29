'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Flag } from 'lucide-react'
import { t, type Localized } from '@/data/types'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  STATUS_LABELS,
  trackingText,
  type DocsRelease,
  type ResultStatus,
} from '@/lib/tracking'
import { StatusBadge } from './StoryTracking'

export interface ReleaseProgress {
  release: DocsRelease
  counts: Record<ResultStatus, number>
  total: number
  issues: {
    storyId: string
    status: ResultStatus
    slug: string
    title: Localized<string>
  }[]
}

const BAR: Record<ResultStatus, string> = {
  PASS: 'bg-emerald-500',
  READY_FOR_RETEST: 'bg-sky-500',
  BLOCKED: 'bg-amber-500',
  FAIL: 'bg-red-500',
  NOT_RUN: 'bg-[#2A3A47]',
}

async function call(path: string, method: string, body: unknown) {
  const res = await fetch(`/api/qa/${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const data = (await res.json().catch(() => ({}))) as {
      message?: string | string[]
    }
    throw new Error(
      (Array.isArray(data.message) ? data.message[0] : data.message) ??
        String(res.status),
    )
  }
}

export function ReleasesView({
  progress,
  isAdmin,
}: {
  progress: ReleaseProgress[]
  isAdmin: boolean
}) {
  const router = useRouter()
  const { lang } = useLanguage()
  const tx = trackingText[lang]
  const [name, setName] = useState('')
  const [platform, setPlatform] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const run = async (fn: () => Promise<void>) => {
    setBusy(true)
    setError(null)
    try {
      await fn()
      router.refresh()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-accent">
          <Flag className="h-5 w-5" />
          <h1 className="text-2xl font-bold text-white">{tx.releasesTitle}</h1>
        </div>
        <p className="mt-2 max-w-2xl text-[#B9C3CC]">
          {tx.releasesDescription}
        </p>
      </div>

      {isAdmin && (
        <form
          onSubmit={(e) => {
            e.preventDefault()
            void run(async () => {
              await call('releases', 'POST', {
                name,
                platform: platform || undefined,
              })
              setName('')
              setPlatform('')
            })
          }}
          className="flex flex-wrap items-end gap-2 rounded-2xl border border-[#1B2936] bg-[#0A1118]/80 p-4"
        >
          <label className="flex-1 text-xs text-[#B9C3CC]">
            {tx.newRelease} — {tx.releaseName}
            <input
              required
              minLength={2}
              maxLength={80}
              value={name}
              placeholder={tx.releaseNamePlaceholder}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#1B2936] bg-primary px-3 py-2 text-sm text-white outline-none focus:border-accent"
            />
          </label>
          <label className="w-40 text-xs text-[#B9C3CC]">
            {tx.platform}
            <input
              maxLength={60}
              value={platform}
              onChange={(e) => setPlatform(e.target.value)}
              className="mt-1 w-full rounded-lg border border-[#1B2936] bg-primary px-3 py-2 text-sm text-white outline-none focus:border-accent"
            />
          </label>
          <button
            type="submit"
            disabled={busy}
            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-[#0A1118] hover:bg-accent-light disabled:opacity-60"
          >
            {tx.create}
          </button>
        </form>
      )}
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}

      {progress.length === 0 && (
        <p className="text-[#7C8894]">{tx.noRelease}</p>
      )}

      {progress.map(({ release, counts, total, issues }) => {
        const tested = Object.values(counts).reduce((a, b) => a + b, 0)
        const bars: [ResultStatus, number][] = [
          ['PASS', counts.PASS],
          ['READY_FOR_RETEST', counts.READY_FOR_RETEST],
          ['BLOCKED', counts.BLOCKED],
          ['FAIL', counts.FAIL],
          ['NOT_RUN', counts.NOT_RUN + Math.max(0, total - tested)],
        ]
        const passedPct = total ? Math.round((counts.PASS / total) * 100) : 0
        return (
          <section
            key={release.id}
            className="rounded-2xl border border-[#1B2936] bg-[#0A1118]/80 p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-white">
                  {release.name}
                  {release.status === 'CLOSED' && (
                    <span className="ms-2 text-xs font-normal text-[#7C8894]">
                      ({tx.closed})
                    </span>
                  )}
                </h2>
                <p className="text-xs text-[#7C8894]">
                  {release.platform ? `${release.platform} · ` : ''}
                  {release.createdBy} ·{' '}
                  {new Date(release.createdAt).toLocaleDateString(
                    lang === 'ar' ? 'ar-KW' : 'en-GB',
                  )}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <p className="text-sm text-white">
                  <span className="text-lg font-bold">{passedPct}%</span>{' '}
                  {tx.passed} ({counts.PASS}/{total})
                </p>
                {isAdmin && (
                  <button
                    disabled={busy}
                    onClick={() =>
                      void run(() =>
                        call(`releases/${release.id}`, 'PATCH', {
                          status: release.status === 'OPEN' ? 'CLOSED' : 'OPEN',
                        }),
                      )
                    }
                    className="rounded-lg border border-[#1B2936] px-3 py-1 text-xs text-[#B9C3CC] hover:border-accent hover:text-white"
                  >
                    {release.status === 'OPEN'
                      ? tx.closeRelease
                      : tx.reopenRelease}
                  </button>
                )}
              </div>
            </div>

            <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-primary">
              {bars.map(([status, n]) =>
                n > 0 ? (
                  <div
                    key={status}
                    title={`${t(STATUS_LABELS[status], lang)}: ${n}`}
                    className={BAR[status]}
                    style={{ width: `${(n / Math.max(total, 1)) * 100}%` }}
                  />
                ) : null,
              )}
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {bars.map(([status, n]) => (
                <span key={status} className="text-xs text-[#B9C3CC]">
                  {t(STATUS_LABELS[status], lang)}: {n}
                </span>
              ))}
            </div>

            <div className="mt-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#7C8894]">
                {tx.openIssues}
              </p>
              {issues.length === 0 ? (
                <p className="mt-1 text-sm text-[#7C8894]">{tx.noIssues}</p>
              ) : (
                <ul className="mt-2 space-y-1.5">
                  {issues.map((issue) => (
                    <li key={issue.storyId} className="flex items-center gap-2">
                      <StatusBadge status={issue.status} />
                      <Link
                        href={`/${issue.slug}#${issue.storyId}`}
                        className="text-sm text-white hover:text-accent-light"
                      >
                        {t(issue.title, lang)}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </section>
        )
      })}
    </div>
  )
}
