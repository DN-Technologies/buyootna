'use client'

import { Star } from 'lucide-react'
import Skeleton from '@/components/ui/Skeleton'

export interface UserQuickStatsValues {
  reportsCount?: number
  ratingAverage?: number
  ratingCount?: number
  requestsCount?: number
  adsCount?: number
  servicesCount?: number
  soldCount?: number
}

export interface UserQuickStatsProps {
  isOffice?: boolean
  userRole?: 'INDIVIDUAL' | 'OFFICE' | 'COMPANY'
  loading?: boolean
  stats?: UserQuickStatsValues
}

function fmt(value: number | undefined): string {
  return value === undefined ? '—' : String(value)
}

interface StatDisplay {
  label: string
  value: string
  valueClassName?: string
  ratingCount?: string
  showStar?: boolean
}

export default function UserQuickStats({
  isOffice = false,
  userRole,
  loading = false,
  stats: values = {},
}: UserQuickStatsProps) {
  const role = userRole || (isOffice ? 'OFFICE' : 'INDIVIDUAL')

  const ratingDisplay: StatDisplay = {
    label: 'التقييم',
    ratingCount: values.ratingCount !== undefined ? `(${values.ratingCount} تقييم)` : '',
    value: values.ratingAverage !== undefined ? values.ratingAverage.toFixed(1) : '—',
    showStar: true,
  }

  const individualStats: StatDisplay[] = [
    {
      label: 'البلاغات',
      value: fmt(values.reportsCount),
      valueClassName: 'text-[#9C1E28]',
    },
    ratingDisplay,
    { label: 'الطلبات', value: fmt(values.requestsCount) },
    // Ads deleted with the «تم البيع» reason (IdentityStatsService)
    { label: 'العقارات المباعة', value: fmt(values.soldCount) },
    { label: 'الاعلانات', value: fmt(values.adsCount) },
  ]

  const officeStats: StatDisplay[] = [
    { label: 'الاعلانات', value: fmt(values.adsCount) },
    { label: 'الخدمات', value: fmt(values.servicesCount) },
    ratingDisplay,
    {
      label: 'البلاغات',
      value: fmt(values.reportsCount),
      valueClassName: 'text-[#9C1E28]',
    },
  ]

  const companyStats: StatDisplay[] = [
    { label: 'الخدمات', value: fmt(values.servicesCount) },
    { label: 'الطلبات', value: fmt(values.requestsCount) },
    ratingDisplay,
    {
      label: 'البلاغات',
      value: fmt(values.reportsCount),
      valueClassName: 'text-[#9C1E28]',
    },
  ]

  const stats =
    role === 'COMPANY'
      ? companyStats
      : role === 'OFFICE'
        ? officeStats
        : individualStats

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
