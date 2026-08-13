'use client'

export interface BillingPaginationProps {
  currentPage: number
  totalUsersCount?: number
  onPageChange: (page: number) => void
}

export default function BillingPagination({
  currentPage,
  totalUsersCount = 100,
  onPageChange,
}: BillingPaginationProps) {
  return (
    <div className="p-4 border-t border-[#ECECEC] flex items-center justify-between text-[13px] text-[#6B6A6A] font-['Cairo']">
      <span>14 من {totalUsersCount} مستخدم</span>

      <div className="flex items-center gap-1.5">
        <button
          type="button"
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          className="px-3 py-1.5 rounded-lg border border-[#ECECEC] hover:bg-slate-50 font-bold text-[#111111] cursor-pointer"
        >
          السابق
        </button>
        {[1, 2, 3].map((num) => (
          <button
            key={num}
            type="button"
            onClick={() => onPageChange(num)}
            className={`size-8 rounded-lg font-bold flex items-center justify-center cursor-pointer ${
              currentPage === num
                ? 'bg-primary text-white'
                : 'border border-[#ECECEC] hover:bg-slate-50 text-[#111111]'
            }`}
          >
            {num}
          </button>
        ))}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          className="px-3 py-1.5 rounded-lg border border-[#ECECEC] hover:bg-slate-50 font-bold text-[#111111] cursor-pointer"
        >
          التالي
        </button>
      </div>
    </div>
  )
}
