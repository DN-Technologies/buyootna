'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronRight } from 'lucide-react'
import { mutate } from '@/lib/mutate'
import { Card, PageTitle } from '../ui'
import { Button, inputClass } from './shared'

type PersonaChoice = 'NONE' | 'COMPANY' | 'OFFICE'

/** إضافة حساب: an individual test account, with a company or office if wanted. */
export default function NewAccountView() {
  const router = useRouter()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [persona, setPersona] = useState<PersonaChoice>('NONE')
  const [personaName, setPersonaName] = useState('')
  const [license, setLicense] = useState('')
  const [approveOffice, setApproveOffice] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!email.trim() && !phone.trim()) {
      setError('أدخل البريد أو رقم الهاتف')
      return
    }
    setSaving(true)
    setError(null)
    try {
      const account = await mutate<{ id: string }>('accounts', 'POST', {
        name,
        ...(email.trim() ? { email: email.trim() } : {}),
        ...(phone.trim() ? { phone: phone.trim() } : {}),
        password,
        ...(persona !== 'NONE'
          ? {
              persona: {
                type: persona,
                name: personaName,
                licenseNumber: license,
                ...(persona === 'OFFICE' ? { approveOffice } : {}),
              },
            }
          : {}),
      })
      router.push(`/tools/accounts/${account.id}`)
    } catch (e) {
      setError((e as Error).message)
      setSaving(false)
    }
  }

  return (
    <>
      <Link href="/tools" className="mb-3 flex items-center gap-1 text-sm text-muted">
        <ChevronRight className="h-4 w-4" />
        الأدوات
      </Link>
      <PageTitle title="إضافة حساب" subtitle="حساب فرد للاختبار، مع شركة أو مكتب إن أردت" />
      <form onSubmit={submit}>
        <Card className="flex flex-col gap-3">
          <label className="text-sm text-muted">
            الاسم
            <input value={name} onChange={(e) => setName(e.target.value)} className={`${inputClass} mt-1`} required minLength={2} maxLength={60} />
          </label>
          <label className="text-sm text-muted">
            البريد
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={`${inputClass} mt-1`}
              dir="ltr"
              autoCapitalize="none"
            />
          </label>
          <label className="text-sm text-muted">
            رقم الهاتف
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={`${inputClass} mt-1`}
              dir="ltr"
              inputMode="tel"
              placeholder="55556666"
            />
          </label>
          <label className="text-sm text-muted">
            كلمة المرور
            <input
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className={`${inputClass} mt-1`}
              dir="ltr"
              required
              minLength={6}
              autoComplete="new-password"
            />
          </label>

          <div>
            <p className="mb-1 text-sm text-muted">هوية إضافية</p>
            <div className="flex gap-1 rounded-xl border border-line bg-primary p-1">
              {(
                [
                  ['NONE', 'فرد فقط'],
                  ['COMPANY', 'شركة'],
                  ['OFFICE', 'مكتب'],
                ] as const
              ).map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setPersona(value)}
                  className={`flex-1 rounded-lg py-1.5 text-sm font-semibold ${
                    persona === value ? 'bg-accent text-primary' : 'text-muted'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {persona !== 'NONE' && (
            <>
              <label className="text-sm text-muted">
                {persona === 'COMPANY' ? 'اسم الشركة' : 'اسم المكتب'}
                <input
                  value={personaName}
                  onChange={(e) => setPersonaName(e.target.value)}
                  className={`${inputClass} mt-1`}
                  required
                  minLength={2}
                />
              </label>
              <label className="text-sm text-muted">
                رقم الرخصة (فريد)
                <input
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                  className={`${inputClass} mt-1`}
                  dir="ltr"
                  required
                  minLength={2}
                />
              </label>
              {persona === 'OFFICE' ? (
                <label className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={approveOffice}
                    onChange={(e) => setApproveOffice(e.target.checked)}
                    className="size-4 accent-[#c5a880]"
                  />
                  اعتماد المكتب مباشرة
                </label>
              ) : (
                <p className="text-xs text-muted">الشركة تُعتمد مباشرة كما في التطبيق، مع فترتها التجريبية.</p>
              )}
            </>
          )}

          {error && <p className="text-sm text-down">{error}</p>}
          <Button type="submit" disabled={saving}>
            {saving ? 'جاري الإنشاء...' : 'إنشاء الحساب'}
          </Button>
        </Card>
      </form>
    </>
  )
}
