'use client'

import { Fragment } from 'react'

const individualTabs = [
  'نظرة عامة',
  'الاعلانات',
  'الطلبات',
  'الباقة',
  'الفواتير والخصم',
  'البلاغات',
  'التقييمات',
  'السجل',
  'ملاحظات',
]

const officeTabs = [
  'نظرة عامة',
  'الاعلانات',
  'الخدمات',
  'الباقة',
  'الفواتير والخصم',
  'البلاغات',
  'التقييمات',
  'السجل',
  'ملاحظات',
]

const companyTabs = [
  'نظرة عامة',
  'الخدمات',
  'الطلبات',
  'المعرض',
  'الباقة',
  'الفواتير والخصم',
  'البلاغات',
  'التقييمات',
  'السجل',
  'ملاحظات',
]

/** The tabs of a persona type: a tab missing here isn't shown for it. */
export function tabsFor(role: 'INDIVIDUAL' | 'OFFICE' | 'COMPANY'): string[] {
  return role === 'COMPANY'
    ? companyTabs
    : role === 'OFFICE'
      ? officeTabs
      : individualTabs
}

// About the whole account, not the selected identity
const ACCOUNT_TABS = new Set(['السجل', 'ملاحظات'])

const ENABLED_TABS = new Set([
  'نظرة عامة',
  'الاعلانات',
  'الطلبات',
  'الخدمات',
  'المعرض',
  'الباقة',
  'الفواتير والخصم',
  'البلاغات',
  'التقييمات',
  'السجل',
  'ملاحظات',
])

interface UserDetailTabsProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
  isOffice?: boolean
  userRole?: 'INDIVIDUAL' | 'OFFICE' | 'COMPANY'
}

export default function UserDetailTabs({
  activeTab = 'نظرة عامة',
  onTabChange,
  isOffice = false,
  userRole,
}: UserDetailTabsProps) {
  const role = userRole || (isOffice ? 'OFFICE' : 'INDIVIDUAL')
  const tabs = tabsFor(role)

  return (
    <div
      className="w-full border-b border-[#EBECEE] flex items-baseline gap-2.5 px-6 md:px-8 text-right font-['Cairo'] overflow-x-auto"
      dir="rtl"
    >
      {tabs.map((tab, idx) => {
        const isActive = tab === activeTab
        const isEnabled = ENABLED_TABS.has(tab)
        const startsAccountTabs =
          ACCOUNT_TABS.has(tab) && idx > 0 && !ACCOUNT_TABS.has(tabs[idx - 1])
        return (
          <Fragment key={tab}>
            {startsAccountTabs && (
              <span
                className="self-center h-5 w-px bg-[#EBECEE] shrink-0"
                title="للحساب كاملاً"
              />
            )}
            <button
              type="button"
              disabled={!isEnabled}
              onClick={() => isEnabled && onTabChange?.(tab)}
              title={isEnabled ? undefined : 'قريباً'}
              className={`flex flex-col h-11 items-center justify-between pt-3.5 transition-colors shrink-0 ${
                isEnabled ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'
              }`}
            >
              <span
                className={`px-2.5 text-[16px] leading-[1.2] tracking-[-0.408px] whitespace-nowrap ${
                  isActive
                    ? 'font-bold text-primary'
                    : 'font-normal text-[#6B6A6A]'
                }`}
              >
                {tab}
              </span>
              <div
                className={`h-0.5 w-full rounded-t-md ${
                  isActive ? 'bg-primary' : 'bg-transparent'
                }`}
              />
            </button>
          </Fragment>
        )
      })}
    </div>
  )
}
