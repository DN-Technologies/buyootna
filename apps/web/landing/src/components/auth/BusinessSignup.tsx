'use client'

import { ChevronDown, MapPin } from 'lucide-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useRef, useState } from 'react'

import { AccountTypeOption } from '@/components/auth/AccountTypeDialog'
import AuthTabs from '@/components/auth/AuthTabs'
import {
  BackLink,
  Field,
  FileDrop,
  FormError,
  PasswordField,
  PrimaryButton,
  TextArea,
  TextField,
} from '@/components/auth/fields'
import SuccessDialog from '@/components/auth/SuccessDialog'
import { ACCOUNT_TYPES } from '@/lib/accountTypes'
import {
  cleanIdentifier,
  errorMessage,
  isEmail,
  isPhone,
  registerBusiness,
  type BusinessSignup as BusinessForm,
} from '@/lib/auth'
import { GOVERNORATES } from '@/lib/locations'
import { SIGNUP_PATH } from '@/lib/siteLinks'
import { useDismiss } from '@/lib/useDismiss'

type Kind = 'company' | 'office'
type Errors = Partial<Record<keyof BusinessForm | 'confirm', string>>

// The words that differ between a company's form and an office's
const WORDING: Record<
  Kind,
  {
    title: string
    name: string
    namePlaceholder: string
    hq: string
    logo: string
    about: string
  }
> = {
  company: {
    title: 'شركة',
    name: 'اسم الشركة',
    namePlaceholder: 'مثال: البنيان للمقاولات',
    hq: 'أين يقع مقر الشركة ؟',
    logo: 'لوجو الشركة',
    about: 'نبذة عن الشركة',
  },
  office: {
    title: 'مكتب العقاري',
    name: 'اسم المكتب',
    namePlaceholder: 'مثال: مكتب المنار للعقارات',
    hq: 'أين يقع مقر المكتب ؟',
    logo: 'لوجو المكتب',
    about: 'نبذة عن المكتب',
  },
}

const EMPTY: BusinessForm = {
  name: '',
  email: '',
  phone: '',
  password: '',
  services: '',
  hqLocation: '',
  serviceAreas: '',
  about: '',
  licenseActivity: '',
  licenseNumber: '',
  licenseExpiry: '',
  logo: null,
  license: null,
}

const AREA_SEPARATOR = '، '

/** The chip showing the account type, opening the switch between the two. */
function KindSwitcher({ kind }: { kind: Kind }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(container, open, close)

  const current = ACCOUNT_TYPES.find((type) => type.id === kind)!

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex h-9.5 items-center gap-1.5 rounded-xl bg-surface px-4 text-base leading-[1.2] font-semibold text-ink"
      >
        <Image src={current.icon} alt="" width={22} height={22} />
        {current.label}
        <ChevronDown
          className={`h-4 w-4 text-muted transition ${open ? 'rotate-180' : ''}`}
          strokeWidth={1.5}
        />
      </button>
      {open && (
        <div
          role="radiogroup"
          aria-label="نوع الحساب"
          className="absolute top-full left-0 z-20 mt-2 flex w-85 max-w-[calc(100vw-40px)] flex-col gap-3 rounded-[10px] border border-line bg-white p-6 shadow-[0_0_6px_2px_rgba(206,206,206,0.25)]"
        >
          {ACCOUNT_TYPES.filter((type) => type.id !== 'individual').map(
            (type) => (
              <AccountTypeOption
                key={type.id}
                compact
                type={type}
                selected={type.id === kind}
                onSelect={() => {
                  close()
                  if (type.id !== kind)
                    router.replace(`${SIGNUP_PATH}?type=${type.id}`)
                }}
              />
            ),
          )}
        </div>
      )}
    </div>
  )
}

