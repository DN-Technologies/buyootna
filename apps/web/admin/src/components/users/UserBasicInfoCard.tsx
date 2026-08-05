'use client'

import { Mail, MessageCircle, Phone, User } from 'lucide-react'
import type { ComponentType } from 'react'

export interface UserBasicInfoCardProps {
  email: string
  fullName: string
  whatsapp: string
  phone: string
  accountType: string
}

function Field({
  label,
  value,
  icon: Icon,
  iconClassName,
}: {
  label: string
  value: string
  icon: ComponentType<{ className?: string }>
  iconClassName?: string
}) {
  return (
    <div className="flex-1 flex items-center gap-2 py-6.5 min-w-0">
      <div className="bg-[#F5F7F9] rounded-md flex items-center justify-center shrink-0 size-7.5">
        <Icon className={`w-4 h-4 text-[#6B6A6A] ${iconClassName || ''}`} />
      </div>
      <div className="flex flex-col gap-2 text-right min-w-0">
        <p className="text-[12px] font-normal text-[#6B6A6A] leading-3.75">
          {label}
        </p>
        <p className="text-[14px] font-medium text-[#111111] tracking-[-0.408px] truncate max-w-full">
          {value || '—'}
        </p>
      </div>
    </div>
  )
}

export default function UserBasicInfoCard({
  email,
  fullName,
  whatsapp,
  phone,
  accountType,
}: UserBasicInfoCardProps) {
  return (
    <div
      className="bg-white border border-[#ECECEC] rounded-lg w-full font-['Cairo'] pb-2"
      dir="rtl"
    >
      <div className="border-b border-[#ECECEC] flex items-center h-14 px-5">
        <p className="font-semibold text-[16px] text-[#111111]">
          البيانات الاساسية
        </p>
      </div>

      <div className="flex items-stretch justify-between px-5 border-b border-[#ECECEC]">
        <Field label="البريد الإلكتروني" value={email} icon={Mail} />
        <div className="w-px bg-[#ECECEC] mx-4" />
        <Field label="الاسم الكامل" value={fullName} icon={User} />
      </div>

      <div className="flex items-stretch justify-between px-5 border-b border-[#ECECEC]">
        <Field
          label="رقم الواتس اب"
          value={whatsapp}
          icon={MessageCircle}
          iconClassName="text-[#25D366]"
        />
        <div className="w-px bg-[#ECECEC] mx-4" />
        <Field label="رقم الهاتف" value={phone} icon={Phone} />
      </div>

      <div className="flex px-5">
        <div className="w-full sm:w-1/2">
          <Field label="نوع الحساب" value={accountType} icon={User} />
        </div>
      </div>
    </div>
  )
}
