'use client'

import React from 'react'
import { Search, ChevronDown } from 'lucide-react'

interface UserTableFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedStatus?: string
  onStatusChange?: (val: string) => void
}

export default function UserTableFilters({
  searchQuery,
  onSearchChange,
  selectedStatus = '',
  onStatusChange,
}: UserTableFiltersProps) {
  return (
    <div className="w-full flex items-center justify-between py-4 px-8 border-b border-[#ECECEC] text-right font-['Cairo']">
      {/* Search Input Bar (Right side in RTL) */}
      <div className="relative w-79.5">
        <div className="bg-white border border-[#ECECEC] rounded-[64px] px-3 py-2 flex items-center gap-2">
          <Search className="w-4 h-4 text-[#989898] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث بالاسم، البريد الإلكتروني، رقم الهاتف..."
            className="w-full bg-transparent border-0 outline-none text-right font-['Cairo'] font-medium text-[13px] text-[#111111] placeholder-[#989898]"
            dir="rtl"
          />
        </div>
      </div>

      {/* Filter Dropdown Buttons */}
      <div className="flex items-center gap-2">
        {/* Status Dropdown */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange?.(e.target.value)}
            className="appearance-none h-8.5 bg-white border border-[#E2E8F0] rounded-md pr-3 pl-8 py-1 flex items-center gap-1.5 text-[14px] font-medium text-[#111111] hover:bg-[#F8FAFC] cursor-pointer outline-none font-['Cairo']"
            dir="rtl"
          >
            <option value="">جميع الحالات</option>
            <option value="active">نشط</option>
            <option value="blocked">محظور</option>
            <option value="suspended">موقوف</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#111111] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>
    </div>
  )
}
