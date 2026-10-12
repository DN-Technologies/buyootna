'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

import { Field, FormError, TextField } from '@/components/auth/fields'
import SuccessDialog from '@/components/auth/SuccessDialog'
import {
  FormCard,
  FormFooter,
  Hint,
  ImagesField,
  OUTLINE_BUTTON,
  Row,
  SelectField,
  SOLID_BUTTON,
  TextBlock,
} from '@/components/forms/controls'
import MapPickerField, { type Coords } from '@/components/forms/MapPickerField'
import { createQuoteRequest, QUOTE_REQUEST_TYPES, uploadImages } from '@/lib/account'
import { errorMessage } from '@/lib/auth'
import { COMPANY_CATEGORIES } from '@/lib/categories'

const asChoices = (names: string[]) => names.map((name) => ({ id: name, label: name }))
const digits = (text: string) => text.replace(/[^\d]/g, '')

type Errors = Partial<Record<'specialty' | 'address' | 'description', string>>

/**
 * Asking service companies for a price: what is needed, a budget, where,
 * and photos or plans. Matching companies answer with offers.
 */
export default function QuoteForm() {
  const router = useRouter()
  const [specialty, setSpecialty] = useState('')
  const [requestType, setRequestType] = useState('')
  const [priceFrom, setPriceFrom] = useState('')
  const [priceTo, setPriceTo] = useState('')
  const [address, setAddress] = useState('')
  const [coords, setCoords] = useState<Coords | null>(null)
  const [description, setDescription] = useState('')
  const [files, setFiles] = useState<File[]>([])
  const [errors, setErrors] = useState<Errors>({})
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)

  const submit = async () => {
    const found: Errors = {}
    if (!specialty) found.specialty = 'يرجى اختيار مجال التخصص'
    if (!address.trim()) found.address = 'يرجى كتابة العنوان'
    if (!description.trim()) found.description = 'يرجى كتابة وصف الطلب'
    setErrors(found)
    if (Object.keys(found).length > 0) return

    setLoading(true)
    setError('')
    try {
      const images = await uploadImages(files)
      await createQuoteRequest({
        title: specialty,
        category: specialty,
        offerType: requestType || undefined,
        priceRange: priceFrom || priceTo ? `${priceFrom || 0} - ${priceTo || 0} د.ك` : undefined,
        location: address.trim(),
        latitude: coords?.lat,
        longitude: coords?.lng,
        description: description.trim(),
        images,
      })
      setDone(true)
    } catch (err) {
      setError(errorMessage(err, 'حدث خطأ أثناء إرسال الطلب. يرجى المحاولة لاحقاً'))
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="mx-auto flex w-full max-w-[1100px] flex-col gap-5 px-5 pb-10">
        <FormCard>
          <Row>
            <SelectField
              label="التخصص"
              placeholder="اختر نوع الخدمة أو اسم الشركة.."
              required
              options={asChoices(COMPANY_CATEGORIES)}
              value={specialty}
              error={errors.specialty}
              onChange={(id) => {
                setSpecialty(id)
                setErrors((current) => ({ ...current, specialty: undefined }))
              }}
            />
            <SelectField
              label="نوع الخدمة"
              placeholder="حدد الخدمة التي ترغب بها"
              options={asChoices(QUOTE_REQUEST_TYPES)}
              value={requestType}
              onChange={setRequestType}
            />
          </Row>

          <div className="flex flex-col gap-3">
            <span className="flex items-center gap-1.5 text-sm font-medium tracking-[-0.408px] text-ink">
              نطاق السعر
              <Hint text="حدد الميزانية المطلوبة لتظهر للشركات" />
            </span>
            <Row>
              <TextField
                label=""
                aria-label="السعر من"
                placeholder="من"
                inputMode="numeric"
                value={priceFrom}
                onChange={(event) => setPriceFrom(digits(event.target.value))}
              />
              <TextField
                label=""
                aria-label="السعر إلى"
                placeholder="الى"
                inputMode="numeric"
                value={priceTo}
                onChange={(event) => setPriceTo(digits(event.target.value))}
              />
            </Row>
          </div>

          <Row>
            <TextField
              label="العنوان"
              placeholder="مثال: حولي - السالمية، قطعة 4"
              required
              value={address}
              error={errors.address}
              onChange={(event) => {
                setAddress(event.target.value)
                setErrors((current) => ({ ...current, address: undefined }))
              }}
            />
            <MapPickerField
              label="الموقع على الخريطة"
              placeholder="حدد عنوانك على الخريطة"
              value={coords}
              onChange={setCoords}
            />
          </Row>

          <TextBlock
            label="وصف"
            placeholder="اشرح تفاصيل الخدمة المطلوبة..."
            required
            value={description}
            error={errors.description}
            onChange={(value) => {
              setDescription(value)
              setErrors((current) => ({ ...current, description: undefined }))
            }}
          />

          <Field label="">
            <ImagesField
              label="مرفقات"
              action="لرفع الصور"
              hint="أضف صورة أو مخطط بنيان لتظهر للشركات"
              files={files}
              onChange={setFiles}
            />
          </Field>
        </FormCard>
        <FormError message={error} />
      </div>

      <FormFooter>
        <button type="button" onClick={submit} disabled={loading} className={SOLID_BUTTON}>
          {loading ? 'جارٍ الإرسال…' : 'ارسال الطلب'}
        </button>
        <button type="button" onClick={() => router.back()} disabled={loading} className={OUTLINE_BUTTON}>
          إلغاء
        </button>
      </FormFooter>

      <SuccessDialog
        open={done}
        title="تم إرسال طلبك بنجاح"
        text="تم إرسال طلبك إلى الشركات المناسبة، وستتلقى عروض الأسعار قريباً."
        action="متابعة العروض"
        onAction={() => router.push('/activity')}
        secondary={{ label: 'العودة للرئيسية', onAction: () => router.push('/') }}
      />
    </>
  )
}
