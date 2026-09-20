'use client'

import React from 'react'
import { ChevronLeft } from 'lucide-react'
import { VerificationTableRow } from './types'

interface VerificationTablePagination {
  currentPage: number
  totalPages: number
  totalItems: number
  currentCount: number
}

interface VerificationTableProps {
  rows: VerificationTableRow[]
  selectedIds: string[]
  onToggleSelectAll: () => void
  onToggleSelectRow: (id: string) => void
  onOpenReview: (row: VerificationTableRow) => void
  pagination: VerificationTablePagination
  onPageChange: (page: number) => void
  loading?: boolean
}

export default function VerificationTable({
  rows,
  selectedIds,
  onToggleSelectAll,
  onToggleSelectRow,
  onOpenReview,
  pagination,
  onPageChange,
  loading,
}: VerificationTableProps) {
  const { currentPage, totalPages, totalItems, currentCount } = pagination
  const pageNumbers = Array.from({ length: totalPages }, (_, i) => i + 1)
  return (
    <div className="bg-white border border-[#ECECEC] rounded-lg overflow-hidden">
      {/* Table Header matching Figma 4779:123026 */}
      <div className="bg-[#FBFBFB] border-b border-[#ECECEC] px-5 py-3 flex items-center justify-between text-right">
        {/* User Name + Select All Checkbox */}
        <div className="flex items-center gap-4 w-65 justify-start">
          <input
            type="checkbox"
            checked={rows.length > 0 && selectedIds.length === rows.length}
            onChange={onToggleSelectAll}
            className="w-4.5 h-4.5 rounded border-[#D7D7D7] text-primary focus:ring-0 cursor-pointer accent-primary"
          />
          <span className="font-['Cairo'] font-semibold text-[12px] text-[#6B6A6A]">
            اسم المستخدم
          </span>
        </div>

        {/* Account Type */}
        <div className="w-28 text-right">
          <span className="font-['Cairo'] font-semibold text-[12px] text-[#6B6A6A]">
            نوع الحساب
          </span>
        </div>

        {/* Verification Status */}
        <div className="w-24 text-right">
          <span className="font-['Cairo'] font-semibold text-[12px] text-[#6B6A6A]">
            الحالة
          </span>
        </div>

        {/* Attachments */}
        <div className="w-20 text-right">
          <span className="font-['Cairo'] font-semibold text-[12px] text-[#6B6A6A]">
            المرفقات
          </span>
        </div>

        {/* Account Activity Status (نشط / موقوف) */}
        <div className="w-20 text-right">
          <span className="font-['Cairo'] font-semibold text-[12px] text-[#6B6A6A]">
            الحالة
          </span>
        </div>

        {/* Sent Date */}
        <div className="w-28 text-right">
          <span className="font-['Cairo'] font-semibold text-[12px] text-[#6B6A6A]">
            تاريخ الارسال
          </span>
        </div>

        {/* Actions */}
        <div className="w-20 text-center">
          <span className="font-['Cairo'] font-semibold text-[12px] text-[#6B6A6A]">
            الاجراءات
          </span>
        </div>
      </div>

      {/* Table Rows matching Figma 4779:123043 & 2769:52652 */}
      {loading ? (
        <div className="py-12 text-center text-[#6B6A6A] font-['Cairo'] text-[14px]">
          جارٍ التحميل...
        </div>
      ) : rows.length === 0 ? (
        <div className="py-12 text-center text-[#6B6A6A] font-['Cairo'] text-[14px]">
          لا توجد طلبات تحقق مطابقة للبحث أو التصفية الحالية
        </div>
      ) : (
        <div className="divide-y divide-[#ECECEC]">
          {rows.map((row) => {
            const isSelected = selectedIds.includes(row.id)
            return (
              <div
                key={row.id}
                className={`h-12 px-5 flex items-center justify-between text-right transition-colors ${
                  isSelected ? 'bg-[#F9FAFE]' : 'hover:bg-[#F9FAFB]/60'
                }`}
              >
                {/* User Name & Checkbox */}
                <div className="flex items-center gap-4 w-65 justify-start">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => onToggleSelectRow(row.id)}
                    className="w-4.5 h-4.5 rounded border-[#D7D7D7] text-primary focus:ring-0 cursor-pointer accent-primary"
                  />
                  <div className="flex flex-col text-right truncate">
                    <span className="font-['Cairo'] font-semibold text-[13px] text-[#111111] leading-tight truncate">
                      {row.name}
                    </span>
                    <span className="font-['Cairo'] font-normal text-[12px] text-[#6B6A6A] leading-tight truncate">
                      {row.email}
                    </span>
                  </div>
                </div>

                {/* Account Type */}
                <div className="w-28 text-right">
                  <span className="font-['Cairo'] font-normal text-[13px] text-[#111111]">
                    {row.accountType}
                  </span>
                </div>

                {/* Verification Status Indicator */}
                <div className="w-24 text-right">
                  <div className="inline-flex items-center gap-1.5">
                    <span
                      className={`size-1.5 rounded-full shrink-0 ${
                        row.status === 'غير موثق'
                          ? 'bg-[#6B6A6A]'
                          : row.status === 'مرفوض'
                            ? 'bg-[#9C1E28]'
                            : row.status === 'قيد الانتظار'
                              ? 'bg-[#B97500]'
                              : 'bg-[#1791E7]'
                      }`}
                    />
                    <span
                      className={`text-[12px] font-['Cairo'] font-medium ${
                        row.status === 'غير موثق'
                          ? 'text-[#6B6A6A]'
                          : row.status === 'مرفوض'
                            ? 'text-[#9C1E28]'
                            : row.status === 'قيد الانتظار'
                              ? 'text-[#B97500]'
                              : 'text-[#1791E7]'
                      }`}
                    >
                      {row.status}
                    </span>
                  </div>
                </div>

                {/* Attachments */}
                <div className="w-20 text-right font-['Cairo'] font-normal text-[13px] text-[#111111] truncate">
                  {row.attachmentsText}
                </div>

                {/* Account Activity Status Pill */}
                <div className="w-20 text-right">
                  {row.accountStatus ? (
                    <span
                      className={`inline-flex items-center justify-center px-2 py-0.5 rounded-[99px] text-[12px] font-['Cairo'] font-medium ${
                        row.accountStatus === 'نشط'
                          ? 'bg-[rgba(18,194,129,0.1)] text-[#018B1B]'
                          : 'bg-[rgba(245,184,70,0.1)] text-[#DB9718]'
                      }`}
                    >
                      {row.accountStatus}
                    </span>
                  ) : (
                    <span className="text-[#A0A0A0] text-[12px] font-['Cairo']">
                      ــــــ
                    </span>
                  )}
                </div>

                {/* Sent Date */}
                <div className="w-28 text-right font-['Cairo'] font-normal text-[12px] text-[#6B6A6A]">
                  {row.sentAt}
                </div>

                {/* Actions Link */}
                <div className="w-20 text-center">
                  <button
                    type="button"
                    onClick={() => onOpenReview(row)}
                    className="font-['Cairo'] font-bold text-[13px] text-primary hover:underline cursor-pointer"
                  >
                    {row.actionLabel}
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Table Pagination Footer matching Figma 4779:123251 */}
      <div className="border-t border-[#ECECEC] px-5 py-3 flex items-center justify-between bg-white text-right">
        {/* Item Count */}
        <span className="font-['Cairo'] font-normal text-[12px] text-[#A0A0A0]">
          {currentCount} من {totalItems} مستخدم
        </span>

        {/* Navigation Controls */}
        <div className="flex items-center gap-3">
          {/* Previous */}
          <button
            type="button"
            disabled={currentPage <= 1}
            onClick={() => onPageChange(currentPage - 1)}
            className="flex items-center gap-1 text-[14px] font-['Cairo'] font-normal text-[#A0A0A0] hover:text-[#111111] disabled:opacity-40 disabled:hover:text-[#A0A0A0] transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-4 h-4 text-[#A0A0A0]" />
            <span>السابق</span>
          </button>

          {/* Page Numbers */}
          <div className="flex items-center gap-1">
            {pageNumbers.map((page) => (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`size-6 rounded-lg flex items-center justify-center font-['Inter'] font-medium text-[14px] cursor-pointer ${
                  page === currentPage
                    ? 'bg-primary text-white'
                    : 'text-[#111111] hover:bg-slate-100'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          {/* Next */}
          <button
            type="button"
            disabled={currentPage >= totalPages}
            onClick={() => onPageChange(currentPage + 1)}
            className="flex items-center gap-1 text-[14px] font-['Cairo'] font-normal text-[#111111] hover:text-primary disabled:opacity-40 disabled:hover:text-[#111111] transition-colors cursor-pointer disabled:cursor-not-allowed"
          >
            <span>التالي</span>
            <div className="rotate-180 flex items-center">
              <ChevronLeft className="w-4 h-4 text-[#111111]" />
            </div>
          </button>
        </div>
      </div>
    </div>
  )
}