/** مناطق تقديم الخدمة: any number of governorates, stored as one line of text. */
function AreasSelect({
  value,
  error,
  onChange,
}: {
  value: string
  error?: string
  onChange: (value: string) => void
}) {
  const [open, setOpen] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(container, open, close)

  const picked = value ? value.split(AREA_SEPARATOR) : []
  const toggle = (label: string) =>
    onChange(
      (picked.includes(label)
        ? picked.filter((area) => area !== label)
        : [...picked, label]
      ).join(AREA_SEPARATOR),
    )

  return (
    <Field label="مناطق تقديم الخدمة" required error={error}>
      <div ref={container} className="relative">
        <button
          type="button"
          aria-haspopup="listbox"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className={`flex h-11.5 w-full items-center gap-2 rounded-lg border bg-white px-3 text-right text-sm tracking-[-0.408px] ${
            error ? 'border-[#D12121]' : 'border-line'
          }`}
        >
          <span
            className={`min-w-0 flex-1 truncate ${value ? 'text-ink' : 'text-[#979797]'}`}
          >
            {value || 'اختر نطاقات الخدمة'}
          </span>
          <ChevronDown
            className="h-4.5 w-4.5 shrink-0 text-ink"
            strokeWidth={1.5}
          />
        </button>
        {open && (
          <div
            role="listbox"
            aria-multiselectable="true"
            className="absolute inset-x-0 top-full z-20 mt-1 flex flex-col rounded-lg border border-line bg-white p-1.5 shadow-[0_8px_24px_rgba(33,37,41,0.16)]"
          >
            {GOVERNORATES.map((governorate) => {
              const selected = picked.includes(governorate.label)
              return (
                <button
                  key={governorate.id}
                  type="button"
                  role="option"
                  aria-selected={selected}
                  onClick={() => toggle(governorate.label)}
                  className={`flex h-10 items-center justify-between rounded-md px-3 text-sm ${
                    selected
                      ? 'bg-surface font-bold text-brand'
                      : 'font-medium text-ink hover:bg-surface'
                  }`}
                >
                  {governorate.label}
                  {selected && <span aria-hidden>✓</span>}
                </button>
              )
            })}
          </div>
        )}
      </div>
    </Field>
  )
}

/**
 * A company's or an office's sign-up, in two steps: who they are and how to
 * reach them, then their licence. It ends signed in, awaiting approval.
 */
