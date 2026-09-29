'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Bug,
  History,
  ImagePlus,
  MessageSquare,
  Palette,
  RotateCcw,
  ClipboardCheck,
} from 'lucide-react'
import { t } from '@/data/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { ROLE_LABELS, type DocsRole } from '@/lib/access'
import {
  STATUS_LABELS,
  STATUS_STYLES,
  canAddDesignNote,
  canComment,
  recordableStatuses,
  trackingText,
  type ResultStatus,
  type StoryComment,
  type StoryResult,
} from '@/lib/tracking'

export function StatusBadge({ status }: { status: ResultStatus | 'UNTESTED' }) {
  const { lang } = useLanguage()
  return (
    <span
      className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${STATUS_STYLES[status]}`}
    >
      {t(STATUS_LABELS[status], lang)}
    </span>
  )
}

const fieldClass =
  'mt-1 w-full rounded-lg border border-[#1B2936] bg-[#0F1E2E] px-3 py-2 text-sm text-white outline-none focus:border-accent'

async function send(path: string, init: RequestInit) {
  const res = await fetch(`/api/qa/${path}`, init)
  const data = (await res.json().catch(() => ({}))) as {
    message?: string | string[]
  }
  if (!res.ok) {
    throw new Error(
      (Array.isArray(data.message) ? data.message[0] : data.message) ??
        String(res.status),
    )
  }
  return data
}

function Screenshots({ urls }: { urls: string[] }) {
  if (!urls.length) return null
  return (
    <div className="mt-2 flex flex-wrap gap-2">
      {urls.map((url) => (
        <a key={url} href={url} target="_blank" rel="noopener noreferrer">
          {/* eslint-disable-next-line @next/next/no-img-element -- S3 images of any size */}
          <img
            src={url}
            alt=""
            className="h-16 w-16 rounded-lg border border-[#1B2936] object-cover"
          />
        </a>
      ))}
    </div>
  )
}

type Mode = 'result' | 'retest' | 'comment' | 'design' | null

export function StoryTracking({
  storyId,
  role,
  releaseId,
  releaseOpen,
  current,
}: {
  storyId: string
  role: DocsRole
  releaseId: string | null
  releaseOpen: boolean
  current?: StoryResult
}) {
  const router = useRouter()
  const { lang } = useLanguage()
  const tx = trackingText[lang]
  const [mode, setMode] = useState<Mode>(null)
  const [status, setStatus] = useState<ResultStatus>('PASS')
  const [note, setNote] = useState('')
  const [bugUrl, setBugUrl] = useState('')
  const [attachments, setAttachments] = useState<string[]>([])
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<{
    results: StoryResult[]
    comments: StoryComment[]
  } | null>(null)

  const statuses = recordableStatuses(role).filter(
    (s) => s !== 'READY_FOR_RETEST',
  )
  const canRetest =
    recordableStatuses(role).includes('READY_FOR_RETEST') &&
    (current?.status === 'FAIL' || current?.status === 'BLOCKED')
  const isTeam = canComment(role)

  const reset = () => {
    setMode(null)
    setNote('')
    setBugUrl('')
    setAttachments([])
    setError(null)
  }

  const upload = async (file: File) => {
    const form = new FormData()
    form.append('file', file)
    setBusy(true)
    setError(null)
    try {
      const res = await fetch('/api/qa/attachments', {
        method: 'POST',
        body: form,
      })
      const data = (await res.json()) as { url?: string; message?: string }
      if (!res.ok || !data.url)
        throw new Error(data.message ?? String(res.status))
      setAttachments((prev) => [...prev, data.url!])
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const loadHistory = async () => {
    if (!releaseId) return
    if (history) {
      setHistory(null)
      return
    }
    const res = await fetch(`/api/qa/releases/${releaseId}/stories/${storyId}`)
    if (res.ok) setHistory(await res.json())
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!releaseId && (mode === 'result' || mode === 'retest')) return
    setBusy(true)
    setError(null)
    try {
      if (mode === 'result' || mode === 'retest') {
        await send(`releases/${releaseId}/stories/${storyId}/results`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            status: mode === 'retest' ? 'READY_FOR_RETEST' : status,
            note: note || undefined,
            bugUrl: bugUrl || undefined,
            attachments,
          }),
        })
      } else {
        await send(`stories/${storyId}/comments`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            kind: mode === 'design' ? 'DESIGN_MISMATCH' : 'COMMENT',
            body: note,
            releaseId: releaseId ?? undefined,
            attachments,
          }),
        })
      }
      reset()
      setHistory(null)
      router.refresh()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const actionClass =
    'inline-flex items-center gap-1.5 rounded-lg border border-[#1B2936] px-2.5 py-1 text-xs text-[#B9C3CC] transition-colors hover:border-accent hover:text-white'

  return (
    <div className="mt-5 rounded-xl border border-[#1B2936] bg-primary/40 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <StatusBadge status={current?.status ?? 'UNTESTED'} />
        {current && (
          <span className="text-xs text-[#7C8894]">
            {tx.by} {current.authorName} ·{' '}
            {new Date(current.createdAt).toLocaleString(
              lang === 'ar' ? 'ar-KW' : 'en-GB',
            )}
          </span>
        )}
        {current?.bugUrl && (
          <a
            href={current.bugUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-accent-light hover:underline"
          >
            <Bug className="h-3.5 w-3.5" />
            {tx.bugUrl}
          </a>
        )}
      </div>
      {current?.note && (
        <p className="mt-2 whitespace-pre-wrap text-sm text-[#DCE1E6]">
          {current.note}
        </p>
      )}
      {current && <Screenshots urls={current.attachments} />}

      {releaseId && !releaseOpen && isTeam && (
        <p className="mt-2 text-xs text-[#7C8894]">{tx.releaseClosedNote}</p>
      )}

      {isTeam && mode === null && (
        <div className="mt-3 flex flex-wrap gap-2">
          {releaseOpen && statuses.length > 0 && (
            <button className={actionClass} onClick={() => setMode('result')}>
              <ClipboardCheck className="h-3.5 w-3.5" />
              {tx.recordResult}
            </button>
          )}
          {releaseOpen && canRetest && (
            <button className={actionClass} onClick={() => setMode('retest')}>
              <RotateCcw className="h-3.5 w-3.5" />
              {tx.readyToRetest}
            </button>
          )}
          <button className={actionClass} onClick={() => setMode('comment')}>
            <MessageSquare className="h-3.5 w-3.5" />
            {tx.comment}
          </button>
          {canAddDesignNote(role) && (
            <button className={actionClass} onClick={() => setMode('design')}>
              <Palette className="h-3.5 w-3.5" />
              {tx.designNote}
            </button>
          )}
          {releaseId && (
            <button className={actionClass} onClick={loadHistory}>
              <History className="h-3.5 w-3.5" />
              {history ? tx.hideHistory : tx.history}
            </button>
          )}
        </div>
      )}

      {mode && (
        <form onSubmit={submit} className="mt-3 space-y-3">
          {mode === 'result' && (
            <label className="block text-xs text-[#B9C3CC]">
              {tx.status}
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as ResultStatus)}
                className={fieldClass}
              >
                {statuses.map((s) => (
                  <option key={s} value={s}>
                    {t(STATUS_LABELS[s], lang)}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="block text-xs text-[#B9C3CC]">
            {mode === 'comment'
              ? tx.comment
              : mode === 'design'
                ? tx.designNote
                : tx.note}
            <textarea
              rows={3}
              value={note}
              required={
                mode === 'comment' || mode === 'design' || status === 'FAIL'
              }
              placeholder={
                mode === 'result' && status === 'FAIL'
                  ? tx.notePlaceholderFail
                  : ''
              }
              onChange={(e) => setNote(e.target.value)}
              className={fieldClass}
            />
          </label>
          {mode === 'result' && (
            <label className="block text-xs text-[#B9C3CC]">
              {tx.bugUrl}
              <input
                type="url"
                dir="ltr"
                value={bugUrl}
                onChange={(e) => setBugUrl(e.target.value)}
                className={fieldClass}
              />
            </label>
          )}
          <div>
            <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs text-accent-light hover:underline">
              <ImagePlus className="h-3.5 w-3.5" />
              {tx.addScreenshot}
              <input
                type="file"
                accept="image/png,image/jpeg,image/webp,image/gif"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0]
                  if (file) void upload(file)
                  e.target.value = ''
                }}
              />
            </label>
            <Screenshots urls={attachments} />
          </div>
          {error && (
            <p role="alert" className="text-sm text-red-400">
              {error}
            </p>
          )}
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={busy}
              className="rounded-lg bg-accent px-4 py-1.5 text-sm font-semibold text-[#0A1118] hover:bg-accent-light disabled:opacity-60"
            >
              {busy ? tx.saving : tx.save}
            </button>
            <button
              type="button"
              onClick={reset}
              className="rounded-lg px-3 py-1.5 text-sm text-[#B9C3CC] hover:text-white"
            >
              {tx.cancel}
            </button>
          </div>
        </form>
      )}

      {history && (
        <div className="mt-4 space-y-3 border-t border-[#1B2936] pt-3">
          {history.results.length === 0 && history.comments.length === 0 && (
            <p className="text-xs text-[#7C8894]">{tx.nothingYet}</p>
          )}
          {[
            ...history.results.map((r) => ({
              at: r.createdAt,
              kind: 'result' as const,
              r,
            })),
            ...history.comments.map((c) => ({
              at: c.createdAt,
              kind: 'comment' as const,
              c,
            })),
          ]
            .sort((a, b) => b.at.localeCompare(a.at))
            .map((item) => {
              const author = item.kind === 'result' ? item.r : item.c
              return (
                <div key={author.id} className="text-sm">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#7C8894]">
                    {item.kind === 'result' ? (
                      <StatusBadge status={item.r.status} />
                    ) : item.c.kind === 'DESIGN_MISMATCH' ? (
                      <span className="inline-flex items-center gap-1 text-fuchsia-300">
                        <Palette className="h-3.5 w-3.5" />
                        {tx.designNote}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1">
                        <MessageSquare className="h-3.5 w-3.5" />
                        {tx.comment}
                      </span>
                    )}
                    <span>
                      {author.authorName} ·{' '}
                      {t(ROLE_LABELS[author.authorRole], lang)} ·{' '}
                      {new Date(item.at).toLocaleString(
                        lang === 'ar' ? 'ar-KW' : 'en-GB',
                      )}
                    </span>
                  </div>
                  {(item.kind === 'result' ? item.r.note : item.c.body) && (
                    <p className="mt-1 whitespace-pre-wrap text-[#DCE1E6]">
                      {item.kind === 'result' ? item.r.note : item.c.body}
                    </p>
                  )}
                  <Screenshots urls={author.attachments} />
                </div>
              )
            })}
        </div>
      )}
    </div>
  )
}
