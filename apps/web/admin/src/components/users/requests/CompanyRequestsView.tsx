'use client'

import { useState, useRef, useEffect } from 'react'
import { ChevronDown, Check } from 'lucide-react'
import type { RequestItem, RequestStatus } from './requests.types'
import { STATUS_LABELS, STATUS_STYLES } from './requests.types'
import CompanyRequestsMetrics from './CompanyRequestsMetrics'
import RequestsEmptyState from './RequestsEmptyState'

export interface CompanyRequestsViewProps {
  requests: RequestItem[]
  onSelectRequest: (req: RequestItem) => void
}

export default function CompanyRequestsView({
  requests,
  onSelectRequest,
}: CompanyRequestsViewProps) {
  const [typeFilter, setTypeFilter] = useState<'all' | 'private' | 'public'>(
    'all',
  )
  const [statusFilter, setStatusFilter] = useState<'all' | RequestStatus>('all')
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)

  const statusDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setStatusDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const filteredRequests = requests.filter((req) => {
    if (typeFilter !== 'all' && req.type !== typeFilter) return false
    if (statusFilter !== 'all' && req.status !== statusFilter) return false
    return true
  })

  return (
    <div
      className="w-full font-['Cairo'] flex flex-col gap-6 text-right"
      dir="rtl"
    >
      {/* Summary Metrics Strip (Figma Node 4043:149394) */}
      <CompanyRequestsMetrics filteredRequests={filteredRequests} />

      {/* Filter Segment Bar (Figma Node 4043:149394 & 4043:154724) */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Type Filter Buttons */}
        <div className="flex items-center gap-1 bg-[#F8FAFC] border border-[#ECECEC] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setTypeFilter('all')}
            className={`px-5 py-1.5 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${
              typeFilter === 'all'
                ? 'bg-primary text-white shadow-xs'
                : 'text-[#6B6A6A] hover:text-[#111111]'
            }`}
          >
            الكل
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('private')}
            className={`px-5 py-1.5 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${
              typeFilter === 'private'
                ? 'bg-primary text-white shadow-xs'
                : 'text-[#6B6A6A] hover:text-[#111111]'
            }`}
          >
            الخاصة
          </button>
          <button
            type="button"
            onClick={() => setTypeFilter('public')}
            className={`px-5 py-1.5 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${
              typeFilter === 'public'
                ? 'bg-primary text-white shadow-xs'
                : 'text-[#6B6A6A] hover:text-[#111111]'
            }`}
          >
            العامة
          </button>
        </div>

        {/* Status Dropdown Popover (Figma Node 4043:154724) */}
        <div className="relative" ref={statusDropdownRef}>
          <button
            type="button"
            onClick={() => setStatusDropdownOpen((prev) => !prev)}
            className="flex items-center gap-2 border border-[#ECECEC] bg-white rounded-xl px-4 py-2 text-[13px] font-medium text-[#111111] hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <span>
              الحالة:{' '}
              {statusFilter === 'all' ? 'الكل' : STATUS_LABELS[statusFilter]}
            </span>
            <ChevronDown className="w-4 h-4 text-[#6B6A6A]" />
          </button>

          {statusDropdownOpen && (
            <div className="absolute left-0 mt-1 w-44 bg-white border border-[#ECECEC] rounded-xl shadow-xl py-1 z-30 text-right">
              {(
                [
                  { key: 'all', label: 'الكل' },
                  { key: 'pending', label: STATUS_LABELS.pending },
                  { key: 'responded', label: STATUS_LABELS.responded },
                  { key: 'accepted', label: STATUS_LABELS.accepted },
                  { key: 'rejected', label: STATUS_LABELS.rejected },
                ] as const
              ).map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => {
                    setStatusFilter(opt.key)
                    setStatusDropdownOpen(false)
                  }}
                  className="w-full px-3 py-2 text-[13px] text-[#111111] hover:bg-slate-50 flex items-center justify-between font-medium cursor-pointer"
                >
                  <span>{opt.label}</span>
                  {statusFilter === opt.key && (
                    <Check className="w-4 h-4 text-[#047857]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Requests Data Table vs Empty State for Company */}
      {filteredRequests.length === 0 ? (
        <RequestsEmptyState typeFilter={typeFilter} />
      ) : (
        <div className="bg-white border border-[#ECECEC] rounded-xl overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-right text-[13px]">
              <thead className="bg-[#F8FAFC] border-b border-[#ECECEC] text-[#6B6A6A] font-medium">
                <tr>
                  <th className="py-3 px-4">رقم الطلب</th>
                  <th className="py-3 px-4">النوع</th>
                  <th className="py-3 px-4">العميل</th>
                  <th className="py-3 px-4">الحالة</th>
                  <th className="py-3 px-4">تاريخ الطلب</th>
                  <th className="py-3 px-4 text-left">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECECEC]">
                {filteredRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-slate-50/50 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-bold text-[#111111]">
                      <div className="flex flex-col">
                        <span>{req.title}</span>
                        <span className="text-[11px] font-normal text-[#6B6A6A]">
                          {req.code}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                          req.type === 'private'
                            ? 'bg-[#FDF4FF] text-[#C026D3]'
                            : 'bg-[#EFF6FF] text-[#2563EB]'
                        }`}
                      >
                        {req.type === 'private' ? 'خاص' : 'عام'}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-full bg-[#E2E8F0] flex items-center justify-center font-bold text-[11px] text-[#111111]">
                          {req.clientName.charAt(0)}
                        </div>
                        <span className="font-medium text-[#111111]">
                          {req.clientName}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLES[req.status]}`}
                      >
                        {STATUS_LABELS[req.status]}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#6B6A6A]">{req.date}</td>
                    <td className="py-3.5 px-4 text-left">
                      <button
                        type="button"
                        onClick={() => onSelectRequest(req)}
                        className="text-primary font-bold hover:underline cursor-pointer"
                      >
                        عرض التفاصيل
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
