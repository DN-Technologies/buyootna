'use client'

import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'

import { FormError, TextField } from '@/components/auth/fields'
import SuccessDialog from '@/components/auth/SuccessDialog'
import {
  FormCard,
  FormFooter,
  ImagesField,
  MultiSelectField,
  OUTLINE_BUTTON,
  RadioRow,
  Row,
  SelectField,
  SOLID_BUTTON,
  Stepper,
  TextBlock,
  Toast,
  Toggle,
} from '@/components/forms/controls'
import MapPickerField, { type Coords } from '@/components/forms/MapPickerField'
import Modal from '@/components/ui/Modal'
import {
  createAd,
  getFeatures,
  getPublishOptions,
  isOutOfAds,
  uploadImages,
  type AdPayload,
  type FeatureOption,
  type PublishOption,
} from '@/lib/account'
import { errorMessage, isPhone } from '@/lib/auth'
import { CATEGORY_LABELS, categoryCounts } from '@/lib/categories'
import { formatNumber } from '@/lib/format'
import { AREAS, GOVERNORATES } from '@/lib/locations'
import type { ListingType } from '@/lib/types'

const TYPES: { id: ListingType; label: string }[] = [
  { id: 'SALE', label: 'بيع' },
  { id: 'RENT', label: 'إيجار' },
  { id: 'EXCHANGE', label: 'بدل' },
]

// What a new ad can be listed as; an exchange is only ever land or a house
const NEW_AD_CATEGORIES = ['HOUSE', 'APARTMENT', 'COMMERCIAL', 'BUILDING', 'OFFICE', 'CHALET', 'FARM', 'LAND']
const categoriesOf = (type: ListingType) =>
  (type === 'EXCHANGE' ? ['LAND', 'HOUSE'] : NEW_AD_CATEGORIES).map((id) => ({
    id,
    label: CATEGORY_LABELS[id],
  }))

interface Form {
  type: ListingType
  governorateId: string
  areaId: string
  coords: Coords | null
  category: string
  areaSize: string
  propertyAge: string
  automatedNumber: string
  requestYear: string
  requiredYear: string
  beds: number
  baths: number
  floors: number
  features: string[]
  showPrice: boolean
  price: string
  showIncome: boolean
  income: string
  phone: string
  additionalExpenses: string
  rentConditions: string
  allocationStatus: string
  description: string
  slotId: string
  photos: File[]
}

const EMPTY: Form = {
  type: 'SALE',
  governorateId: '',
  areaId: '',
  coords: null,
  category: '',
  areaSize: '',
  propertyAge: '',
  automatedNumber: '',
  requestYear: '',
  requiredYear: '',
  beds: 1,
  baths: 1,
  floors: 1,
  features: [],
  showPrice: true,
  price: '',
  showIncome: false,
  income: '',
  phone: '',
  additionalExpenses: '',
  rentConditions: '',
  allocationStatus: '',
  description: '',
  slotId: '',
  photos: [],
}

type Errors = Partial<Record<keyof Form, string>>

const digits = (text: string) => text.replace(/[^\d]/g, '')
const isYear = (text: string) => /^(19|20)\d{2}$/.test(text)

