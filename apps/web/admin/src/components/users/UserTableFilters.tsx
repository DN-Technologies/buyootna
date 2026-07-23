'use client'

import React from 'react'
import { Search, ChevronDown, Calendar } from 'lucide-react'

interface UserTableFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedType?: string
  onTypeChange?: (val: string) => void
  selectedStatus?: string
  onStatusChange?: (val: string) => void
  selectedPlan?: string
  onPlanChange?: (val: string) => void
  selectedVerification?: string
  onVerificationChange?: (val: string) => void
}

export default function UserTableFilters({
  searchQuery,
  onSearchChange,
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

      {/* Filter Dropdown Buttons (Left side in RTL) */}
      <div className="flex items-center gap-2">
        {/* Type Dropdown */}
        <button
          type="button"
          className="h-8.5 bg-white border border-[#E2E8F0] rounded-md px-2.5 py-1.5 flex items-center gap-1.5 text-[14px] font-medium text-[#111111] hover:bg-[#F8FAFC] cursor-pointer"
        >
          <ChevronDown className="w-3.5 h-3.5 text-[#111111]" />
          <span>النوع</span>
        </button>
        {/* Status Dropdown */}
        <button
          type="button"
          className="h-8.5 bg-white border border-[#E2E8F0] rounded-md px-2.5 py-1.5 flex items-center gap-1.5 text-[14px] font-medium text-[#A0A0A0] hover:bg-[#F8FAFC] cursor-pointer"
        >
          <ChevronDown className="w-3.5 h-3.5 text-[#A0A0A0]" />
          <span>الحالة</span>
        </button>
        {/* Plan Dropdown */}
        <button
          type="button"
          className="h-8.5 bg-white border border-[#E2E8F0] rounded-md px-2.5 py-1.5 flex items-center gap-1.5 text-[14px] font-medium text-[#A0A0A0] hover:bg-[#F8FAFC] cursor-pointer"
        >
          <ChevronDown className="w-3.5 h-3.5 text-[#A0A0A0]" />
          <span>الاشتراك</span>
        </button>
        {/* Verification Dropdown */}
        <button
          type="button"
          className="h-8.5 bg-white border border-[#E2E8F0] rounded-md px-2.5 py-1.5 flex items-center gap-1.5 text-[14px] font-medium text-[#A0A0A0] hover:bg-[#F8FAFC] cursor-pointer"
        >
          <ChevronDown className="w-3.5 h-3.5 text-[#A0A0A0]" />
          <span>التوثيق</span>
        </button>
        {/* Registration Date Dropdown */}
        <button
          type="button"
          className="h-8.5 bg-white border border-[#E2E8F0] rounded-lg px-3 py-1.5 flex items-center gap-2 text-[14px] font-medium text-[#111111] hover:bg-[#F8FAFC] cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-[#6B6A6A]" />
          <span>تاريخ التسجيل</span>
          <ChevronDown className="w-3.5 h-3.5 text-[#6B6A6A]" />
        </button>
      </div>
    </div>
  )
}
