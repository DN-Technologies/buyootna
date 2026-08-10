'use client'

import { Star } from 'lucide-react'
import Skeleton from '@/components/ui/Skeleton'

export interface UserQuickStatsProps {
  isOffice?: boolean
  loading?: boolean
}

export default function UserQuickStats({
  isOffice = false,
  loading = false,
}: UserQuickStatsProps) {
  const individualStats = [
    { label: 'البلاغات', value: '1', valueClassName: 'text-[#9C1E28]' },
    {
      label: 'التقييم',
      ratingCount: '(٢١٤ تقييم)',
      value: '3.5',
      showStar: true,
    },
    { label: 'الطلبات', value: '2' },
    { label: 'العقارات المباعة', value: '2' },
    { label: 'الاعلانات', value: '1' },
  ]

  const officeStats = [
    { label: 'الاعلانات', value: '1' },
    { label: 'الخدمات', value: '2' },
    {
      label: 'التقييم',
      ratingCount: '(٢١٤ تقييم)',
      value: '3.5',
      showStar: true,
    },
    { label: 'البلاغات', value: '1', valueClassName: 'text-[#9C1E28]' },
  ]

  const stats = isOffice ? officeStats : individualStats

  return (
    <div
      className="flex items-center gap-4 px-6 md:px-8 w-full font-['Cairo']"
      dir="rtl"
    >
      {stats.map((stat) => (
        <div
          key={stat.label}
          className="bg-[#F8FAFC] flex-1 flex flex-col gap-1.5 justify-center px-4 py-3 rounded-lg min-w-0"
        >
          <p className="text-[13px] font-medium text-[#6B6A6A] whitespace-nowrap">
            {stat.label}
          </p>
          {loading ? (
            <Skeleton className="h-6 w-12 rounded-sm" />
          ) : stat.showStar ? (
            <div className="flex items-center gap-1.5">
              <Star className="w-3.5 h-3.5" fill="#F5B846" stroke="#F5B846" />
              <span className="text-[18px] font-bold text-[#111111]">
                {stat.value}
              </span>
              <span className="text-[14px] font-medium text-[#6B6A6A] whitespace-nowrap">
                {stat.ratingCount}
              </span>
            </div>
          ) : (
            <p
              className={`text-[18px] font-bold ${stat.valueClassName || 'text-[#111111]'}`}
            >
              {stat.value}
            </p>
          )}
        </div>
      ))}
    </div>
  )
}
