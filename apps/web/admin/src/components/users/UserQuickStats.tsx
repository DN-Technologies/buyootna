'use client'

import { Star } from 'lucide-react'

// Placeholder metrics: reports/orders/sold-properties/ads/ratings have no
// backing aggregation in the admin API yet (no Report/Order model, no
// "sold" listing status, ratings summary isn't wired into AdminService).
const stats: {
  label: string
  value: string
  valueClassName?: string
  ratingCount?: string
  showStar?: boolean
}[] = [
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

export default function UserQuickStats() {
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
          {stat.showStar ? (
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
