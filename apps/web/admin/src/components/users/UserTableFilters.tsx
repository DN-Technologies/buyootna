'use client'

import React from 'react'
import { Search, ChevronDown, Calendar } from 'lucide-react'

interface UserTableFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedStatus?: string
  onStatusChange?: (val: string) => void
  selectedSubscription?: string
  onSubscriptionChange?: (val: string) => void
  dateSort?: 'asc' | 'desc'
  onDateSortToggle?: () => void
}

export default function UserTableFilters({
  searchQuery,
  onSearchChange,
  selectedStatus = '',
  onStatusChange,
  selectedSubscription = '',
  onSubscriptionChange,
  dateSort,
  onDateSortToggle,
}: UserTableFiltersProps) {
  return (
    <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4 py-4 px-6 md:px-8 border-b border-[#ECECEC] text-right font-['Cairo']">
      {/* Search Input Bar (Right side in RTL) */}
      <div className="relative w-full sm:w-[320px]">
        <div className="bg-white border border-[#ECECEC] rounded-[64px] px-3.5 py-2 flex items-center gap-2">
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

      {/* Filter Buttons (Left side in RTL) */}
      <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
        {/* Status Dropdown */}
        <div className="relative">
          <select
            value={selectedStatus}
            onChange={(e) => onStatusChange?.(e.target.value)}
            className="appearance-none h-8.5 bg-white border border-[#E2E8F0] rounded-md pr-3 pl-8 py-1 flex items-center gap-1.5 text-[14px] font-medium text-[#111111] hover:bg-[#F8FAFC] cursor-pointer outline-none font-['Cairo'] transition-colors"
            dir="rtl"
          >
            <option value="">الحالة: الكل</option>
            <option value="active">نشط</option>
            <option value="blocked">محظور</option>
            <option value="suspended">موقوف</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#111111] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Subscription Plan Dropdown */}
        <div className="relative">
          <select
            value={selectedSubscription}
            onChange={(e) => onSubscriptionChange?.(e.target.value)}
            className="appearance-none h-8.5 bg-white border border-[#E2E8F0] rounded-md pr-3 pl-8 py-1 flex items-center gap-1.5 text-[14px] font-medium text-[#111111] hover:bg-[#F8FAFC] cursor-pointer outline-none font-['Cairo'] transition-colors"
            dir="rtl"
          >
            <option value="">الاشتراك: الكل</option>
            <option value="الفضية">الفضية</option>
            <option value="الذهبية">الذهبية</option>
            <option value="السنوية">السنوية</option>
            <option value="العادية">العادية</option>
          </select>
          <ChevronDown className="w-3.5 h-3.5 text-[#111111] absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Registration Date Sort / Filter Button */}
        <button
          type="button"
          onClick={onDateSortToggle}
          className="h-8.5 bg-white border border-[#E2E8F0] rounded-lg px-2.5 py-1 flex items-center gap-1.5 text-[14px] font-medium text-[#111111] hover:bg-[#F8FAFC] cursor-pointer outline-none font-['Cairo'] transition-colors"
        >
          <Calendar className="w-4 h-4 text-[#111111] shrink-0" />
          <span>تاريخ التسجيل</span>
          {dateSort && (
            <span className="text-xs text-[#6B6A6A]">
              ({dateSort === 'asc' ? 'الأقدم' : 'الأحدث'})
            </span>
          )}
        </button>
      </div>
    </div>
  )
}
