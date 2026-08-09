'use client'

import { useMemo, useState } from 'react'
import {
  Check,
  ChevronDown,
  Download,
  ChevronRight,
  ChevronLeft,
  ClipboardList,
  Receipt,
} from 'lucide-react'
import RequestDetailSheet from './RequestDetailSheet'

export interface UserRequestItem {
  id: string
  code: string
  title: string
  type: 'خاص' | 'عام'
  status: 'تم الرد' | 'قيد الانتظار' | 'مقبولة'
  offersCount: number | null
  date: string
}

export interface UserInvoiceItem {
  id: string
  code: string
  title: string
  paidDate: string
  amount: string
}

const mockRequests: UserRequestItem[] = [
  {
    id: '1',
    code: 'REQ-001',
    title: 'فحص هندسي لعقار بالسالمية',
    type: 'خاص',
    status: 'تم الرد',
    offersCount: null,
    date: '5 أبريل 2026',
  },
  {
    id: '2',
    code: 'REQ-001',
    title: 'دهانات وتشطيبات',
    type: 'خاص',
    status: 'قيد الانتظار',
    offersCount: null,
    date: 'منذ ساعتين',
  },
  {
    id: '3',
    code: 'REQ-001',
    title: 'مقاولات عامة',
    type: 'خاص',
    status: 'قيد الانتظار',
    offersCount: null,
    date: 'منذ ساعتين',
  },
  {
    id: '4',
    code: 'REQ-001',
    title: 'سباكة وصرف',
    type: 'عام',
    status: 'تم الرد',
    offersCount: 2,
    date: 'منذ ساعتين',
  },
  {
    id: '5',
    code: 'REQ-001',
    title: 'فحص هندسي لعقار بالسالمية',
    type: 'عام',
    status: 'قيد الانتظار',
    offersCount: 3,
    date: 'منذ ساعتين',
  },
  {
    id: '6',
    code: 'REQ-001',
    title: 'فحص هندسي لعقار بالسالمية',
    type: 'عام',
    status: 'مقبولة',
    offersCount: 2,
    date: 'منذ ساعتين',
  },
  {
    id: '7',
    code: 'REQ-001',
    title: 'فحص هندسي لعقار بالسالمية',
    type: 'عام',
    status: 'مقبولة',
    offersCount: 2,
    date: 'منذ ساعتين',
  },
  {
    id: '8',
    code: 'REQ-001',
    title: 'تصميم داخلي',
    type: 'عام',
    status: 'مقبولة',
    offersCount: 2,
    date: '5 أبريل 2026',
  },
]

const mockInvoices: UserInvoiceItem[] = [
  {
    id: 'inv-1',
    code: 'INV-2026-00124',
    title: 'تشطيب محل تجاري',
    paidDate: 'تم الدفع في: 5 مايو 2026',
    amount: '100 د.ك',
  },
  {
    id: 'inv-2',
    code: 'INV-2026-00124',
    title: 'تشطيب محل تجاري',
    paidDate: 'تم الدفع في: 5 مايو 2026',
    amount: '100 د.ك',
  },
  {
    id: 'inv-3',
    code: 'INV-2026-00124',
    title: 'تشطيب محل تجاري',
    paidDate: 'تم الدفع في: 5 مايو 2026',
    amount: '100 د.ك',
  },
  {
    id: 'inv-4',
    code: 'INV-2026-00124',
    title: 'تشطيب محل تجاري',
    paidDate: 'تم الدفع في: 5 مايو 2026',
    amount: '100 د.ك',
  },
]

type TypeFilter = 'all' | 'خاص' | 'عام'
type StatusFilter = 'all' | 'قيد الانتظار' | 'تم الرد' | 'مقبولة'

const statusBadgeStyles: Record<UserRequestItem['status'], string> = {
  'تم الرد': 'bg-[#EBF3FF] text-[#2563EB]',
  'قيد الانتظار': 'bg-[#FEF6E6] text-[#D97706]',
  مقبولة: 'bg-[#EAF8F1] text-[#018B1B]',
}

