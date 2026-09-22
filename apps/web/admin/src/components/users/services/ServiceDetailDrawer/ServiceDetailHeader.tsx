'use client'

import { ChevronRight, X } from 'lucide-react'
import type { ServiceItem } from '../UserServiceCard'
import type { ReportItem, ServiceDetailTab } from './types'

const TABS: ServiceDetailTab[] = ['التفاصيل', 'البلاغات', 'الملاحظات']

interface ServiceDetailHeaderProps {
  service: ServiceItem
  selectedReport: ReportItem | null
  activeTab: ServiceDetailTab
  onTabChange: (tab: ServiceDetailTab) => void
  onBackFromReport: () => void
  onClose: () => void
}

export default function ServiceDetailHeader({
  service,
  selectedReport,
  activeTab,
  onTabChange,
  onBackFromReport,
  onClose,
}: ServiceDetailHeaderProps) {
  const isHidden = service.status === 'hidden'
  const isDeleted = service.status === 'deleted'

  const statusBadge =
    service.status === 'active' ? (
      <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#047857] text-[12px] font-medium">
        نشطة
      </span>
    ) : isHidden ? (
      <span className="px-2.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B] text-[12px] font-medium">
        مخفية
      </span>
    ) : (
      <span className="px-2.5 py-0.5 rounded-full bg-[#FEF3F2] text-[#9C1E28] text-[12px] font-medium">
        محذوفة
      </span>
    )

  return (
    <div className="p-6 border-b border-[#ECECEC] flex flex-col gap-3 shrink-0">
      <div className="flex items-center justify-between w-full">
        {selectedReport ? (
          <button
            type="button"
            onClick={onBackFromReport}
            className="flex items-center gap-1 text-[14px] text-[#111111] font-medium hover:underline cursor-pointer"
          >
            <ChevronRight className="w-4 h-4" />
            <span>العودة إلى البلاغات</span>
          </button>
        ) : (
          <h2 className="text-[16px] font-bold text-[#111111]">
            {service.title}
          </h2>
        )}

        <button
          type="button"
          onClick={onClose}
          className="size-8 flex items-center justify-center rounded-full text-[#6B6A6A] hover:bg-[#F1F5F9] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {!selectedReport && (
        <div className="flex items-center justify-between w-full flex-wrap gap-2">
          <span className="text-[12px] font-medium text-[#6B6A6A]">
            نشرت في 15 يناير 2024
          </span>
          {statusBadge}
        </div>
      )}

      {/* Drawer Navigation Tabs */}
      {!selectedReport && (
        <div className="flex items-center gap-6 border-b border-[#ECECEC] pt-3">
          {TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => onTabChange(tab)}
              className={`pb-2.5 text-[15px] font-medium transition-colors border-b-2 cursor-pointer ${
                activeTab === tab
                  ? 'border-primary text-primary font-bold'
                  : 'border-transparent text-[#6B6A6A] hover:text-[#111111]'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
