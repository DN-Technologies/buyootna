'use client'

import { useEffect, useMemo, useState } from 'react'
import { Megaphone } from 'lucide-react'
import UserAdsCreditCard from './UserAdsCreditCard'
import UserAdCard from './UserAdCard'
import AdDetailSheet from './AdDetailSheet'
import type { AdminUserProperty } from '@/lib/admin-users'
import { AdminUserWallet, fetchUserWallet } from '@/lib/admin-plans'

type AdsFilter = 'all' | 'active' | 'featured' | 'hidden'

export default function UserAdsTabContent({
  properties,
  userId,
  identityId,
  onRefresh,
}: {
  properties: AdminUserProperty[]
  userId: string
  // The page's selected persona: its own free ad and credits
  identityId?: string
  onRefresh?: () => void
}) {
  const [filter, setFilter] = useState<AdsFilter>('all')
  const [selectedProperty, setSelectedProperty] =
    useState<AdminUserProperty | null>(null)
  const [wallet, setWallet] = useState<AdminUserWallet | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchUserWallet(userId, identityId)
      .then((data) => {
        if (!cancelled) setWallet(data)
      })
      .catch((err) => console.error('Failed to load wallet:', err))
    return () => {
      cancelled = true
    }
  }, [userId, identityId])

  const activeCount = properties.filter(
    (p) => p.status === 'ACTIVE' && !p.isHidden,
  ).length
  const featuredCount = properties.filter((p) => p.isFeatured).length
  // Hidden by the admin or the owner («اخفاء»)
  const hiddenCount = properties.filter((p) => p.isHidden).length

  const tabs: { id: AdsFilter; label: string; count: number }[] = [
    { id: 'all', label: 'الكل', count: properties.length },
    { id: 'active', label: 'نشطة', count: activeCount },
    { id: 'featured', label: 'مميزة', count: featuredCount },
    { id: 'hidden', label: 'مخفية', count: hiddenCount },
  ]

  const filtered = useMemo(() => {
    if (filter === 'active') {
      return properties.filter((p) => p.status === 'ACTIVE' && !p.isHidden)
    }
    if (filter === 'featured') {
      return properties.filter((p) => p.isFeatured)
    }
    if (filter === 'hidden') {
      return properties.filter((p) => p.isHidden)
    }
    return properties
  }, [properties, filter])

  return (
    <div className="flex flex-col gap-5 w-full font-['Cairo']" dir="rtl">
      <UserAdsCreditCard
        isFreeUsed={wallet ? wallet.freeAdsRemaining === 0 : false}
        paidCredit={
          wallet && wallet.slots.length > 0
            ? String(wallet.slots.reduce((sum, s) => sum + s.adsRemaining, 0))
            : null
        }
      />

      <div className="bg-white border border-[#ECECEC] rounded-lg flex items-center p-1 w-full gap-1 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = tab.id === filter
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setFilter(tab.id)}
              className={`h-9 flex items-center justify-center px-4 text-[14px] cursor-pointer transition-colors rounded-md ${
                isActive
                  ? 'bg-primary text-white font-bold'
                  : 'text-[#6B6A6A] font-medium hover:bg-[#F8FAFC]'
              }`}
            >
              {tab.label} ({tab.count})
            </button>
          )
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white border border-[#ECECEC] rounded-xl flex flex-col items-center justify-center py-16 px-6 text-center w-full min-h-80">
          <div className="size-16 rounded-full bg-[#F8FAFC] border border-[#ECECEC] flex items-center justify-center mb-4 text-primary">
            <Megaphone className="w-7 h-7" />
          </div>
          <h3 className="text-[18px] font-bold text-[#111111] mb-2">
            لا توجد إعلانات لهذا المستخدم
          </h3>
          <p className="text-[14px] font-medium text-[#6B6A6A] max-w-md leading-relaxed">
            لا توجد عقارات حاليا، سوف تظهر العقارات والاعلانات هنا فور اضافتها
            من المستخدم.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 w-full">
          {filtered.map((property) => (
            <UserAdCard
              key={property.id}
              property={property}
              onViewDetails={setSelectedProperty}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}

      {selectedProperty && (
        <AdDetailSheet
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onRefresh={onRefresh}
        />
      )}
    </div>
  )
}