export default function UserRequestsTabContent() {
  const [subTab, setSubTab] = useState<'requests' | 'invoices'>('requests')
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [selectedRequest, setSelectedRequest] =
    useState<UserRequestItem | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 6

  const filteredRequests = useMemo(() => {
    return mockRequests.filter((item) => {
      if (typeFilter !== 'all' && item.type !== typeFilter) return false
      if (statusFilter !== 'all' && item.status !== statusFilter) return false
      return true
    })
  }, [typeFilter, statusFilter])

  const totalPages = Math.ceil(filteredRequests.length / pageSize) || 1
  const paginatedRequests = useMemo(() => {
    const start = (currentPage - 1) * pageSize
    return filteredRequests.slice(start, start + pageSize)
  }, [filteredRequests, currentPage, pageSize])

  const typeFilterLabel =
    typeFilter === 'all' ? 'النوع' : `النوع: ${typeFilter}`
  const statusFilterLabel =
    statusFilter === 'all' ? 'الحالة' : `الحالة: ${statusFilter}`

  return (
    <div className="flex flex-col gap-5 w-full font-['Cairo']" dir="rtl">
      {/* Sub Header & Controls */}
      <div className="bg-white border border-[#ECECEC] rounded-lg p-2 flex items-center justify-between gap-4 flex-wrap w-full">
        {/* Right side (Sub Tabs) */}
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => {
              setSubTab('requests')
              setCurrentPage(1)
            }}
            className={`h-9 px-5 flex items-center justify-center rounded-md text-[14px] cursor-pointer transition-colors ${
              subTab === 'requests'
                ? 'bg-primary text-white font-bold'
                : 'text-[#6B6A6A] font-medium hover:bg-[#F8FAFC]'
            }`}
          >
            الطلبات
          </button>
          <button
            type="button"
            onClick={() => {
              setSubTab('invoices')
              setCurrentPage(1)
            }}
            className={`h-9 px-5 flex items-center justify-center rounded-md text-[14px] cursor-pointer transition-colors ${
              subTab === 'invoices'
                ? 'bg-primary text-white font-bold'
                : 'text-[#6B6A6A] font-medium hover:bg-[#F8FAFC]'
            }`}
          >
            الفواتير
          </button>
        </div>

        {/* Left side (Filter Dropdowns & Export) */}
        <div className="flex items-center gap-2">
          {/* Type Dropdown */}
          <div className="relative">
            {typeDropdownOpen && (
              <div
                className="fixed inset-0 z-10"
                onClick={() => setTypeDropdownOpen(false)}
              />
            )}
            <button
              type="button"
              onClick={() => {
                setTypeDropdownOpen((prev) => !prev)
                setStatusDropdownOpen(false)
              }}
              className="h-9 px-3.5 flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white text-[14px] font-medium text-[#111111] hover:bg-[#F8FAFC] cursor-pointer"
            >
              <span>{typeFilterLabel}</span>
              <ChevronDown className="w-4 h-4 text-[#6B6A6A]" />
            </button>

            {typeDropdownOpen && (
              <div className="absolute right-0 top-11 w-36 bg-white rounded-lg border border-[#ECECEC] shadow-[0px_4px_6px_0px_rgba(130,130,130,0.2)] py-1 z-20 flex flex-col text-right">
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter('all')
                    setTypeDropdownOpen(false)
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 text-[14px] text-[#111111] hover:bg-[#F8FAFC] flex items-center justify-between cursor-pointer"
                >
                  <span>الكل</span>
                  {typeFilter === 'all' && (
                    <Check className="w-4 h-4 text-[#018B1B]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter('خاص')
                    setTypeDropdownOpen(false)
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 text-[14px] text-[#111111] hover:bg-[#F8FAFC] flex items-center justify-between cursor-pointer"
                >
                  <span>خاص</span>
                  {typeFilter === 'خاص' && (
                    <Check className="w-4 h-4 text-[#018B1B]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setTypeFilter('عام')
                    setTypeDropdownOpen(false)
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 text-[14px] text-[#111111] hover:bg-[#F8FAFC] flex items-center justify-between cursor-pointer"
                >
                  <span>عام</span>
                  {typeFilter === 'عام' && (
                    <Check className="w-4 h-4 text-[#018B1B]" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Status Dropdown */}
          <div className="relative">
            {statusDropdownOpen && (
              <div
                className="fixed inset-0 z-10"
                onClick={() => setStatusDropdownOpen(false)}
              />
            )}
            <button
              type="button"
              onClick={() => {
                setStatusDropdownOpen((prev) => !prev)
                setTypeDropdownOpen(false)
              }}
              className="h-9 px-3.5 flex items-center gap-2 rounded-lg border border-[#E2E8F0] bg-white text-[14px] font-medium text-[#111111] hover:bg-[#F8FAFC] cursor-pointer"
            >
              <span>{statusFilterLabel}</span>
              <ChevronDown className="w-4 h-4 text-[#6B6A6A]" />
            </button>

            {statusDropdownOpen && (
              <div className="absolute right-0 top-11 w-40 bg-white rounded-lg border border-[#ECECEC] shadow-[0px_4px_6px_0px_rgba(130,130,130,0.2)] py-1 z-20 flex flex-col text-right">
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('all')
                    setStatusDropdownOpen(false)
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 text-[14px] text-[#111111] hover:bg-[#F8FAFC] flex items-center justify-between cursor-pointer"
                >
                  <span>الكل</span>
                  {statusFilter === 'all' && (
                    <Check className="w-4 h-4 text-[#018B1B]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('قيد الانتظار')
                    setStatusDropdownOpen(false)
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 text-[14px] text-[#111111] hover:bg-[#F8FAFC] flex items-center justify-between cursor-pointer"
                >
                  <span>قيد الانتظار</span>
                  {statusFilter === 'قيد الانتظار' && (
                    <Check className="w-4 h-4 text-[#018B1B]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('تم الرد')
                    setStatusDropdownOpen(false)
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 text-[14px] text-[#111111] hover:bg-[#F8FAFC] flex items-center justify-between cursor-pointer"
                >
                  <span>تم الرد</span>
                  {statusFilter === 'تم الرد' && (
                    <Check className="w-4 h-4 text-[#018B1B]" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setStatusFilter('مقبولة')
                    setStatusDropdownOpen(false)
                    setCurrentPage(1)
                  }}
                  className="w-full px-3 py-2 text-[14px] text-[#111111] hover:bg-[#F8FAFC] flex items-center justify-between cursor-pointer"
                >
                  <span>مقبولة</span>
                  {statusFilter === 'مقبولة' && (
                    <Check className="w-4 h-4 text-[#018B1B]" />
                  )}
                </button>
              </div>
            )}
          </div>

          {/* Export Button */}
          <button
            type="button"
            onClick={() => alert('"تصدير" — تم تجهيز التصدير.')}
            className="h-9 px-4 flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[14px] font-semibold text-[#111111] hover:bg-[#F8FAFC] cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#111111]" />
            <span>تصدير</span>
          </button>
        </div>
      </div>

      {subTab === 'invoices' ? (
        mockInvoices.length === 0 ? (
          /* Node 4043:131056: Invoices 0-State */
          <div className="bg-white border border-[#ECECEC] rounded-xl flex flex-col items-center justify-center py-16 px-6 text-center w-full min-h-80">
            <div className="size-16 rounded-full bg-[#F8FAFC] border border-[#ECECEC] flex items-center justify-center mb-4 text-[#111111]">
              <Receipt className="w-7 h-7" />
            </div>
            <h3 className="text-[18px] font-bold text-[#111111] mb-2">
              لا توجد فواتير خدمات حتى الان
            </h3>
            <p className="text-[14px] font-medium text-[#6B6A6A] max-w-md leading-relaxed">
              لا توجد فواتير للخدمات حاليا، سوف تظهر هنا فور اضافتها.
            </p>
          </div>
        ) : (
          /* Node 4043:130824: Invoices List View */
          <div className="bg-white border border-[#ECECEC] rounded-xl p-5 flex flex-col gap-4 w-full">
            <div className="flex flex-col gap-3 w-full">
              {mockInvoices.map((inv) => (
                <div
                  key={inv.id}
                  className="bg-white border border-[#ECECEC] rounded-lg p-4 flex items-center justify-between gap-4 hover:border-[#CBD5E1] transition-colors"
                >
                  {/* Right side Info (RTL) */}
                  <div className="flex flex-col gap-1 text-right">
                    <span className="text-[15px] font-bold text-[#111111]">
                      {inv.code}
                    </span>
                    <span className="text-[13px] font-medium text-[#6B6A6A]">
                      {inv.title}
                    </span>
                    <span className="text-[12px] font-medium text-[#6B6A6A]">
                      {inv.paidDate}
                    </span>
                  </div>

                  {/* Left side Amount & Download */}
                  <div className="flex items-center gap-6">
                    <span className="text-[15px] font-bold text-[#111111]">
                      {inv.amount}
                    </span>
                    <button
                      type="button"
                      onClick={() => alert(`تحميل الفاتورة ${inv.code}`)}
                      className="flex items-center gap-1.5 text-primary font-bold text-[14px] hover:underline cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                      <span>تحميل</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination Footer */}
            <div className="border-t border-[#ECECEC] pt-4 flex items-center justify-between w-full flex-wrap gap-4">
              <p className="text-[14px] font-medium text-[#6B6A6A]">
                6 من 8 طلبات
              </p>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E2E8F0] font-medium text-[13px] bg-white hover:bg-[#F8FAFC] cursor-pointer"
                >
                  <ChevronRight className="w-4 h-4" />
                  <span>السابق</span>
                </button>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14px] bg-primary text-white"
                  >
                    1
                  </button>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14px] bg-white text-[#111111] hover:bg-[#F1F5F9]"
                  >
                    2
                  </button>
                  <button
                    type="button"
                    className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14px] bg-white text-[#111111] hover:bg-[#F1F5F9]"
                  >
                    3
                  </button>
                </div>
                <button
                  type="button"
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E2E8F0] font-medium text-[13px] bg-white hover:bg-[#F8FAFC] cursor-pointer"
                >
                  <span>التالي</span>
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )
      ) : filteredRequests.length === 0 ? (
        /* Node 4043:130965: Requests 0-State */
        <div className="bg-white border border-[#ECECEC] rounded-xl flex flex-col items-center justify-center py-16 px-6 text-center w-full min-h-80">
          <div className="size-16 rounded-full bg-[#F8FAFC] border border-[#ECECEC] flex items-center justify-center mb-4 text-[#111111]">
            <ClipboardList className="w-7 h-7" />
          </div>
          <h3 className="text-[18px] font-bold text-[#111111] mb-2">
            لا توجد طلبات عروض أسعار
          </h3>
          <p className="text-[14px] font-medium text-[#6B6A6A] max-w-md leading-relaxed">
            ستظهر الطلبات هنا فور اضافتها من المستخدم.
          </p>
        </div>
      ) : (
        /* Requests Table */
        <div className="bg-white border border-[#ECECEC] rounded-xl overflow-hidden w-full">
          <div className="overflow-x-auto w-full">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-[#ECECEC] bg-[#F8FAFC] text-[13px] font-medium text-[#6B6A6A]">
                  <th className="py-3 px-4 text-right">رقم الطلب</th>
                  <th className="py-3 px-4 text-right">النوع</th>
                  <th className="py-3 px-4 text-right">الحالة</th>
                  <th className="py-3 px-4 text-right">العروض</th>
                  <th className="py-3 px-4 text-right">تاريخ الطلب</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECECEC] text-[14px]">
                {paginatedRequests.map((req) => (
                  <tr
                    key={req.id}
                    className="hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="font-semibold text-[#111111]">
                          {req.title}
                        </span>
                        <span className="text-[12px] text-[#6B6A6A]">
                          {req.code}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#111111] font-medium">
                      {req.type}
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium ${
                          statusBadgeStyles[req.status]
                        }`}
                      >
                        {req.status}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#111111] font-medium">
                      {req.offersCount != null ? req.offersCount : '—'}
                    </td>
                    <td className="py-3.5 px-4 text-[#6B6A6A]">{req.date}</td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => setSelectedRequest(req)}
                        className="text-primary font-bold hover:underline cursor-pointer text-[14px]"
                      >
                        عرض
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination Footer */}
          <div className="border-t border-[#ECECEC] flex items-center justify-between px-5 py-4 w-full flex-wrap gap-4">
            <p className="text-[14px] font-medium text-[#6B6A6A]">
              {paginatedRequests.length} من {filteredRequests.length} طلبات
            </p>

            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={currentPage <= 1}
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E2E8F0] font-medium text-[13px] ${
                  currentPage <= 1
                    ? 'opacity-50 cursor-not-allowed bg-white'
                    : 'bg-white hover:bg-[#F8FAFC] cursor-pointer'
                }`}
              >
                <ChevronRight className="w-4 h-4" />
                <span>السابق</span>
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => {
                    const isActive = page === currentPage
                    return (
                      <button
                        key={page}
                        type="button"
                        onClick={() => setCurrentPage(page)}
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14px] cursor-pointer ${
                          isActive
                            ? 'bg-primary text-white'
                            : 'bg-white text-[#111111] hover:bg-[#F1F5F9]'
                        }`}
                      >
                        {page}
                      </button>
                    )
                  },
                )}
              </div>

              <button
                type="button"
                disabled={currentPage >= totalPages}
                onClick={() =>
                  setCurrentPage((p) => Math.min(p + 1, totalPages))
                }
                className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E2E8F0] font-medium text-[13px] ${
                  currentPage >= totalPages
                    ? 'opacity-50 cursor-not-allowed bg-white'
                    : 'bg-white hover:bg-[#F8FAFC] cursor-pointer'
                }`}
              >
                <span>التالي</span>
                <ChevronLeft className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {selectedRequest && (
        <RequestDetailSheet
          request={selectedRequest}
          onClose={() => setSelectedRequest(null)}
        />
      )}
    </div>
  )
}
