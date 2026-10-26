'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronRight, TriangleAlert } from 'lucide-react'
import { usePolling } from '@/lib/usePolling'
import { mutate } from '@/lib/mutate'
import { Card, Notice, PageTitle } from '../ui'
import { Button, inputClass } from './shared'

const COUNTDOWN_SECONDS = 10

interface Job {
  id: string
  kind: 'wipe' | 'seed'
  state: 'running' | 'done' | 'failed'
  actorName: string
  startedAt: string
  finishedAt: string | null
  lines: string[]
  error: string | null
  backupKey: string | null
}

interface Overview {
  confirmPhrase: string
  environment: string
  users: number
  tables: number
  approxRows: number
  job: Job | null
}

const JOB_LABEL = { wipe: 'مسح البيانات', seed: 'تعبئة البيانات' }
const STATE_LABEL = {
  running: { label: 'جارٍ', style: 'bg-warn/15 text-warn' },
  done: { label: 'تم', style: 'bg-ok/15 text-ok' },
  failed: { label: 'فشل', style: 'bg-down/15 text-down' },
}

function JobCard({ job }: { job: Job }) {
  const state = STATE_LABEL[job.state]
  return (
    <Card>
      <div className="flex items-center justify-between gap-2">
        <p className="font-bold">{JOB_LABEL[job.kind]}</p>
        <span
          className={`rounded-full px-2 py-0.5 text-[11px] font-semibold ${state.style}`}
        >
          {state.label}
        </span>
      </div>
      <p className="mt-0.5 text-xs text-muted">
        {job.actorName} ·{' '}
        {new Date(job.startedAt).toLocaleTimeString('ar', {
          hour: 'numeric',
          minute: '2-digit',
          numberingSystem: 'latn',
        })}
      </p>
      <div className="mt-2 max-h-64 overflow-y-auto rounded-xl bg-primary p-3 text-[11px] text-muted">
        {job.lines.map((line, i) => (
          <p key={i} dir="auto" className="wrap-break-word">
            {line}
          </p>
        ))}
      </div>
      {job.backupKey && (
        <p className="mt-2 text-xs text-muted">
          النسخة الاحتياطية:{' '}
          <span className="font-mono" dir="ltr">
            {job.backupKey}
          </span>
        </p>
      )}
    </Card>
  )
}

