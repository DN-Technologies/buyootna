'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { KeyRound } from 'lucide-react'
import { t } from '@/data/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { chrome } from '@/lib/chrome'
import { DOCS_ROLES, ROLE_LABELS, type DocsRole } from '@/lib/access'

export interface RoleCredentialInfo {
  role: DocsRole
  updatedBy: string
  updatedAt: string
}

function RoleRow({
  role,
  info,
}: {
  role: DocsRole
  info?: RoleCredentialInfo
}) {
  const router = useRouter()
  const { lang } = useLanguage()
  const c = chrome[lang]
  const [password, setPassword] = useState('')
  const [status, setStatus] = useState<{ ok: boolean; text: string } | null>(
    null,
  )
  const [saving, setSaving] = useState(false)

  const save = async (event: React.FormEvent) => {
    event.preventDefault()
    setSaving(true)
    setStatus(null)
    const res = await fetch('/api/admin/passwords', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, password }),
    })
    setSaving(false)
    if (res.ok) {
      setPassword('')
      setStatus({ ok: true, text: c.passwordsSaved })
      // Changing the admin password also signs this admin out
      router.refresh()
      return
    }
    const data = (await res.json().catch(() => ({}))) as {
      message?: string | string[]
    }
    setStatus({
      ok: false,
      text:
        (Array.isArray(data.message) ? data.message[0] : data.message) ??
        c.loginFailed,
    })
  }

  return (
    <form
      onSubmit={save}
      className="rounded-2xl border border-[#1B2936] bg-[#0A1118]/80 p-5"
    >
      <div className="flex items-center justify-between gap-4">
        <h2 className="text-base font-semibold text-white">
          {t(ROLE_LABELS[role], lang)}
        </h2>
        <p className="text-xs text-[#7C8894]">
          {info
            ? `${c.passwordsLastSet}: ${new Date(info.updatedAt).toLocaleString(
                lang === 'ar' ? 'ar-KW' : 'en-GB',
              )} · ${info.updatedBy}`
            : c.passwordsNeverSet}
        </p>
      </div>
      <div className="mt-3 flex gap-2">
        <input
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          maxLength={128}
          value={password}
          placeholder={c.passwordsMinLength}
          onChange={(e) => setPassword(e.target.value)}
          aria-label={c.passwordsNew}
          className="flex-1 rounded-lg border border-[#1B2936] bg-primary px-3 py-2 text-sm text-white outline-none focus:border-accent"
        />
        <button
          type="submit"
          disabled={saving}
          className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-[#0A1118] hover:bg-accent-light disabled:opacity-60"
        >
          {c.passwordsSave}
        </button>
      </div>
      {status && (
        <p
          role="status"
          className={`mt-2 text-sm ${status.ok ? 'text-emerald-400' : 'text-red-400'}`}
        >
          {status.text}
        </p>
      )}
    </form>
  )
}

export function PasswordsView({ roles }: { roles: RoleCredentialInfo[] }) {
  const { lang } = useLanguage()
  const c = chrome[lang]

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center gap-2 text-accent">
          <KeyRound className="h-5 w-5" />
          <h1 className="text-2xl font-bold text-white">{c.passwordsTitle}</h1>
        </div>
        <p className="mt-2 max-w-2xl text-[#B9C3CC]">
          {c.passwordsDescription}
        </p>
      </div>
      {DOCS_ROLES.map((role) => (
        <RoleRow
          key={role}
          role={role}
          info={roles.find((r) => r.role === role)}
        />
      ))}
    </div>
  )
}
