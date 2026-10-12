'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

import { FormError, TextField } from '@/components/auth/fields'
import SuccessDialog from '@/components/auth/SuccessDialog'
import {
  FormCard,
  FormFooter,
  MultiSelectField,
  OUTLINE_BUTTON,
  RadioRow,
  Row,
  SelectField,
  SOLID_BUTTON,
  Stepper,
} from '@/components/forms/controls'
import { createAlert, getFeatures, type FeatureOption } from '@/lib/account'
import { errorMessage } from '@/lib/auth'
import { categoriesFor } from '@/lib/categories'
import { AREAS, GOVERNORATES } from '@/lib/locations'
import type { ListingType } from '@/lib/types'

const TYPES: { id: ListingType; label: string }[] = [
  { id: 'SALE', label: 'بيع' },
  { id: 'RENT', label: 'إيجار' },
  { id: 'EXCHANGE', label: 'بدل' },
]

const digits = (text: string) => text.replace(/[^\d]/g, '')
const isYear = (text: string) => /^(19|20)\d{2}$/.test(text)

/**
 * A standing search: tells the account when an ad matching it is posted.
 * What can be asked for follows the kind of deal.
 */
export default function AlertForm() {
  const router = useRouter()
  const [type, setType] = useState<ListingType>('SALE')
  const [governorateId, setGovernorateId] = useState('')
  const [areaId, setAreaId] = useState('')
  const [category, setCategory] = useState('')
  const [price, setPrice] = useState('')
  const [areaSize, setAreaSize] = useState('')
  const [requestYear, setRequestYear] = useState('')
  const [requiredYear, setRequiredYear] = useState('')
  const [rooms, setRooms] = useState(0)
  const [baths, setBaths] = useState(0)
  const [floors, setFloors] = useState(0)
  const [amenities, setAmenities] = useState<string[]>([])
  const [features, setFeatures] = useState<Record<ListingType, FeatureOption[]> | null>(null)
  const [fieldError, setFieldError] = useState<{ governorate?: string; year?: string }>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  useEffect(() => {
    getFeatures().then(setFeatures).catch(() => {})
  }, [])

  const exchange = type === 'EXCHANGE'
  const categoryOptions = categoriesFor(type)

  const changeType = (next: ListingType) => {
    setType(next)
    setAmenities([])
    if (!categoriesFor(next).some((option) => option.id === category)) setCategory('')
  }

  const submit = async () => {
    const found = {
      governorate: governorateId ? undefined : 'المحافظة مطلوبة',
      year:
        exchange && [requestYear, requiredYear].some((year) => year && !isYear(year))
          ? 'أدخل سنة صحيحة'
          : undefined,
    }
    setFieldError(found)
    if (found.governorate || found.year) return

    setLoading(true)
    setError('')
    try {
      await createAlert({
        type: 'PROPERTIES',
        operationType: type,
        governorateId,
        areaId: areaId || undefined,
        categoryId: category || undefined,
        price: type === 'SALE' && price ? Number(price) : undefined,
        rentValue: type === 'RENT' && price ? Number(price) : undefined,
        areaSize: !exchange && areaSize ? Number(areaSize) : undefined,
        requestYear: exchange && requestYear ? Number(requestYear) : undefined,
        requiredYear: exchange && requiredYear ? Number(requiredYear) : undefined,
        rooms: exchange && rooms > 0 ? rooms : undefined,
        baths: exchange && baths > 0 ? baths : undefined,
        floors: exchange && floors > 0 ? floors : undefined,
        amenities: amenities.length ? amenities : undefined,
      })
      setDone(true)
    } catch (err) {
      setError(errorMessage(err, 'تعذر إضافة التنبيه. حاول مجدداً.'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-5 px-5 pb-10">
        <p className="text-sm font-medium text-ink">
          تابع العقارات التي تهمك ليصلك اشعار في حالة توافر الطلب.
        </p>

        <FormCard title="نوع العملية">
          <RadioRow label="نوع العملية" options={TYPES} value={type} onChange={changeType} />
        </FormCard>

        <FormCard title="معلومات العقار">
          <Row>
            <SelectField
              label="المحافظة"
              placeholder="اختر المحافظة"
              required
              options={GOVERNORATES}
              value={governorateId}
              error={fieldError.governorate}
              onChange={(id) => {
                setGovernorateId(id)
                setAreaId('')
                setFieldError((current) => ({ ...current, governorate: undefined }))
              }}
            />
            <SelectField
              label="المنطقة"
              placeholder="اختر المنطقة"
              options={AREAS[governorateId] ?? []}
              value={areaId}
              emptyText="اختر المحافظة أولاً."
              onChange={setAreaId}
            />
          </Row>
          {exchange && (
            <Row>
              <TextField
                label="سنة الطلب"
                placeholder="2020"
                inputMode="numeric"
                value={requestYear}
                error={fieldError.year}
                onChange={(event) => setRequestYear(digits(event.target.value))}
              />
              <TextField
                label="السنة المطلوبة"
                placeholder="2023"
                inputMode="numeric"
                value={requiredYear}
                onChange={(event) => setRequiredYear(digits(event.target.value))}
              />
            </Row>
          )}
          <SelectField
            label="فئة العقار"
            placeholder="اختر نوع عقارك"
            options={categoryOptions}
            value={category}
            onChange={setCategory}
          />
          {/* Zero means any number */}
          {exchange ? (
            <div className="grid gap-5 sm:grid-cols-3">
              <Stepper label="عدد الغرف" value={rooms} onChange={setRooms} />
              <Stepper label="عدد الحمامات" value={baths} onChange={setBaths} />
              <Stepper label="عدد الأدوار" value={floors} onChange={setFloors} />
            </div>
          ) : (
            <Row>
              <TextField
                label={type === 'RENT' ? 'قيمة الايجار' : 'السعر'}
                placeholder="بالدينار الكويتي"
                inputMode="numeric"
                value={price}
                onChange={(event) => setPrice(digits(event.target.value))}
              />
              <TextField
                label="المساحة"
                placeholder="300 م2"
                inputMode="numeric"
                value={areaSize}
                onChange={(event) => setAreaSize(digits(event.target.value))}
              />
            </Row>
          )}
          <MultiSelectField
            label="المزايا"
            placeholder="ما يميز عقارك"
            options={features?.[type] ?? []}
            value={amenities}
            onChange={setAmenities}
          />
        </FormCard>
        <FormError message={error} />
      </div>

      <FormFooter>
        <button type="button" onClick={submit} disabled={loading} className={SOLID_BUTTON}>
          {loading ? 'جارٍ الإضافة…' : 'إضافة تنبيه'}
        </button>
        <button type="button" onClick={() => router.back()} disabled={loading} className={OUTLINE_BUTTON}>
          إلغاء
        </button>
      </FormFooter>

      <SuccessDialog
        open={done}
        title="تم تفعيل التنبيه"
        text="سنخبرك فور توفر نتائج مطابقة لاهتماماتك"
        action="عرض تنبيهاتي"
        onAction={() => router.push('/activity')}
        secondary={{ label: 'العودة للرئيسية', onAction: () => router.push('/') }}
      />
    </>
  )
}
