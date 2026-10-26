'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronRight, Send } from 'lucide-react'
import { usePolling } from '@/lib/usePolling'
import { mutate } from '@/lib/mutate'
import { Card, Notice } from '../ui'
import { Button, inputClass } from '../tools/shared'
import { Bug, BugStatus, SEVERITY, STATUS, areaLabel, timeAgo } from './labels'

function Field({ label, value }: { label: string; value: string | null }) {
  if (!value) return null
  return (
    <div>
      <p className="text-xs text-muted">{label}</p>
      <p className="mt-0.5 whitespace-pre-wrap text-sm" dir="auto">
        {value}
      </p>
    </div>
  )
}

/** One bug: its details, screenshots, status and comments. */
export default function BugView({ id }: { id: string }) {
  const {
    data: bug,
    error,
    loading,
    reload,
  } = usePolling<Bug>(`bugs/${id}`, 20_000)
  const [busy, setBusy] = useState(false)
  const [comment, setComment] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const setStatus = async (status: BugStatus) => {
    setBusy(true)
    setMessage(null)
    try {
      await mutate(`bugs/${id}`, 'PATCH', { status })
      await reload()
    } catch (e) {
      setMessage((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const sendComment = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!comment.trim()) return
    setBusy(true)
    setMessage(null)
    try {
      await mutate(`bugs/${id}/comments`, 'POST', { body: comment })
      setComment('')
      await reload()
    } catch (e) {
      setMessage((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Link
        href="/bugs"
        className="mb-3 flex items-center gap-1 text-sm text-muted"
      >
        <ChevronRight className="h-4 w-4" />
        الأخطاء
      </Link>
      {error && <Notice>{error}</Notice>}
      {loading && !bug && (
        <p className="py-16 text-center text-sm text-muted">جاري التحميل...</p>
      )}
      {bug && (
        <div className="flex flex-col gap-3">
          <Card>
            <div className="flex items-start justify-between gap-2">
              <h1 className="text-lg font-bold">{bug.title}</h1>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ${STATUS[bug.status].style}`}
              >
                {STATUS[bug.status].label}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted">
              <span className={SEVERITY[bug.severity].style}>
                {SEVERITY[bug.severity].label}
              </span>
              {' · '}
              {areaLabel(bug.area)} · {bug.reporterName} ·{' '}
              {timeAgo(bug.createdAt)}
            </p>
            <div className="mt-3 grid grid-cols-2 gap-1.5">
              {(Object.keys(STATUS) as BugStatus[])
                .filter((s) => s !== bug.status)
                .map((s) => (
                  <Button
                    key={s}
                    tone="outline"
                    disabled={busy}
                    onClick={() => setStatus(s)}
                  >
                    {STATUS[s].label}
                  </Button>
                ))}
            </div>
            {message && <p className="mt-2 text-xs text-down">{message}</p>}
          </Card>

          <Card className="flex flex-col gap-3">
            <Field label="خطوات إعادة الخطأ" value={bug.steps} />
            <Field label="المتوقع" value={bug.expected} />
            <Field label="ما حدث فعلاً" value={bug.actual} />
            <Field
              label="الجهاز"
              value={
                [
                  bug.device,
                  bug.appVersion ? `التطبيق ${bug.appVersion}` : null,
                ]
                  .filter(Boolean)
                  .join(' · ') || null
              }
            />
          </Card>

          {bug.screenshots.length > 0 && (
            <Card>
              <p className="mb-2 text-xs text-muted">صور الشاشة</p>
              <div className="grid grid-cols-3 gap-2">
                {bug.screenshots.map((url) => (
                  <a
                    key={url}
                    href={url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="aspect-9/16 overflow-hidden rounded-lg bg-primary"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={url}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  </a>
                ))}
              </div>
            </Card>
          )}

          <Card>
            <p className="mb-2 font-bold">التعليقات</p>
            {bug.comments?.length === 0 && (
              <p className="text-xs text-muted">لا تعليقات بعد</p>
            )}
            <ul className="flex flex-col gap-2">
              {bug.comments?.map((c) => (
                <li key={c.id} className="rounded-xl bg-primary px-3 py-2">
                  <p className="flex justify-between text-[11px] text-muted">
                    <span>{c.authorName}</span>
                    <span>{timeAgo(c.createdAt)}</span>
                  </p>
                  <p className="mt-0.5 whitespace-pre-wrap text-sm" dir="auto">
                    {c.body}
                  </p>
                </li>
              ))}
            </ul>
            <form onSubmit={sendComment} className="mt-2 flex gap-2">
              <input
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className={`${inputClass} min-w-0 flex-1`}
                placeholder="أضف تعليقاً"
                maxLength={2000}
              />
              <Button type="submit" disabled={busy || !comment.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
          </Card>
        </div>
      )}
    </>
  )
}
