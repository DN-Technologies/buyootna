'use client'

import React from 'react'

export type UserCategoryTab = 'all' | 'individual' | 'office' | 'company'

interface UserTabsProps {
  activeTab: UserCategoryTab
  onTabChange: (tab: UserCategoryTab) => void
  counts?: {
    all: number
    individual: number
    office: number
    company: number
  }
}

export default function UserTabs({
  activeTab,
  onTabChange,
  counts = { all: 50, individual: 50, office: 20, company: 10 },
}: UserTabsProps) {
  const tabs: { id: UserCategoryTab; label: string; count: number }[] = [
    { id: 'all', label: 'الكل', count: counts.all },
    { id: 'individual', label: 'الأفراد', count: counts.individual },
    { id: 'office', label: 'المكاتب العقارية', count: counts.office },
    { id: 'company', label: 'الشركات', count: counts.company },
  ]

  return (
    <div className="w-full border-b border-[#EBECEE] flex items-baseline  gap-2.5 px-8 text-right font-['Cairo']">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className="flex flex-col h-11 items-center justify-between pt-3.5 cursor-pointer transition-colors"
          >
            <div className="px-2.5 flex items-center justify-center">
              <span
                className={`text-base leading-[1.2] tracking-[-0.408px] ${
                  isActive
                    ? 'font-bold text-primary'
                    : 'font-normal text-[#6B6A6A] hover:text-[#111111]'
                }`}
              >
                {tab.label} ({tab.count})
              </span>
            </div>
            <div
              className={`h-0.5 w-full rounded-t-md transition-all ${
                isActive ? 'bg-primary' : 'bg-transparent'
              }`}
            />
          </button>
        )
      })}
    </div>
  )
}
