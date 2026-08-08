'use client'

import { X } from 'lucide-react'
import type { AdminUserProperty } from '@/lib/admin-users'
import {
  categoryLabels,
  formatArabicDate,
  getAdCode,
  getStatusBadge,
  typeLabels,
} from '@/lib/property-labels'

export type AdDetailTab = 'details' | 'reports'

const tabs: { id: AdDetailTab; label: string }[] = [
  { id: 'details', label: 'التفاصيل' },
  { id: 'reports', label: 'البلاغات' },
]

export default function AdDetailHeader({
  property,
  activeTab,
  onTabChange,
  onClose,
}: {
  property: AdminUserProperty
  activeTab: AdDetailTab
  onTabChange: (tab: AdDetailTab) => void
  onClose: () => void
}) {
  const typeLabel = typeLabels[property.type] || property.type
  const categoryLabel = categoryLabels[property.category] || property.category
  const code = getAdCode(property.referenceNumber)

  const badge = getStatusBadge(property)

  return (
    <div className="bg-white flex flex-col w-full font-['Cairo']" dir="rtl">
      <div className="border-b border-[#ECECEC] flex gap-4 items-start p-5 w-full">
        <div className="flex-1 flex flex-col gap-1 min-w-0">
          <p className="text-[16px] font-bold text-[#111111] truncate w-full text-right">
            {categoryLabel} {typeLabel} في {property.location} · {code}
          </p>
          <div className="flex items-center gap-2">
            <span className="text-[14px] text-[#6B6A6A]">
              نشر {formatArabicDate(property.createdAt)}
            </span>
            {property.status === 'DELETED' ? (
              <span className="h-5 flex items-center px-2 rounded-full text-[12px] font-medium bg-[#FEF3F2] text-[#9C1E28]">
                محذوف
              </span>
            ) : (
              <span className="h-5 flex items-center px-2 rounded-full text-[12px] font-medium bg-[#F4F8EE] text-[#111111]">
                مجاني
              </span>
            )}
            {property.isFeatured && property.status !== 'DELETED' && (
              <span className="h-5 flex items-center px-2 rounded-full text-[12px] font-medium bg-linear-to-l from-[#FF8D28] to-[#FACC15] text-[#111111]">
                مميز
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="size-8 flex items-center justify-center rounded-full text-[#6B6A6A] hover:bg-[#F1F5F9] shrink-0 cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="border-b border-[#EBECEE] flex items-baseline gap-2.5 px-3">
        {tabs.map((tab) => {
          const isActive = tab.id === activeTab
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className="flex flex-col h-11 items-center justify-between pt-3.5 cursor-pointer"
            >
              <span
                className={`px-2.5 text-[14px] whitespace-nowrap ${
                  isActive
                    ? 'font-bold text-primary'
                    : 'font-normal text-[#6B6A6A]'
                }`}
              >
                {tab.label}
              </span>
              <div
                className={`h-0.5 w-full rounded-t-md ${
                  isActive ? 'bg-primary' : 'bg-transparent'
                }`}
              />
            </button>
          )
        })}
      </div>
    </div>
  )
}
