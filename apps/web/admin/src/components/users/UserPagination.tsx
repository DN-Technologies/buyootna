'use client'

import { ChevronRight, ChevronLeft } from 'lucide-react'

interface UserPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  currentCount: number
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
  onPageChange,
}: UserPaginationProps) {
  const pages = getPaginationRange(currentPage, totalPages)

  return (
    <div className="w-full flex items-center justify-between py-4 px-2 font-['Cairo'] text-right">
      {/* Page Navigation Controls (Left side in RTL) */}
      <div className="flex items-center gap-1.5 text-[14px]">
        {/* Next Button */}
        <button
          type="button"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E2E8F0] font-medium text-[#111111] transition-colors ${
            currentPage >= totalPages
              ? 'opacity-50 cursor-not-allowed bg-white'
              : 'bg-white hover:bg-[#F8FAFC] cursor-pointer'
          }`}
        >
          <ChevronRight className="w-4 h-4" />
          <span>التالي</span>
        </button>

        {/* Page Numbers */}
        <div className="flex items-center gap-1">
          {pages.map((page, index) => {
            if (page === ELLIPSIS) {
              return (
                <span
                  key={`ellipsis-${index}`}
                  className="w-8 h-8 flex items-center justify-center text-[14px] font-bold text-[#111111]"
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
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-[14px] cursor-pointer transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'bg-white text-[#111111] hover:bg-[#F1F5F9]'
                }`}
              >
                {page}
              </button>
            )
          })}
        </div>

        {/* Previous Button */}
        <button
          type="button"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg border border-[#E2E8F0] font-medium text-[#111111] transition-colors ${
            currentPage <= 1
              ? 'opacity-50 cursor-not-allowed bg-white'
              : 'bg-white hover:bg-[#F8FAFC] cursor-pointer'
          }`}
        >
          <span>السابق</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Info Count Text (Right side in RTL) */}
      <p className="text-[14px] font-medium text-[#6B6A6A]">
        {currentCount} من {totalItems} مستخدم
      </p>
    </div>
  )
}
