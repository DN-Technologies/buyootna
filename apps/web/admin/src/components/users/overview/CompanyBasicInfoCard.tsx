'use client'

import { Mail, MessageCircle, Phone, User, MapPin, Clock, Hash, Building2 } from 'lucide-react'
import type { ComponentType } from 'react'
import Skeleton from '@/components/ui/Skeleton'

export interface CompanyBasicInfoCardProps {
  email: string
  fullName: string
  whatsapp: string
  phone: string
  serviceAreas?: string
  workingHours?: {
    weekday?: string
    weekend?: string
  }
  accountType?: string
  licenseNumber?: string | null
  loading?: boolean
}

function Field({
  label,
  value,
  icon: Icon,
  iconClassName,
  loading = false,
  children,
}: {
  label: string
  value?: string
  icon: ComponentType<{ className?: string }>
  iconClassName?: string
  loading?: boolean
  children?: React.ReactNode
}) {
  return (
    <div className="flex-1 flex items-center gap-2 py-5 px-5 min-w-0">
      <div className="bg-[#F5F7F9] rounded-md flex items-center justify-center shrink-0 size-7.5">
        <Icon className={`w-4 h-4 text-[#6B6A6A] ${iconClassName || ''}`} />
      </div>
      <div className="flex flex-col gap-1.5 text-right min-w-0 flex-1">
        <p className="text-[12px] font-normal text-[#6B6A6A] leading-tight">
          {label}
        </p>
        {loading ? (
          <Skeleton className="h-5 w-32" />
        ) : children ? (
          children
        ) : (
          <p className="text-[14px] font-medium text-[#111111] tracking-[-0.408px] truncate max-w-full">
            {value || '—'}
          </p>
        )}
      </div>
    </div>
  )
}

export default function CompanyBasicInfoCard({
  email,
  fullName,
  whatsapp,
  phone,
  serviceAreas = 'كافة المناطق',
  workingHours = {
    weekday: 'الأحد - الخميس: 9:00 ص - 8:00 م.',
    weekend: 'الجمعة والسبت: مغلق.',
  },
  accountType = 'شركة',
  licenseNumber,
  loading = false,
}: CompanyBasicInfoCardProps) {
  return (
    <div
      className="bg-white border border-[#ECECEC] rounded-lg w-full font-['Cairo']"
      dir="rtl"
    >
      <div className="border-b border-[#ECECEC] flex items-center h-14 px-5">
        <p className="font-semibold text-[16px] text-[#111111]">
          البيانات الاساسية
        </p>
      </div>

      {/* Row 1 */}
      <div className="flex items-stretch justify-between border-b border-[#ECECEC]">
        <Field label="البريد الإلكتروني" value={email} icon={Mail} loading={loading} />
        <div className="w-px bg-[#ECECEC]" />
        <Field label="الاسم الكامل" value={fullName} icon={User} loading={loading} />
      </div>

      {/* Row 2 */}
      <div className="flex items-stretch justify-between border-b border-[#ECECEC]">
        <Field
          label="رقم الواتس اب"
          value={whatsapp}
          icon={MessageCircle}
          iconClassName="text-[#25D366]"
          loading={loading}
        />
        <div className="w-px bg-[#ECECEC]" />
        <Field label="رقم الهاتف" value={phone} icon={Phone} loading={loading} />
      </div>

      {/* Row 3 */}
      <div className="flex items-stretch justify-between border-b border-[#ECECEC]">
        <Field label="مواعيد العمل" icon={Clock} loading={loading}>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-medium bg-slate-50 text-[#111111]">
              <span className="size-1.5 rounded-full bg-[#018B1B]" />
              {workingHours.weekday}
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-medium bg-slate-50 text-[#111111]">
              <span className="size-1.5 rounded-full bg-[#9C1E28]" />
              {workingHours.weekend}
            </span>
          </div>
        </Field>
        <div className="w-px bg-[#ECECEC]" />
        <Field label="مناطق تقديم الخدمات" value={serviceAreas} icon={MapPin} loading={loading} />
      </div>

      {/* Row 4 */}
      <div className="flex items-stretch justify-between">
        <Field label="نوع الحساب" value={accountType} icon={Building2} loading={loading} />
        <div className="w-px bg-[#ECECEC]" />
        <Field label="رقم الرخصة" value={licenseNumber || '—'} icon={Hash} loading={loading} />
      </div>
    </div>
  )
}
