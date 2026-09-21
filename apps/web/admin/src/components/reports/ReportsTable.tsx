'use client'

import React from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  ReportItem,
  ReportPagination,
  ReportPriority,
  ReportStatus,
} from './types'

interface ReportsTableProps {
  reports: ReportItem[]
  selectedIds: string[]
  onToggleSelectAll: () => void
  onToggleSelectRow: (id: string) => void
  onOpenReview: (report: ReportItem) => void
  pagination: ReportPagination
  onPageChange: (page: number) => void
}

const PRIORITY_CONFIG: Record<
  ReportPriority,
  { dot: string; text: string; label: string }
> = {
  عاجل: {
    dot: 'bg-[#BA0003]',
    text: 'text-[#9C1E28]',
    label: 'عاجل',
  },
  متوسط: {
    dot: 'bg-[#B97500]',
    text: 'text-[#B97500]',
    label: 'متوسط',
  },
  منخفضة: {
    dot: 'bg-[#344054]',
    text: 'text-[#344054]',
    label: 'منخفضة',
  },
}

const STATUS_CONFIG: Record<
  ReportStatus,
  { bg: string; text: string; label: string }
> = {
  'تم حلها': {
    bg: 'bg-[rgba(18,194,129,0.1)]',
    text: 'text-[#018B1B]',
    label: 'تم الحل',
  },
  'قيد الانتظار': {
    bg: 'bg-[rgba(245,184,70,0.1)]',
    text: 'text-[#DB9718]',
    label: 'قيد الانتظار',
  },
  مرفوض: {
    bg: 'bg-[rgba(245,70,81,0.1)]',
    text: 'text-[#9C1E28]',
    label: 'مرفوض',
  },
}

