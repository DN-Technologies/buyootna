'use client'

import React from 'react'
import { ChevronRight, ChevronLeft } from 'lucide-react'

interface UserPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  currentCount: number
  itemLabel?: string
  onPageChange: (page: number) => void
}

const ELLIPSIS = '...' as const

function getPaginationRange(
  currentPage: number,
  totalPages: number,
  siblingCount = 1,
): (number | typeof ELLIPSIS)[] {
  const totalPageNumbers = siblingCount * 2 + 5

  if (totalPageNumbers >= totalPages) {
    return Array.from({ length: totalPages }, (_, i) => i + 1)
  }

  const leftSiblingIndex = Math.max(currentPage - siblingCount, 1)
  const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages)

  const showLeftEllipsis = leftSiblingIndex > 2
  const showRightEllipsis = rightSiblingIndex < totalPages - 1

  if (!showLeftEllipsis && showRightEllipsis) {
    const leftItemCount = 3 + siblingCount * 2
    const leftRange = Array.from({ length: leftItemCount }, (_, i) => i + 1)
    return [...leftRange, ELLIPSIS, totalPages]
  }

  if (showLeftEllipsis && !showRightEllipsis) {
    const rightItemCount = 3 + siblingCount * 2
    const rightRange = Array.from(
      { length: rightItemCount },
      (_, i) => totalPages - rightItemCount + i + 1,
    )
    return [1, ELLIPSIS, ...rightRange]
  }

  const middleRange = Array.from(
    { length: rightSiblingIndex - leftSiblingIndex + 1 },
    (_, i) => leftSiblingIndex + i,
  )
  return [1, ELLIPSIS, ...middleRange, ELLIPSIS, totalPages]
}

export default function UserPagination({
  currentPage,
  totalPages,
  totalItems,
  currentCount,
  itemLabel = 'مستخدم',
  onPageChange,
}: UserPaginationProps) {
  const pages = getPaginationRange(currentPage, totalPages)

  return (
    <div
      className="w-full flex items-center justify-between py-3 px-6 md:px-8 font-['Cairo'] text-right border-t border-[#ECECEC] bg-white select-none"
      dir="rtl"
      data-node-id="5634:69405"
      data-name="pagination"
    >
      {/* Page Navigation Controls (Left side in RTL) */}
      <div className="flex items-center gap-3 text-[14px]">
        {/* Next Button ("التالي" in RTL) */}
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`flex items-center gap-1 font-normal text-[14px] transition-colors ${
            currentPage >= totalPages
              ? 'opacity-40 cursor-not-allowed text-[#A0A0A0]'
              : 'text-[#111111] hover:text-black cursor-pointer'
          }`}
        >
          <ChevronLeft className="w-4 h-4 text-inherit" />
          <span>التالي</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1.5 font-['Inter']">
          {pages.map((page, index) => {
            if (page === ELLIPSIS) {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="w-6 h-6 flex items-center justify-center text-[14px] text-[#A0A0A0]"
                >
                  {ELLIPSIS}
                </span>
              )
            }

            const isActive = page === currentPage
            return (
              <button
                key={page}
                type="button"
                onClick={() => onPageChange(page)}
                className={`w-6 h-6 rounded-lg flex items-center justify-center text-[14px] font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-[#111111] hover:bg-gray-100'
                }`}
              >
                {page}
              </button>
            )
          })}
        </div>

        {/* Previous Button ("السابق" in RTL) */}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`flex items-center gap-1 font-normal text-[14px] transition-colors ${
            currentPage <= 1
              ? 'opacity-40 cursor-not-allowed text-[#A0A0A0]'
              : 'text-[#111111] hover:text-black cursor-pointer'
          }`}
        >
          <span>السابق</span>
          <ChevronRight className="w-4 h-4 text-inherit" />
        </button>
      </div>

      {/* Info Count Text (Right side in RTL) matching Figma 5634:69405 */}
      <p className="text-[12px] font-normal text-[#A0A0A0]">
        {currentCount} من {totalItems} {itemLabel}
      </p>
    </div>
  )
}
