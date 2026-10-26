'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Camera, ChevronRight, X } from 'lucide-react'
import { mutate } from '@/lib/mutate'
import { Card, PageTitle } from '../ui'
import { Button, inputClass } from '../tools/shared'
import { AREAS, BugSeverity, SEVERITY } from './labels'

const MAX_SCREENSHOTS = 8

/** Guesses the tester's phone from the browser, to save typing. */
function describeDevice(): { platform: string; device: string } {
  const ua = navigator.userAgent
  const ios =
    ua.match(/iPhone OS (\d+)_(\d+)/) ?? ua.match(/CPU OS (\d+)_(\d+)/)
  if (/iPhone|iPad/.test(ua) && ios) {
    return {
      platform: 'ios',
      device: `${/iPad/.test(ua) ? 'iPad' : 'iPhone'}, iOS ${ios[1]}.${ios[2]}`,
    }
  }
  const android = ua.match(/Android (\d+(?:\.\d+)?);\s*([^;)]+)/)
  if (android)
    return {
      platform: 'android',
      device: `${android[2].trim()}, Android ${android[1]}`,
    }
  return { platform: 'web', device: ua.slice(0, 120) }
}

/** إبلاغ عن خطأ: from the phone, with screenshots from the camera or gallery. */
export default function NewBugView() {
  const router = useRouter()
  const fileInput = useRef<HTMLInputElement>(null)
  const [title, setTitle] = useState('')
  const [area, setArea] = useState('app')
  const [severity, setSeverity] = useState<BugSeverity>('MEDIUM')
  const [steps, setSteps] = useState('')
  const [expected, setExpected] = useState('')
  const [actual, setActual] = useState('')
  const [platform, setPlatform] = useState('')
  const [device, setDevice] = useState('')
  const [appVersion, setAppVersion] = useState('')
  const [screenshots, setScreenshots] = useState<string[]>([])
  const [uploading, setUploading] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const guess = describeDevice()
    setPlatform(guess.platform)
    setDevice(guess.device)
  }, [])

  const upload = async (files: FileList | null) => {
    if (!files) return
    const room = MAX_SCREENSHOTS - screenshots.length
    for (const file of Array.from(files).slice(0, room)) {
      setUploading((n) => n + 1)
      try {
        const form = new FormData()
        form.append('file', file)
        const res = await fetch('/api/t/bugs/attachments', {
          method: 'POST',
          body: form,
        })
        const data = (await res.json()) as { url?: string; message?: string }
        if (!res.ok || !data.url)
          throw new Error(data.message ?? 'تعذر رفع الصورة')
        setScreenshots((prev) => [...prev, data.url!])
      } catch (e) {
        setError((e as Error).message)
      } finally {
        setUploading((n) => n - 1)
      }
    }
    if (fileInput.current) fileInput.current.value = ''
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setError(null)
    try {
      const bug = await mutate<{ id: string }>('bugs', 'POST', {
        title,
        area,
        severity,
        steps,
        ...(expected.trim() ? { expected } : {}),
        ...(actual.trim() ? { actual } : {}),
        ...(platform ? { platform } : {}),
        ...(device ? { device } : {}),
        ...(appVersion.trim() ? { appVersion: appVersion.trim() } : {}),
        screenshots,
      })
      router.push(`/bugs/${bug.id}`)
    } catch (e) {
      setError((e as Error).message)
      setSaving(false)
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
      <PageTitle
        title="إبلاغ عن خطأ"
        subtitle="ما حدث، وكيف نعيده، مع صور الشاشة"
      />
      <form onSubmit={submit}>
        <Card className="flex flex-col gap-3">
          <label className="text-sm text-muted">
            العنوان
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`${inputClass} mt-1`}
              placeholder="مثال: رفع القصة يتوقف عند 90%"
              required
              minLength={3}
              maxLength={140}
            />
          </label>

          <label className="text-sm text-muted">
            أين
            <select
              value={area}
              onChange={(e) => setArea(e.target.value)}
              className={`${inputClass} mt-1`}
            >
              {AREAS.map((a) => (
                <option key={a.value} value={a.value}>
                  {a.label}
                </option>
              ))}
            </select>
          </label>

          <div>
            <p className="mb-1 text-sm text-muted">الخطورة</p>
            <div className="flex gap-1 rounded-xl border border-line bg-primary p-1">
              {(Object.keys(SEVERITY) as BugSeverity[]).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setSeverity(value)}
                  className={`flex-1 rounded-lg py-1.5 text-sm font-semibold ${
                    severity === value ? 'bg-accent text-primary' : 'text-muted'
                  }`}
                >
                  {SEVERITY[value].label}
                </button>
              ))}
            </div>
          </div>

          <label className="text-sm text-muted">
            خطوات إعادة الخطأ
            <textarea
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              className={`${inputClass} mt-1 min-h-28`}
              placeholder={'1. افتح الاستوديو\n2. أضف قصة فيديو\n3. اضغط نشر'}
              required
              minLength={3}
            />
          </label>
          <label className="text-sm text-muted">
            المتوقع
            <textarea
              value={expected}
              onChange={(e) => setExpected(e.target.value)}
              className={`${inputClass} mt-1 min-h-16`}
            />
          </label>
          <label className="text-sm text-muted">
            ما حدث فعلاً
            <textarea
              value={actual}
              onChange={(e) => setActual(e.target.value)}
              className={`${inputClass} mt-1 min-h-16`}
            />
          </label>

          <div>
            <p className="mb-1 text-sm text-muted">
              صور الشاشة ({screenshots.length}/{MAX_SCREENSHOTS})
            </p>
            <div className="grid grid-cols-4 gap-2">
              {screenshots.map((url) => (
                <div
                  key={url}
                  className="relative aspect-9/16 overflow-hidden rounded-lg bg-primary"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={url}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      setScreenshots((prev) => prev.filter((u) => u !== url))
                    }
                    className="absolute left-1 top-1 rounded-full bg-black/60 p-0.5"
                    aria-label="إزالة"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
              {screenshots.length < MAX_SCREENSHOTS && (
                <button
                  type="button"
                  onClick={() => fileInput.current?.click()}
                  className="flex aspect-9/16 flex-col items-center justify-center gap-1 rounded-lg border border-dashed border-line text-[11px] text-muted"
                >
                  <Camera className="h-5 w-5" />
                  {uploading ? 'جاري الرفع' : 'إضافة'}
                </button>
              )}
            </div>
            <input
              ref={fileInput}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => upload(e.target.files)}
            />
          </div>

          <details className="text-sm text-muted">
            <summary className="cursor-pointer">الجهاز والنسخة</summary>
            <div className="mt-2 flex flex-col gap-2">
              <input
                value={device}
                onChange={(e) => setDevice(e.target.value)}
                className={inputClass}
                dir="ltr"
                placeholder="iPhone 15, iOS 18.1"
              />
              <input
                value={appVersion}
                onChange={(e) => setAppVersion(e.target.value)}
                className={inputClass}
                dir="ltr"
                placeholder="نسخة التطبيق، مثال 1.7.0"
              />
            </div>
          </details>

          {error && <p className="text-sm text-down">{error}</p>}
          <Button type="submit" disabled={saving || uploading > 0}>
            {saving ? 'جاري الإرسال...' : 'إرسال البلاغ'}
          </Button>
        </Card>
      </form>
    </>
  )
}
