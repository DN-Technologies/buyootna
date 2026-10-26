'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { LogIn } from 'lucide-react'

const inputClass =
  'mt-1 w-full rounded-xl border border-line bg-primary px-3 py-3 text-base text-white outline-none focus:border-accent'

export default function LoginPage() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, password }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { message?: string | string[] }
        setError((Array.isArray(data.message) ? data.message[0] : data.message) ?? 'تعذر تسجيل الدخول')
        return
      }
      router.replace('/')
      router.refresh()
    } catch {
      setError('تعذر تسجيل الدخول')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-dvh items-center justify-center px-5">
      <form onSubmit={submit} className="w-full max-w-sm rounded-2xl border border-line bg-surface p-6">
        <Image src="/logo-icon.png" alt="Buyootna" width={40} height={40} />
        <h1 className="mt-4 text-xl font-bold">بوابة الاختبار</h1>
        <p className="mt-1 text-sm text-muted">لفريق الاختبار وضمان الجودة. اسمك يُسجَّل مع كل إجراء.</p>

        <label className="mt-6 block text-sm text-muted">
          اسمك
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            className={inputClass}
            placeholder="مثال: أحمد (QA)"
            autoComplete="name"
            required
            minLength={2}
            maxLength={60}
          />
        </label>
        <label className="mt-4 block text-sm text-muted">
          كلمة المرور
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className={inputClass}
            autoComplete="current-password"
            required
          />
        </label>

        {error && <p className="mt-4 text-sm text-down">{error}</p>}

        <button
          type="submit"
          disabled={submitting}
          className="mt-6 flex w-full items-center justify-center gap-2 rounded-xl bg-accent py-3 font-bold text-primary disabled:opacity-60"
        >
          <LogIn className="h-5 w-5" />
          {submitting ? 'جاري الدخول...' : 'دخول'}
        </button>
      </form>
    </main>
  )
}
