'use client'

import { useMemo, useState } from 'react'
import UserAdsCreditCard from './UserAdsCreditCard'
import UserAdCard from './UserAdCard'
import AdDetailSheet from './AdDetailSheet'
import type { AdminUserProperty } from '@/lib/admin-users'

type AdsFilter = 'all' | 'active' | 'featured' | 'deleted'

export default function UserAdsTabContent({
  properties,
}: {
  properties: AdminUserProperty[]
}) {
  const [filter, setFilter] = useState<AdsFilter>('all')
  const [selectedProperty, setSelectedProperty] =
    useState<AdminUserProperty | null>(null)

  const activeCount = properties.filter(
    (p) => p.status === 'ACTIVE' && !p.isHidden,
  ).length
  const featuredCount = properties.filter((p) => p.isFeatured).length

  // "محذوف" has no real data source: Property rows are hard-deleted (no
  // soft-delete flag), so there is nothing to list here — shown as an
  // honest empty state rather than fabricated cards.
  const tabs: { id: AdsFilter; label: string; count: number }[] = [
    { id: 'all', label: 'الكل', count: properties.length },
    { id: 'active', label: 'نشطة', count: activeCount },
    { id: 'featured', label: 'مميزة', count: featuredCount },
    { id: 'deleted', label: 'محذوف', count: 0 },
  ]

  const filtered = useMemo(() => {
    if (filter === 'active') {
      return properties.filter((p) => p.status === 'ACTIVE' && !p.isHidden)
    }
    if (filter === 'featured') {
      return properties.filter((p) => p.isFeatured)
    }
    if (filter === 'deleted') {
      return []
    }
    return properties
  }, [properties, filter])

  return (
    <div className="flex flex-col gap-5 w-full" dir="rtl">
      <UserAdsCreditCard />

      <div className="bg-white border border-[#ECECEC] rounded-lg flex items-center w-full font-['Cairo'] overflow-hidden">
        {tabs.map((tab) => {
          const isActive = tab.id === filter
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`h-9 flex items-center justify-center px-3 text-[16px] cursor-pointer transition-colors ${
                isActive
                  ? 'bg-primary text-white font-bold'
                  : 'text-[#6B6A6A] font-normal hover:bg-[#F8FAFC]'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-[#6B6A6A] font-['Cairo']">
          {filter === 'deleted'
            ? 'لا يمكن عرض الإعلانات المحذوفة حالياً'
            : 'لا توجد إعلانات مطابقة'}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
          {filtered.map((property) => (
            <UserAdCard
              key={property.id}
              property={property}
              onViewDetails={setSelectedProperty}
            />
          ))}
        </div>
      )}

      {selectedProperty && (
        <AdDetailSheet
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
        />
      )}
    </div>
  )
}