/** One line of the preview: a grey label over its value. */
function Fact({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') return null
  return (
    <div className="flex flex-col gap-1">
      <span className="text-sm font-medium text-muted">{label}</span>
      <span className="text-[15px] font-bold whitespace-pre-line text-ink">{value}</span>
    </div>
  )
}

/**
 * Posting an ad: the form (its fields follow the listing type and the
 * category), then a preview, then publishing with the free ad or a package.
 * It can also be saved as a draft at either step.
 */
export default function AdForm({ onStep }: { onStep: (step: 'form' | 'preview') => void }) {
  const router = useRouter()
  const [form, setForm] = useState<Form>(EMPTY)
  const [errors, setErrors] = useState<Errors>({})
  const [step, setStep] = useState<'form' | 'preview'>('form')
  const [options, setOptions] = useState<PublishOption[] | null>(null)
  const [features, setFeatures] = useState<Record<ListingType, FeatureOption[]> | null>(null)
  const [busy, setBusy] = useState<'publish' | 'draft' | null>(null)
  const [error, setError] = useState('')
  const [toast, setToast] = useState('')
  const [publishedId, setPublishedId] = useState<string | null>(null)
  const [outOfAds, setOutOfAds] = useState(false)
  // One key per publish attempt: a retry returns the ad already made
  const [submissionKey, setSubmissionKey] = useState(() => crypto.randomUUID())

  const set = <K extends keyof Form>(key: K, value: Form[K]) => {
    setForm((current) => ({ ...current, [key]: value }))
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }))
  }
  const clearToast = useCallback(() => setToast(''), [])

  useEffect(() => {
    getPublishOptions()
      .then(({ options: found }) => {
        setOptions(found)
        setForm((current) => ({ ...current, slotId: found[0]?.slotId ?? '' }))
      })
      .catch(() => setOptions([]))
    getFeatures().then(setFeatures).catch(() => {})
  }, [])

  const exchange = form.type === 'EXCHANGE'
  const counts = categoryCounts(form.category || 'HOUSE')
  const areaOptions = AREAS[form.governorateId] ?? []
  const featureOptions = features?.[form.type] ?? []
  const governorate = GOVERNORATES.find((item) => item.id === form.governorateId)
  const area = areaOptions.find((item) => item.id === form.areaId)
  const location = [governorate?.label, area?.label].filter(Boolean).join(' - ')
  const free = options?.find((option) => option.type === 'FREE_QUOTA')

  const changeType = (type: ListingType) => {
    setForm((current) => ({
      ...current,
      type,
      // Categories and features differ by type
      category: categoriesOf(type).some((c) => c.id === current.category) ? current.category : '',
      features: [],
    }))
    setErrors({})
  }

  const validate = (): Errors => {
    const found: Errors = {}
    if (!form.governorateId) found.governorateId = 'المحافظة مطلوبة'
    if (!form.areaId) found.areaId = 'المنطقة مطلوبة'
    if (!form.coords) found.coords = 'حدد الموقع على الخريطة'
    if (!form.category) found.category = 'فئة العقار مطلوبة'
    if (!Number(form.areaSize)) found.areaSize = 'المساحة مطلوبة'
    if (exchange) {
      if (!isYear(form.requestYear)) found.requestYear = 'أدخل سنة صحيحة'
      if (!isYear(form.requiredYear)) found.requiredYear = 'أدخل سنة صحيحة'
    }
    if (form.showPrice && !Number(form.price)) found.price = 'أدخل السعر أو أوقف عرضه'
    if (!isPhone(form.phone)) found.phone = 'رقم الهاتف غير صحيح'
    if (!form.description.trim()) found.description = 'تفاصيل الإعلان مطلوبة'
    return found
  }

  const payload = (isDraft: boolean, images: string[]): AdPayload => ({
    isDraft,
    submissionKey: isDraft ? undefined : submissionKey,
    planSlotId: isDraft ? undefined : form.slotId || undefined,
    type: form.type,
    category: form.category,
    governorateId: form.governorateId,
    areaId: form.areaId || undefined,
    location,
    latitude: form.coords?.lat,
    longitude: form.coords?.lng,
    areaSize: Number(form.areaSize),
    beds: counts.rooms ? form.beds : undefined,
    baths: counts.baths ? form.baths : undefined,
    floors: counts.floors ? form.floors : undefined,
    propertyAge: !exchange && form.propertyAge ? Number(form.propertyAge) : undefined,
    automatedNumber: !exchange && form.automatedNumber ? form.automatedNumber : undefined,
    features: featureOptions.filter((feature) => form.features.includes(feature.id)),
    price: form.showPrice && form.price ? Number(form.price) : undefined,
    propertyIncome:
      form.type === 'SALE' && form.showIncome && form.income ? Number(form.income) : undefined,
    requestYear: exchange ? Number(form.requestYear) : undefined,
    requiredYear: exchange ? Number(form.requiredYear) : undefined,
    allocationStatus: exchange && form.allocationStatus ? form.allocationStatus.trim() : undefined,
    additionalExpenses:
      form.type === 'RENT' && form.additionalExpenses ? form.additionalExpenses.trim() : undefined,
    rentConditions:
      form.type === 'RENT' && form.rentConditions ? form.rentConditions.trim() : undefined,
    phoneNumber: form.phone.replace(/\s+/g, ''),
    description: form.description.trim(),
    images,
  })

  const goTo = (next: 'form' | 'preview') => {
    setStep(next)
    onStep(next)
    window.scrollTo({ top: 0 })
  }

  const preview = () => {
    const found = validate()
    setErrors(found)
    setError(Object.keys(found).length ? 'أكمل الحقول المطلوبة أولاً.' : '')
    if (Object.keys(found).length === 0) goTo('preview')
  }

  const send = async (isDraft: boolean) => {
    // A draft is checked like a published ad, so it is ready to go live later
    const found = validate()
    if (Object.keys(found).length > 0) {
      setErrors(found)
      setError('أكمل الحقول المطلوبة أولاً.')
      if (step === 'preview') goTo('form')
      return
    }
    if (!isDraft && options !== null && options.length === 0) {
      setOutOfAds(true)
      return
    }
    setBusy(isDraft ? 'draft' : 'publish')
    setError('')
    try {
      const images = await uploadImages(form.photos)
      const ad = await createAd(payload(isDraft, images))
      if (isDraft) {
        setToast('تم حفظ الاعلان كمسودة بنجاح.')
        setForm({ ...EMPTY, slotId: form.slotId })
        goTo('form')
      } else {
        setPublishedId(ad.id)
      }
    } catch (err) {
      if (isOutOfAds(err)) setOutOfAds(true)
      else setError(errorMessage(err, 'تعذر حفظ الإعلان. حاول مجدداً.'))
      // A failed publish may be retried with the same key; a refused one starts fresh
      if (isOutOfAds(err)) setSubmissionKey(crypto.randomUUID())
    } finally {
      setBusy(null)
    }
  }

  const photoUrls = useMemo(
    () => form.photos.map((file) => URL.createObjectURL(file)),
    [form.photos],
  )
  useEffect(() => () => photoUrls.forEach((url) => URL.revokeObjectURL(url)), [photoUrls])

  const number = (key: 'areaSize' | 'propertyAge' | 'price' | 'income' | 'requestYear' | 'requiredYear') => ({
    inputMode: 'numeric' as const,
    value: form[key],
    error: errors[key],
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => set(key, digits(event.target.value)),
  })

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-5 px-5 pb-10">
        {step === 'form' ? (
          <>
            {free && (
              <p className="flex items-center gap-3 rounded-lg bg-tag px-4 py-3">
                <span className="flex flex-col gap-0.5">
                  <span className="text-sm font-bold text-ink">لديك إعلان مجاني</span>
                  <span className="text-xs font-medium text-muted">{free.subtitle}</span>
                </span>
              </p>
            )}

            <FormCard title="نوع الإعلان">
              <RadioRow label="نوع الإعلان" options={TYPES} value={form.type} onChange={changeType} />
            </FormCard>

            <FormCard title="معلومات العقار">
              <Row>
                <SelectField
                  label="المحافظة"
                  placeholder="اختر المحافظة"
                  required
                  options={GOVERNORATES}
                  value={form.governorateId}
                  error={errors.governorateId}
                  onChange={(id) => {
                    setForm((current) => ({ ...current, governorateId: id, areaId: '' }))
                    setErrors((current) => ({ ...current, governorateId: undefined }))
                  }}
                />
                <SelectField
                  label="المنطقة"
                  placeholder="اختر المنطقة"
                  required
                  options={areaOptions}
                  value={form.areaId}
                  error={errors.areaId}
                  emptyText="اختر المحافظة أولاً."
                  onChange={(id) => set('areaId', id)}
                />
              </Row>
              <MapPickerField
                label="الموقع على الخريطة"
                placeholder="حدد الموقع على الخريطة"
                required
                value={form.coords}
                error={errors.coords}
                onChange={(coords) => set('coords', coords)}
              />
              <Row>
                <SelectField
                  label="فئة العقار"
                  placeholder="اختر نوع عقارك"
                  required
                  options={categoriesOf(form.type)}
                  value={form.category}
                  error={errors.category}
                  onChange={(id) => set('category', id)}
                />
                <TextField label="المساحة" placeholder="300 م2" required {...number('areaSize')} />
              </Row>
              {exchange ? (
                <Row>
                  <TextField label="سنة الطلب" placeholder="2020" required {...number('requestYear')} />
                  <TextField label="السنة المطلوبة" placeholder="2023" required {...number('requiredYear')} />
                </Row>
              ) : (
                <Row>
                  <TextField label="عمر العقار" placeholder="بالسنين" {...number('propertyAge')} />
                  <TextField
                    label="الرقم الآلي للعقار"
                    placeholder="76895409"
                    inputMode="numeric"
                    value={form.automatedNumber}
                    onChange={(event) => set('automatedNumber', digits(event.target.value))}
                  />
                </Row>
              )}
              {(counts.rooms || counts.baths || counts.floors) && (
                <div className="grid gap-5 sm:grid-cols-3">
                  {counts.rooms && (
                    <Stepper label="عدد الغرف" value={form.beds} onChange={(value) => set('beds', value)} />
                  )}
                  {counts.baths && (
                    <Stepper label="عدد الحمامات" value={form.baths} onChange={(value) => set('baths', value)} />
                  )}
                  {counts.floors && (
                    <Stepper label="عدد الأدوار" value={form.floors} onChange={(value) => set('floors', value)} />
                  )}
                </div>
              )}
              <MultiSelectField
                label="المزايا"
                placeholder="ما يميز عقارك"
                options={featureOptions}
                value={form.features}
                onChange={(ids) => set('features', ids)}
              />
            </FormCard>

            <FormCard title="السعر والتفاصيل">
              <div className="flex flex-col gap-3">
                <Toggle
                  label={form.type === 'RENT' ? 'الإيجار الشهري' : 'السعر'}
                  checked={form.showPrice}
                  onChange={(checked) => set('showPrice', checked)}
                />
                {form.showPrice && (
                  <TextField label="" aria-label="السعر" placeholder="بالدينار الكويتي" {...number('price')} />
                )}
              </div>
              {form.type === 'SALE' && (
                <div className="flex flex-col gap-3">
                  <Toggle
                    label="مدخول العقار"
                    checked={form.showIncome}
                    onChange={(checked) => set('showIncome', checked)}
                  />
                  {form.showIncome && (
                    <TextField label="" aria-label="مدخول العقار" placeholder="بالدينار الكويتي" {...number('income')} />
                  )}
                </div>
              )}
              <TextField
                label="رقم الهاتف"
                placeholder="99994496"
                inputMode="tel"
                dir="ltr"
                style={{ textAlign: 'right' }}
                required
                value={form.phone}
                error={errors.phone}
                icon={<span dir="ltr" className="shrink-0 text-sm text-muted">+965</span>}
                onChange={(event) => set('phone', event.target.value)}
              />
              {form.type === 'RENT' && (
                <>
                  <TextBlock
                    label="المصاريف الاضافية"
                    placeholder="اكتب المصاريف الاضافية ان وجدت"
                    value={form.additionalExpenses}
                    onChange={(value) => set('additionalExpenses', value)}
                  />
                  <TextBlock
                    label="شروط الايجار"
                    placeholder="اكتب شروط الايجار ان وجدت"
                    value={form.rentConditions}
                    onChange={(value) => set('rentConditions', value)}
                  />
                </>
              )}
              {exchange && (
                <TextBlock
                  label="حالة التخصيص"
                  placeholder="اكتب حالة التخصيص"
                  value={form.allocationStatus}
                  onChange={(value) => set('allocationStatus', value)}
                />
              )}
              <TextBlock
                label="تفاصيل الاعلان"
                placeholder="اكتب وصفاً عن العقار وأهم ما يميزه"
                required
                value={form.description}
                error={errors.description}
                onChange={(value) => set('description', value)}
              />

              {options && options.length > 0 && (
                <div className="flex flex-col gap-3">
                  <span className="text-sm font-medium tracking-[-0.408px] text-ink">اختر نوع اعلانك</span>
                  <div role="radiogroup" aria-label="نوع اعلانك" className="grid gap-3 sm:grid-cols-2">
                    {options.map((option) => {
                      const selected = option.slotId === form.slotId
                      const paid = option.type !== 'FREE_QUOTA'
                      return (
                        <button
                          key={option.slotId}
                          type="button"
                          role="radio"
                          aria-checked={selected}
                          onClick={() => set('slotId', option.slotId)}
                          className={`flex min-h-12 flex-col justify-center gap-0.5 rounded-lg px-4 py-2 text-right ${
                            paid ? 'bg-linear-to-l from-[#FF8D28] to-[#FACC15]' : 'bg-tag'
                          } ${selected ? 'ring-2 ring-brand ring-offset-2' : ''}`}
                        >
                          <span className="text-sm font-bold text-ink">{option.title}</span>
                          <span className="text-xs font-medium text-ink/70">{option.subtitle}</span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}
            </FormCard>

            <FormCard title="الصور">
              <ImagesField
                label="صور العقار"
                action="لرفع صورة"
                files={form.photos}
                onChange={(files) => set('photos', files)}
              />
            </FormCard>
          </>
        ) : (
          <FormCard>
            <p className="text-sm font-medium text-ink">هذه معاينة لكيف سيظهر إعلانك للمستخدمين</p>
            <Fact label="نوع الاعلان" value={TYPES.find((type) => type.id === form.type)?.label} />
            <div className="grid gap-5 sm:grid-cols-2">
              <Fact label="فئة العقار" value={CATEGORY_LABELS[form.category]} />
              <Fact label="المساحة" value={`${formatNumber(Number(form.areaSize))} م2`} />
              {exchange ? (
                <>
                  <Fact label="سنة الطلب" value={form.requestYear} />
                  <Fact label="السنة المطلوبة" value={form.requiredYear} />
                </>
              ) : (
                <>
                  <Fact label="عمر العقار" value={form.propertyAge && `${form.propertyAge} سنة`} />
                  <Fact label="الرقم الآلي للعقار" value={form.automatedNumber} />
                </>
              )}
              {counts.rooms && <Fact label="عدد الغرف" value={form.beds} />}
              {counts.baths && <Fact label="عدد الحمامات" value={form.baths} />}
              {counts.floors && <Fact label="عدد الأدوار" value={form.floors} />}
              <Fact
                label={form.type === 'RENT' ? 'الإيجار الشهري' : 'السعر'}
                value={form.showPrice ? `${formatNumber(Number(form.price))} د.ك` : 'غير معلن'}
              />
              {form.type === 'SALE' && form.showIncome && (
                <Fact label="مدخول العقار" value={form.income && `${formatNumber(Number(form.income))} د.ك`} />
              )}
              <Fact
                label="المزايا"
                value={featureOptions
                  .filter((feature) => form.features.includes(feature.id))
                  .map((feature) => feature.label)
                  .join('، ')}
              />
              <Fact label="رقم الهاتف" value={form.phone} />
            </div>
            <Fact label="الموقع" value={location} />
            <Fact label="المصاريف الاضافية" value={form.type === 'RENT' ? form.additionalExpenses : ''} />
            <Fact label="شروط الايجار" value={form.type === 'RENT' ? form.rentConditions : ''} />
            <Fact label="حالة التخصيص" value={exchange ? form.allocationStatus : ''} />
            <Fact label="تفاصيل الاعلان" value={form.description} />
            <Fact
              label="نوع الاعلان"
              value={options?.find((option) => option.slotId === form.slotId)?.title}
            />
            {photoUrls.length > 0 && (
              <div className="flex flex-col gap-2">
                <span className="text-sm font-medium text-muted">الصور</span>
                <div className="flex flex-wrap gap-3">
                  {photoUrls.map((url) => (
                    // eslint-disable-next-line @next/next/no-img-element -- a local preview
                    <img key={url} src={url} alt="" className="h-[110px] w-[150px] rounded-md object-cover" />
                  ))}
                </div>
              </div>
            )}
          </FormCard>
        )}
        <FormError message={error} />
      </div>

      <FormFooter>
        <div className="flex items-center gap-3">
          {step === 'form' ? (
            <button type="button" onClick={preview} disabled={busy !== null} className={SOLID_BUTTON}>
              معاينة ونشر
            </button>
          ) : (
            <button type="button" onClick={() => send(false)} disabled={busy !== null} className={SOLID_BUTTON}>
              {busy === 'publish' ? 'جارٍ النشر…' : 'نشر الاعلان'}
            </button>
          )}
          <button type="button" onClick={() => send(true)} disabled={busy !== null} className={OUTLINE_BUTTON}>
            {busy === 'draft' ? 'جارٍ الحفظ…' : 'حفظ كمسودة'}
          </button>
        </div>
        <button
          type="button"
          onClick={() => (step === 'preview' ? goTo('form') : router.back())}
          disabled={busy !== null}
          className={OUTLINE_BUTTON}
        >
          {step === 'preview' ? 'تعديل' : 'إلغاء'}
        </button>
      </FormFooter>

      <Toast text={toast} onDone={clearToast} />

      <SuccessDialog
        open={publishedId !== null}
        title="تم إضافة الاعلان بنجاح!"
        text="يمكن للمستخدمين الآن مشاهدة إعلانك والتواصل معك مباشرة."
        action="عرض الإعلان"
        onAction={() => router.push(`/properties/${publishedId}`)}
        secondary={{ label: 'العودة للرئيسية', onAction: () => router.push('/') }}
      />

      <Modal open={outOfAds} onClose={() => setOutOfAds(false)} labelledBy="out-of-ads-title" className="max-w-[440px]">
        <div className="flex flex-col items-center gap-6 p-6 text-center">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-surface">
            <Image src="/landing/modal-warning.svg" alt="" width={28} height={28} />
          </span>
          <div className="flex flex-col gap-3">
            <h2 id="out-of-ads-title" className="text-lg font-bold text-ink">
              لقد استهلكت جميع إعلاناتك المجانية
            </h2>
            <p className="text-[15px] leading-normal font-medium text-muted">
              لتتمكن من نشر عقار جديد والوصول إلى آلاف المشترين يومياً، يرجى ترقية حسابك وشراء
              باقات اعلانات مميزة من تطبيق بيوتنا.
            </p>
          </div>
          <div className="flex w-full gap-3">
            <button
              type="button"
              onClick={() => router.push('/#app')}
              className="flex h-12 flex-1 items-center justify-center rounded-3xl bg-brand text-sm font-bold text-white transition hover:bg-brand-dark"
            >
              استعرض الباقات
            </button>
            <button
              type="button"
              onClick={() => setOutOfAds(false)}
              className="flex h-12 flex-1 items-center justify-center rounded-3xl border border-[#E2E8F0] bg-white text-sm font-bold text-ink"
            >
              إلغاء
            </button>
          </div>
        </div>
      </Modal>
    </>
  )
}