/** The GitHub-style wipe: typed phrase, DANGER password, then a countdown. */
function WipeDialog({
  phrase,
  onClose,
  onStarted,
}: {
  phrase: string
  onClose: () => void
  onStarted: () => void
}) {
  const [typed, setTyped] = useState('')
  const [password, setPassword] = useState('')
  const [countdown, setCountdown] = useState<number | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (countdown === null) return
    if (countdown === 0) {
      mutate('database/wipe', 'POST', {
        confirm: typed,
        dangerPassword: password,
      })
        .then(onStarted)
        .catch((e: Error) => {
          setError(e.message)
          setCountdown(null)
        })
      return
    }
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
    // typed/password are frozen while counting down (inputs are disabled)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [countdown])

  const ready = typed === phrase && password.length > 0
  const counting = countdown !== null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 p-4 sm:items-center">
      <div className="w-full max-w-md rounded-2xl border border-down/50 bg-surface p-4">
        <p className="flex items-center gap-2 font-bold text-down">
          <TriangleAlert className="h-5 w-5" />
          مسح كل البيانات
        </p>
        <p className="mt-2 text-sm text-muted">
          يحذف كل المستخدمين والإعلانات والمحادثات والفواتير وكل البيانات
          الأخرى. تُحفظ نسخة احتياطية كاملة في S3 أولاً، وإن فشلت لا يُحذف شيء.
          يبقى سجل الترحيلات وكلمات مرور البوابة وسجلها وبلاغات الأخطاء.
        </p>
        <label className="mt-3 block text-sm text-muted">
          اكتب{' '}
          <span className="select-all font-mono font-bold text-white" dir="ltr">
            {phrase}
          </span>{' '}
          للتأكيد
          <input
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
            className={`${inputClass} mt-1 font-mono`}
            dir="ltr"
            autoCapitalize="off"
            autoCorrect="off"
            spellCheck={false}
            disabled={counting}
          />
        </label>
        <label className="mt-3 block text-sm text-muted">
          كلمة مرور الخطر
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={`${inputClass} mt-1`}
            autoComplete="off"
            disabled={counting}
          />
        </label>
        {error && <p className="mt-2 text-sm text-down">{error}</p>}
        <div className="mt-4 grid grid-cols-2 gap-2">
          {counting ? (
            <>
              <div className="flex items-center justify-center rounded-xl bg-down/15 text-sm font-bold text-down">
                {countdown > 0
                  ? `يبدأ المسح بعد ${countdown}`
                  : 'جارٍ البدء...'}
              </div>
              <Button
                tone="outline"
                disabled={countdown === 0}
                onClick={() => setCountdown(null)}
              >
                إلغاء
              </Button>
            </>
          ) : (
            <>
              <Button
                tone="danger"
                disabled={!ready}
                onClick={() => setCountdown(COUNTDOWN_SECONDS)}
              >
                مسح كل البيانات
              </Button>
              <Button tone="outline" onClick={onClose}>
                تراجع
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/** قاعدة البيانات: seed an empty database, or wipe it (backup first). */
export default function DatabaseView() {
  const { data, error, reload } = usePolling<Overview>('database', 3_000)
  const [wiping, setWiping] = useState(false)
  const [password, setPassword] = useState('')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const running = data?.job?.state === 'running'

  const seed = async () => {
    setBusy(true)
    setMessage(null)
    try {
      await mutate('database/seed', 'POST', { password })
      setPassword('')
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
        href="/tools"
        className="mb-3 flex items-center gap-1 text-sm text-muted"
      >
        <ChevronRight className="h-4 w-4" />
        الأدوات
      </Link>
      <PageTitle
        title="قاعدة البيانات"
        subtitle="تعبئة قاعدة فارغة، أو مسح كل البيانات بعد نسخة احتياطية"
      />
      {error && <Notice>{error}</Notice>}
      {data && (
        <div className="flex flex-col gap-3">
          <Card>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-lg font-bold">
                  {data.users.toLocaleString('en')}
                </p>
                <p className="text-[11px] text-muted">مستخدم</p>
              </div>
              <div>
                <p className="text-lg font-bold">
                  {data.approxRows.toLocaleString('en')}
                </p>
                <p className="text-[11px] text-muted">صف تقريباً</p>
              </div>
              <div>
                <p className="text-lg font-bold">{data.tables}</p>
                <p className="text-[11px] text-muted">جدول</p>
              </div>
            </div>
            <p className="mt-2 text-center text-[11px] text-muted" dir="ltr">
              {data.environment}
            </p>
          </Card>

          {data.job && <JobCard job={data.job} />}

          <Card>
            <h2 className="font-bold">تعبئة بيانات التطوير</h2>
            <p className="mt-0.5 text-xs text-muted">
              المحافظات والمناطق، 500 شركة بإعلاناتها، حسابات مراجعي آبل،
              الباقات والأسئلة الشائعة والفواتير. بدون حساب المدير. لقاعدة فارغة
              فقط.
            </p>
            {data.users > 0 ? (
              <p className="mt-2 text-xs text-warn">
                قاعدة البيانات فيها {data.users} مستخدم: امسحها أولاً.
              </p>
            ) : (
              <div className="mt-3 flex gap-2">
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className={`${inputClass} min-w-0 flex-1`}
                  placeholder="كلمة مرور الحسابات (8 أحرف على الأقل)"
                  autoComplete="new-password"
                />
                <Button
                  disabled={busy || running || password.length < 8}
                  onClick={seed}
                >
                  تعبئة
                </Button>
              </div>
            )}
            {message && <p className="mt-2 text-xs text-down">{message}</p>}
          </Card>

          <Card className="border-down/40">
            <h2 className="font-bold text-down">مسح كل البيانات</h2>
            <p className="mb-3 mt-0.5 text-xs text-muted">
              نسخة احتياطية كاملة (pg_dump) إلى S3، ثم حذف كل البيانات. يحتاج
              كلمة مرور الخطر.
            </p>
            <Button
              tone="danger"
              disabled={running}
              onClick={() => setWiping(true)}
            >
              مسح كل البيانات...
            </Button>
          </Card>
        </div>
      )}
      {wiping && data && (
        <WipeDialog
          phrase={data.confirmPhrase}
          onClose={() => setWiping(false)}
          onStarted={() => {
            setWiping(false)
            reload()
          }}
        />
      )}
    </>
  )
}
