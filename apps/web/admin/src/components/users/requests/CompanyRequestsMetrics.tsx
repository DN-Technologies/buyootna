'use client'

import type { RequestItem } from './requests.types'

export interface CompanyRequestsMetricsProps {
  filteredRequests: RequestItem[]
}

export default function CompanyRequestsMetrics({
  filteredRequests,
}: CompanyRequestsMetricsProps) {
  const acceptedCount = filteredRequests.filter(
    (r) => r.status === 'accepted',
  ).length

  const rejectedCount = filteredRequests.filter(
    (r) => r.status === 'rejected',
  ).length

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

      {/* Rejected Requests Box */}
      <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-xl p-4 flex flex-col justify-between gap-1">
        <span className="text-[13px] text-[#6B6A6A] font-medium">مرفوضة</span>
        <span className="font-bold text-[22px] text-[#9C1E28]">
          {rejectedCount}
        </span>
      </div>
    </div>
  )
}
