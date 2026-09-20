'use client'

import React from 'react'
import StatCard, { StatCardProps } from '@/components/StatCard'

export interface MetricItem extends StatCardProps {
  id: string
}

const DEFAULT_METRICS: MetricItem[] = [
  {
    id: 'users',
    title: 'إجمالي المستخدمين',
    count: '0',
    change: '0%',
    variant: 'green',
  },
  {
    id: 'demo',
    title: 'الحسابات التجريبية',
    count: '0',
    change: '0%',
    variant: 'green',
  },
  {
    id: 'reports',
    title: 'البلاغات الجديدة',
    count: '0',
    change: '0%',
    variant: 'red',
  },
  {
    id: 'revenue',
    title: 'إجمالي الإيرادات',
    count: '0 د.ك',
    change: '0%',
    variant: 'green',
  },
]

interface MetricsGridProps {
  metrics?: MetricItem[]
}

export default function MetricsGrid({ metrics = DEFAULT_METRICS }: MetricsGridProps) {
  return (
    <div
      className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full"
      dir="rtl"
    >
      {metrics.map((metric) => (
        <StatCard
          key={metric.id}
          title={metric.title}
          count={metric.count}
          change={metric.change}
          variant={metric.variant}
        />
      ))}
    </div>
  )
}