export default function BusinessSignup({ kind }: { kind: Kind }) {
  const router = useRouter()
  const words = WORDING[kind]
  const [step, setStep] = useState<1 | 2>(1)
  const [form, setForm] = useState<BusinessForm>(EMPTY)
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<Errors>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const set = <K extends keyof BusinessForm>(key: K, value: BusinessForm[K]) =>
    setForm((current) => ({ ...current, [key]: value }))
  const text = (key: keyof BusinessForm) => ({
    value: form[key] as string,
    error: errors[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => {
      set(key, event.target.value as never)
      // A corrected field stops showing its error
      if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }))
    },
  })

  const validateFirst = (): Errors => {
    const found: Errors = {}
    if (form.name.trim().length < 2) found.name = 'الاسم مطلوب'
    if (!isEmail(form.email.trim())) found.email = 'البريد الإلكتروني غير صالح'
    if (form.phone && !isPhone(cleanIdentifier(form.phone))) {
      found.phone = 'رقم الهاتف غير صحيح'
    }
    if (form.password.length < 8) {
      found.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل'
    }
    if (confirm !== form.password) found.confirm = 'كلمتا المرور غير متطابقتين'
    if (!form.hqLocation.trim()) found.hqLocation = 'المقر الرئيسي مطلوب'
    if (kind === 'company' && !form.serviceAreas) {
      found.serviceAreas = 'اختر منطقة واحدة على الأقل'
    }
    return found
  }

  const next = (event: React.FormEvent) => {
    event.preventDefault()
    const found = validateFirst()
    setErrors(found)
    if (Object.keys(found).length === 0) setStep(2)
  }

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!form.licenseNumber.trim()) {
      setErrors({ licenseNumber: 'رقم الرخصة مطلوب' })
      return
    }
    setErrors({})
    setLoading(true)
    setError('')
    try {
      await registerBusiness(kind, form)
      setDone(true)
    } catch (err) {
      setError(errorMessage(err, 'تعذر إنشاء الحساب. حاول مجدداً.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex w-full flex-col gap-4">
        <BackLink href="/" />
        <div className="flex items-center justify-between gap-5">
          <h1 className="text-lg leading-[1.2] font-bold text-ink">
            {words.title}
          </h1>
          <KindSwitcher kind={kind} />
        </div>
        <AuthTabs active="signup" />
        <div className="flex flex-col gap-1.25">
          <p className="text-sm leading-[1.2] font-medium text-muted">
            خطوة {step} من 2
          </p>
          <div
            role="progressbar"
            aria-valuemin={1}
            aria-valuemax={2}
            aria-valuenow={step}
            className="h-1 w-full rounded bg-[#D7D7D7]"
          >
            <div
              className={`h-1 rounded bg-[#00A447] transition-all ${step === 1 ? 'w-1/2' : 'w-full'}`}
            />
          </div>
        </div>
      </div>

      {step === 1 ? (
        <form onSubmit={next} noValidate className="flex w-full flex-col gap-8">
          <div className="flex flex-col gap-5">
            <TextField
              label={words.name}
              placeholder={words.namePlaceholder}
              autoComplete="organization"
              required
              {...text('name')}
            />
            <TextField
              label="البريد الإلكتروني"
              type="email"
              placeholder="alisalem@gmail.com"
              autoComplete="email"
              dir="ltr"
              style={{ textAlign: 'right' }}
              required
              {...text('email')}
            />
            <TextField
              label="رقم الهاتف"
              inputMode="tel"
              placeholder="55123456"
              autoComplete="tel"
              dir="ltr"
              style={{ textAlign: 'right' }}
              {...text('phone')}
            />
            <PasswordField
              label="كلمة المرور"
              placeholder="**************"
              autoComplete="new-password"
              required
              {...text('password')}
            />
            <PasswordField
              label="تأكيد كلمة المرور"
              placeholder="**************"
              autoComplete="new-password"
              required
              value={confirm}
              error={errors.confirm}
              onChange={(event) => setConfirm(event.target.value)}
            />
            <TextField
              label="الخدمات"
              placeholder="تصميم داخلي،تنفيذ،صيانة،إشراف"
              {...text('services')}
            />
            <TextField
              label="المقر الرئيسي"
              placeholder={words.hq}
              required
              icon={
                <MapPin
                  className="h-4.5 w-4.5 shrink-0 text-ink"
                  strokeWidth={1.5}
                />
              }
              {...text('hqLocation')}
            />
            {kind === 'company' && (
              <AreasSelect
                value={form.serviceAreas}
                error={errors.serviceAreas}
                onChange={(value) => set('serviceAreas', value)}
              />
            )}
            <FileDrop
              label={words.logo}
              action="لرفع ملفك"
              file={form.logo}
              onPick={(file) => set('logo', file)}
            />
          </div>
          <PrimaryButton>التالي</PrimaryButton>
        </form>
      ) : (
        <form
          onSubmit={submit}
          noValidate
          className="flex w-full flex-col gap-8"
        >
          <div className="flex flex-col gap-5">
            <TextArea
              label={words.about}
              placeholder="نبذة تعريفية..."
              value={form.about}
              onChange={(value) => set('about', value)}
            />
            <TextField
              label="نشاط الرخصة"
              placeholder="تشطيبات،بناء،ديكور،كهرباء"
              {...text('licenseActivity')}
            />
            <TextField
              label="رقم الرخصة"
              placeholder="ادخل رقم الرخصة"
              dir="ltr"
              style={{ textAlign: 'right' }}
              required
              {...text('licenseNumber')}
            />
            <TextField
              label="تاريخ انتهاء الرخصة"
              type="date"
              {...text('licenseExpiry')}
            />
            <FileDrop
              label="صورة الرخصة"
              action="لرفع صورة"
              note="صورة الرخصة تؤهلك لتوثيق حسابك"
              file={form.license}
              onPick={(file) => set('license', file)}
            />
          </div>

          <FormError message={error} />
          <div className="flex items-center gap-2">
            <PrimaryButton loading={loading} className="flex-1">
              إنشاء حساب
            </PrimaryButton>
            <button
              type="button"
              onClick={() => setStep(1)}
              className="flex h-12 w-25 items-center justify-center rounded-3xl text-sm font-bold text-ink"
            >
              السابق
            </button>
          </div>
        </form>
      )}

      <SuccessDialog
        open={done}
        title="تم إنشاء حسابك بنجاح!"
        text="أهلاً بك في بيوتنا. حسابك الآن قيد المراجعة، وسنبلغك فور اعتماده."
        action="ابدأ الاستكشاف"
        onAction={() => router.push('/')}
      />
    </>
  )
}
