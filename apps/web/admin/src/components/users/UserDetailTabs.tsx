'use client'

const tabs = [
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

const ENABLED_TABS = new Set([
  'نظرة عامة',
  'الاعلانات',
  'الطلبات',
  'الباقة',
  'الفواتير والخصم',
  'البلاغات',
  'التقييمات',
  'السجل',
])

interface UserDetailTabsProps {
  activeTab?: string
  onTabChange?: (tab: string) => void
}

export default function UserDetailTabs({
  activeTab = 'نظرة عامة',
  onTabChange,
}: UserDetailTabsProps) {
  return (
    <div
      className="w-full border-b border-[#EBECEE] flex items-baseline gap-2.5 px-6 md:px-8 text-right font-['Cairo'] overflow-x-auto"
      dir="rtl"
    >
      {tabs.map((tab) => {
        const isActive = tab === activeTab
        const isEnabled = ENABLED_TABS.has(tab)
        return (
          <button
            key={tab}
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
        )
      })}
    </div>
  )
}
