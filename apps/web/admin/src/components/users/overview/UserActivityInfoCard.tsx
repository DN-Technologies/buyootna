'use client'

import { Calendar } from 'lucide-react'
import Skeleton from '@/components/ui/Skeleton'

export interface UserActivityInfoCardProps {
  lastActivity: string
  lastLogin: string
  joinedAt: string
  loading?: boolean
}

export default function UserActivityInfoCard({
  lastActivity,
  lastLogin,
  joinedAt,
  loading = false,
}: UserActivityInfoCardProps) {
  const items = [
    { label: 'آخر نشاط', value: lastActivity },
    { label: 'اخر تسجيل دخول', value: lastLogin },
    { label: 'تاريخ الانضمام', value: joinedAt },
  ]

  return (
    <div
      className="bg-white border border-[#ECECEC] rounded-lg w-full font-['Cairo']"
      dir="rtl"
    >
      <div className="border-b border-[#ECECEC] flex items-center h-14 px-5">
        <p className="font-semibold text-[16px] text-[#111111]">
          معلومات النشاط
        </p>
      </div>
      <div className="flex items-start gap-2 px-5 py-5 flex-wrap">
        {items.map((item) => (
          <div
            key={item.label}
            className="flex-1 min-w-40 flex items-center gap-2.5"
          >
            <div className="bg-[#F5F7F9] rounded-md flex items-center justify-center shrink-0 size-7.5">
              <Calendar className="w-4 h-4 text-[#6B6A6A]" />
            </div>
            <div className="flex flex-col gap-1 text-right flex-1 min-w-0">
              <p className="text-[13px] font-medium text-[#6B6A6A] leading-[1.2] whitespace-nowrap">
                {item.label}
              </p>
              {loading ? (
                <Skeleton className="h-5 w-28" />
              ) : (
                <p className="text-[14px] font-medium text-[#111111] tracking-[-0.408px] whitespace-nowrap">
                  {item.value || '—'}
                </p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
