'use client'

import { ClipboardList } from 'lucide-react'

export interface RequestsEmptyStateProps {
  typeFilter: 'all' | 'private' | 'public'
}

export default function RequestsEmptyState({
  typeFilter,
}: RequestsEmptyStateProps) {
  const emptyTitle =
    typeFilter === 'private'
      ? 'لا توجد طلبات خاصة حتى الان'
      : typeFilter === 'public'
        ? 'لا توجد طلبات عامة حتى الان'
        : 'لا توجد طلبات حتى الان'

  return (
    <div className="flex flex-col items-center justify-center text-center py-20 gap-3 bg-white border border-[#ECECEC] rounded-xl my-2">
      <div className="size-16 rounded-2xl bg-[#F8FAFC] border border-[#ECECEC] flex items-center justify-center text-[#111111]">
        <ClipboardList className="w-8 h-8 stroke-[1.5]" />
      </div>
      <h4 className="font-bold text-[18px] text-[#111111] mt-2">
        {emptyTitle}
      </h4>
      <p className="text-[13px] text-[#6B6A6A] max-w-sm leading-relaxed">
        ستظهر الطلبات هنا فور اضافتها من المستخدم.
      </p>
    </div>
  )
}