export function ReportsTable({
  reports,
  selectedIds,
  onToggleSelectAll,
  onToggleSelectRow,
  onOpenReview,
  pagination,
  onPageChange,
}: ReportsTableProps) {
  const allSelected =
    reports.length > 0 && reports.every((r) => selectedIds.includes(r.id))
  const isPartiallySelected =
    reports.some((r) => selectedIds.includes(r.id)) && !allSelected

  return (
    <div className="bg-white border border-[#ECECEC] rounded-xl overflow-hidden shadow-2xs">
      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-right border-collapse">
          {/* Table Header */}
          <thead>
            <tr className="bg-[#F8FAFC] border-b border-[#ECECEC] text-[#6B6A6A] text-xs font-semibold">
              <th className="py-3 px-4 w-10 text-center">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = isPartiallySelected
                  }}
                  onChange={onToggleSelectAll}
                  className="rounded border-[#D0D5DD] text-primary focus:ring-primary cursor-pointer size-4 accent-primary"
                  aria-label="تحديد جميع البلاغات"
                />
              </th>
              <th className="py-3 px-3">رقم البلاغ</th>
              <th className="py-3 px-3">مقدم من</th>
              <th className="py-3 px-3">ضد</th>
              <th className="py-3 px-3">النوع</th>
              <th className="py-3 px-3">السبب</th>
              <th className="py-3 px-3">الحالة</th>
              <th className="py-3 px-3">تاريخ الارسال</th>
              <th className="py-3 px-3">الخطورة</th>
              <th className="py-3 px-4 text-center">الاجراءات</th>
            </tr>
          </thead>

          {/* Table Body */}
          <tbody className="divide-y divide-[#ECECEC] text-sm text-[#111111]">
            {reports.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-12 text-center text-[#6B6A6A]">
                  لا توجد بلاغات تطابق معايير البحث والفلترة.
                </td>
              </tr>
            ) : (
              reports.map((report) => {
                const isSelected = selectedIds.includes(report.id)
                const priorityInfo =
                  PRIORITY_CONFIG[report.priority] ?? PRIORITY_CONFIG['متوسط']
                const statusInfo =
                  STATUS_CONFIG[report.status] ?? STATUS_CONFIG['قيد الانتظار']

                return (
                  <tr
                    key={report.id}
                    className={`hover:bg-[#F9FAFB]/70 transition-colors ${
                      isSelected ? 'bg-[#F2F6FA]/60' : ''
                    }`}
                  >
                    {/* Row Checkbox */}
                    <td className="py-3 px-4 text-center">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => onToggleSelectRow(report.id)}
                        className="rounded border-[#D0D5DD] text-primary focus:ring-primary cursor-pointer size-4 accent-primary"
                        aria-label={`تحديد البلاغ ${report.reportNumber}`}
                      />
                    </td>

                    {/* Report Number Code */}
                    <td className="py-3 px-3 font-semibold text-[#111111]">
                      {report.reportNumber}
                    </td>

                    {/* Submitter Info */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-[#111111]">
                          {report.submittedBy.name}
                        </span>
                        <span className="text-xs text-[#6B6A6A]">
                          {report.submittedBy.email}
                        </span>
                      </div>
                    </td>

                    {/* Reported Party */}
                    <td className="py-3 px-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-[#111111]">
                          {report.against.name}
                        </span>
                        <span className="text-xs text-[#6B6A6A]">
                          {report.against.email}
                        </span>
                      </div>
                    </td>

                    {/* Type Badge */}
                    <td className="py-3 px-3">
                      <span className="inline-block bg-[#F2F4F7] text-[#344054] px-2 py-0.5 rounded text-xs font-medium">
                        {report.type}
                      </span>
                    </td>

                    {/* Reason */}
                    <td
                      className="py-3 px-3 text-[#344054] max-w-45 truncate"
                      title={report.reason}
                    >
                      {report.reason}
                    </td>

                    {/* Status Pill Badge */}
                    <td className="py-3 px-3">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.text}`}
                      >
                        {statusInfo.label}
                      </span>
                    </td>

                    {/* Sent Date */}
                    <td className="py-3 px-3 text-xs text-[#6B6A6A] whitespace-nowrap">
                      {report.createdAt}
                    </td>

                    {/* Priority / Severity */}
                    <td className="py-3 px-3 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center gap-1.5 text-xs font-medium ${priorityInfo.text}`}
                      >
                        <span
                          className={`size-1.5 rounded-full ${priorityInfo.dot}`}
                        />
                        {priorityInfo.label}
                      </span>
                    </td>

                    {/* Action Button */}
                    <td className="py-3 px-4 text-center">
                      <button
                        type="button"
                        onClick={() => onOpenReview(report)}
                        className={`text-xs font-semibold px-3 py-1 rounded transition cursor-pointer ${
                          report.status !== 'قيد الانتظار'
                            ? 'text-primary hover:bg-[#F2F4F7]'
                            : 'text-primary bg-[#F2F6FA] hover:bg-[#E4ECF5]'
                        }`}
                      >
                        {report.status !== 'قيد الانتظار' ? 'عرض' : 'مراجعة'}
                      </button>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer (Figma Node 4779:124000) */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 border-t border-[#ECECEC] bg-white text-xs text-[#6B6A6A]">
        <div>
          <span>
            {reports.length} من {pagination.totalItems} بلاغ
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Previous Button */}
          <button
            type="button"
            disabled={pagination.currentPage <= 1}
            onClick={() => onPageChange(pagination.currentPage - 1)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-[#ECECEC] text-[#111111] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
          >
            <ChevronRight className="w-3.5 h-3.5" />
            <span>السابق</span>
          </button>

          {/* Page Numbers */}
          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (pageNum) => {
              const isActive = pageNum === pagination.currentPage
              return (
                <button
                  key={pageNum}
                  type="button"
                  onClick={() => onPageChange(pageNum)}
                  className={`size-7 rounded flex items-center justify-center font-medium transition cursor-pointer ${
                    isActive
                      ? 'bg-primary text-white font-semibold'
                      : 'text-[#6B6A6A] hover:bg-[#F8FAFC] hover:text-[#111111]'
                  }`}
                >
                  {pageNum}
                </button>
              )
            },
          )}

          {/* Next Button */}
          <button
            type="button"
            disabled={pagination.currentPage >= pagination.totalPages}
            onClick={() => onPageChange(pagination.currentPage + 1)}
            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded border border-[#ECECEC] text-[#111111] hover:bg-[#F8FAFC] disabled:opacity-40 disabled:pointer-events-none transition cursor-pointer"
          >
            <span>التالي</span>
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}
