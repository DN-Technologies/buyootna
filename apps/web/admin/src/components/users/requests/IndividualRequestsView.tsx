'use client'

import { useState, useRef, useEffect } from 'react'
import {
  ChevronDown,
  Check,
  ChevronRight,
  ChevronLeft,
} from 'lucide-react'
import type { RequestItem, RequestStatus } from './requests.types'
import { STATUS_LABELS, STATUS_STYLES } from './requests.types'
import RequestsEmptyState from './RequestsEmptyState'

export interface IndividualRequestsViewProps {
  requests: RequestItem[]
  onSelectRequest: (req: RequestItem) => void
}

export default function IndividualRequestsView({
  requests,
  onSelectRequest,
}: IndividualRequestsViewProps) {
  const [indivTab, setIndivTab] = useState<'requests' | 'invoices'>('requests')
  const [typeFilter, setTypeFilter] = useState<'all' | 'private' | 'public'>(
    'all',
  )
  const [statusFilter, setStatusFilter] = useState<'all' | RequestStatus>('all')

  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  const typeDropdownRef = useRef<HTMLDivElement>(null)
  const statusDropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target as Node)
      ) {
        setTypeDropdownOpen(false)
      }
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
      className="w-full font-['Cairo'] flex flex-col gap-5 text-right"
      dir="rtl"
    >
      {/* Top Control Bar with Sub-nav & Filters */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        {/* Sub-nav Tabs (الطلبات vs الفواتير) */}
        <div className="flex items-center gap-1 bg-[#F8FAFC] border border-[#ECECEC] p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setIndivTab('requests')}
            className={`px-5 py-1.5 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${
              indivTab === 'requests'
                ? 'bg-primary text-white shadow-xs'
                : 'text-[#6B6A6A] hover:text-[#111111]'
            }`}
          >
            الطلبات
          </button>
          <button
            type="button"
            onClick={() => setIndivTab('invoices')}
            className={`px-5 py-1.5 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${
              indivTab === 'invoices'
                ? 'bg-primary text-white shadow-xs'
                : 'text-[#6B6A6A] hover:text-[#111111]'
            }`}
          >
            الفواتير
          </button>
        </div>

        {/* Right Filter Dropdowns + Export Button */}
        <div className="flex items-center gap-2">
          {/* Type Dropdown */}
          <div className="relative" ref={typeDropdownRef}>
            <button
              type="button"
              onClick={() => setTypeDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 border border-[#ECECEC] bg-white rounded-xl px-4 py-2 text-[13px] font-medium text-[#111111] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <span>
                النوع:{' '}
                {typeFilter === 'all'
                  ? 'الكل'
                  : typeFilter === 'private'
                    ? 'خاص'
                    : 'عام'}
              </span>
              <ChevronDown className="w-4 h-4 text-[#6B6A6A]" />
            </button>

            {typeDropdownOpen && (
              <div className="absolute left-0 mt-1 w-36 bg-white border border-[#ECECEC] rounded-xl shadow-xl py-1 z-30 text-right">
                {(
                  [
                    { key: 'all', label: 'الكل' },
                    { key: 'private', label: 'خاص' },
                    { key: 'public', label: 'عام' },
                  ] as const
                ).map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => {
                      setTypeFilter(opt.key)
                      setTypeDropdownOpen(false)
                    }}
                    className="w-full px-3 py-2 text-[13px] text-[#111111] hover:bg-slate-50 flex items-center justify-between font-medium cursor-pointer"
                  >
                    <span>{opt.label}</span>
                    {typeFilter === opt.key && (
                      <Check className="w-4 h-4 text-[#047857]" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="relative" ref={statusDropdownRef}>
            <button
              type="button"
              onClick={() => setStatusDropdownOpen((prev) => !prev)}
              className="flex items-center gap-2 border border-[#ECECEC] bg-white rounded-xl px-4 py-2 text-[13px] font-medium text-[#111111] hover:bg-slate-50 transition-colors cursor-pointer"
            >
              <span>
                الحالة:{' '}
                {statusFilter === 'all'
                  ? 'الكل'
                  : STATUS_LABELS[statusFilter] || statusFilter}
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
      </div>

      {/* Requests Table vs Empty State for Individual */}
      {filteredRequests.length === 0 ? (
        <RequestsEmptyState typeFilter={typeFilter} />
      ) : (
        <>
          <div className="bg-white border border-[#ECECEC] rounded-xl overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-[13px]">
                <thead className="bg-[#F8FAFC] border-b border-[#ECECEC] text-[#6B6A6A] font-medium">
                  <tr>
                    <th className="py-3 px-4">رقم الطلب</th>
                    <th className="py-3 px-4">النوع</th>
                    <th className="py-3 px-4">الحالة</th>
                    <th className="py-3 px-4">العروض</th>
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
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium ${STATUS_STYLES[req.status]}`}
                        >
                          {STATUS_LABELS[req.status]}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#111111] font-medium">
                        {req.offersCount ? req.offersCount : '—'}
                      </td>
                      <td className="py-3.5 px-4 text-[#6B6A6A]">{req.date}</td>
                      <td className="py-3.5 px-4 text-left">
                        <button
                          type="button"
                          onClick={() => onSelectRequest(req)}
                          className="text-primary font-bold hover:underline cursor-pointer"
                        >
                          عرض
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Pagination Footer Bar (Figma Node 4043:130594) */}
          <div className="flex items-center justify-between pt-2">
            <span className="text-[13px] text-[#6B6A6A]">6 من 8 طلبات</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                className="px-3 py-1.5 border border-[#ECECEC] rounded-lg text-[13px] text-[#6B6A6A] hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
              >
                <ChevronRight className="w-4 h-4" />
                <span>السابق</span>
              </button>
              {[1, 2, 3].map((page) => (
                <button
                  key={page}
                  type="button"
                  onClick={() => setCurrentPage(page)}
                  className={`size-8 rounded-lg text-[13px] font-bold cursor-pointer ${
                    currentPage === page
                      ? 'bg-primary text-white'
                      : 'border border-[#ECECEC] text-[#111111] hover:bg-slate-50'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
                className="px-3 py-1.5 border border-[#ECECEC] rounded-lg text-[13px] text-[#6B6A6A] hover:bg-slate-50 flex items-center gap-1 cursor-pointer"
              >
                <span>التالي</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
