'use client'

import Skeleton from '@/components/ui/Skeleton'

export interface BillingMetric {
  label: string
  value: string
  tone?: 'default' | 'positive' | 'warning'
}

const TONE: Record<NonNullable<BillingMetric['tone']>, string> = {
  default: 'text-[#111111]',
  positive: 'text-[#137333]',
  warning: 'text-[#B45309]',
}

export default function BillingMetrics({
  metrics,
  loading = false,
}: {
  metrics: BillingMetric[]
  loading?: boolean
}) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-['Cairo'] text-right">
      {metrics.map((metric) => (
        <div
          key={metric.label}
          className="bg-[#F8FAFC] border border-[#ECECEC] rounded-2xl p-5 flex flex-col justify-between gap-3"
        >
          <span className="text-[13px] font-medium text-[#6B6A6A]">
            {metric.label}
          </span>
          {loading ? (
            <Skeleton className="h-8 w-16" />
          ) : (
            <span
              className={`text-[28px] font-bold ${TONE[metric.tone ?? 'default']}`}
            >
              {metric.value}
            </span>
          )}
        </div>
      ))}
    </div>
  )
}
