'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Mail } from 'lucide-react'

export interface UserDetailHeaderProps {
  name: string
  email: string
  accountType: string
  planLabel: string
  statusLabel: 'نشط' | 'محظور' | 'موقوف'
  avatarUrl?: string | null
}

const statusStyles: Record<string, string> = {
  نشط: 'bg-[rgba(18,194,129,0.1)] text-[#018B1B]',
  محظور: 'bg-[#FEF3F2] text-[#9C1E28]',
  موقوف: 'bg-[#FFFBEB] text-[#B45309]',
}

const breadcrumbs = ['الرئيسية', 'إدارة الحسابات', 'المستخدمون']

export default function UserDetailHeader({
  name,
  email,
  accountType,
  planLabel,
  statusLabel,
  avatarUrl,
}: UserDetailHeaderProps) {
  const trail = [...breadcrumbs, name]

  return (
    <div
      className="border-b border-[#ECECEC] flex flex-col gap-2 pb-4 pt-3 px-6 md:px-8 w-full text-right font-['Cairo']"
      dir="rtl"
    >
      {/* Breadcrumb */}
      <div className="flex gap-1.5 items-center justify-start text-[14px]">
        {trail.map((crumb, idx) => (
          <Fragment key={idx}>
            <span
              className={
                idx === trail.length - 1
                  ? 'text-[#111111] font-normal'
                  : 'text-[#A0A0A0] font-normal'
              }
            >
              {crumb}
            </span>
            {idx < trail.length - 1 && (
              <ChevronLeft className="w-3 h-3 text-[#A0A0A0]" />
            )}
          </Fragment>
        ))}
      </div>

      {/* Back link */}
      <Link
        href="/users"
        className="flex items-center gap-1 text-[14px] text-[#111111] w-fit"
      >
        <ChevronRight className="w-3 h-3" />
        <span>العودة</span>
      </Link>

      {/* Title row: kept as a tight right-aligned cluster (avatar beside the
          name), not spread across the full width */}
      <div className="flex items-center gap-2 pt-1">
        <div className="relative rounded-full size-16 overflow-hidden bg-[#F1F5F9] border border-[#ECECEC] shrink-0">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-[#6B6A6A] font-bold text-[20px]">
              {name?.charAt(0) || '؟'}
            </div>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3.5 flex-wrap">
            <h1 className="font-bold text-[22px] text-[#111111]">{name}</h1>
            <div className="flex items-center gap-2">
              <span
                className={`h-5 flex items-center gap-1 px-1.5 rounded-full text-[12px] font-medium ${
                  statusStyles[statusLabel] || statusStyles['نشط']
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-current" />
                <span>{statusLabel}</span>
              </span>
              <span className="h-5 flex items-center px-1.5 rounded-full text-[12px] font-medium bg-[#F7F2F6] text-[#344054]">
                {planLabel}
              </span>
            </div>
          </div>
          <div className="flex-col items-center gap-3.5 text-[14px] text-[#6B6A6A] font-medium flex-wrap">
            <span className="flex items-center gap-1">
              <Mail className="w-4 h-4" />
              {email}
            </span>
            <span>{accountType}</span>
          </div>
        </div>
      </div>
    </div>
  )
}
