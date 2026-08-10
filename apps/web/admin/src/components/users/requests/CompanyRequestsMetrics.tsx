'use client'

import type { RequestItem } from './requests.types'

export interface CompanyRequestsMetricsProps {
  filteredRequests: RequestItem[]
}

export default function CompanyRequestsMetrics({
  filteredRequests,
}: CompanyRequestsMetricsProps) {
  const acceptedCount = filteredRequests.filter(
    (r) => r.status === 'accepted' || r.status === 'مقبولة',
  ).length

  const cancelledCount = filteredRequests.filter(
    (r) => r.status === 'cancelled',
  ).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      {/* Balance Progress Box */}
      <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-xl p-4 flex flex-col justify-between gap-2">
        <div className="flex items-center justify-between">
          <span className="text-[13px] text-[#6B6A6A] font-medium">الرصيد</span>
          <span className="text-[14px] font-bold text-[#111111]">
            {filteredRequests.length > 0 ? '3/1' : '0/0'}
          </span>
        </div>
        <div className="w-full bg-[#E2E8F0] h-2 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full ${
              filteredRequests.length > 0
                ? 'bg-[#047857] w-1/3'
                : 'bg-transparent w-0'
            }`}
          />
        </div>
      </div>

      {/* Total Requests Box */}
      <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-xl p-4 flex flex-col justify-between gap-1">
        <span className="text-[13px] text-[#6B6A6A] font-medium">
          إجمالي الطلبات
        </span>
        <span className="font-bold text-[22px] text-[#111111]">
          {filteredRequests.length}
        </span>
      </div>

      {/* Accepted Requests Box */}
      <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-xl p-4 flex flex-col justify-between gap-1">
        <span className="text-[13px] text-[#6B6A6A] font-medium">مقبولة</span>
        <span className="font-bold text-[22px] text-[#047857]">
          {acceptedCount}
        </span>
      </div>

      {/* Cancelled Requests Box */}
      <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-xl p-4 flex flex-col justify-between gap-1">
        <span className="text-[13px] text-[#6B6A6A] font-medium">ملغاة</span>
        <span className="font-bold text-[22px] text-[#9C1E28]">
          {cancelledCount}
        </span>
      </div>
    </div>
  )
}
