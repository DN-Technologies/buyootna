'use client'

import React, { useState } from 'react'
import { Search, ChevronDown, Calendar } from 'lucide-react'
import StatusFilterDropdown from './StatusFilterDropdown'
import PlanFilterDropdown from './PlanFilterDropdown'
import TypeFilterDropdown from './TypeFilterDropdown'

export interface UserTableFiltersProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  selectedType?: string
  onTypeChange?: (val: string) => void
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
  selectedType = '',
  onTypeChange,
  selectedStatus = '',
  onStatusChange,
  selectedSubscription = '',
  onSubscriptionChange,
  dateSort,
  onDateSortToggle,
}: UserTableFiltersProps) {
  const [typeDropdownOpen, setTypeDropdownOpen] = useState(false)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)
  const [planDropdownOpen, setPlanDropdownOpen] = useState(false)

  const getStatusLabel = () => {
    switch (selectedStatus) {
      case 'active':
        return 'الحالة: نشط'
      case 'suspended':
        return 'الحالة: موقوف'
      case 'blocked':
        return 'الحالة: محظور'
      default:
        return 'الحالة'
    }
  }

  const getTypeLabel = () => {
    switch (selectedType) {
      case 'individual':
        return 'النوع: الأفراد'
      case 'office':
        return 'النوع: المكاتب'
      case 'company':
        return 'النوع: الشركات'
      default:
        return 'النوع'
    }
  }

  const getPlanLabel = () => {
    if (selectedSubscription) {
      return `الاشتراك: ${selectedSubscription}`
    }
    return 'الاشتراك'
  }

  return (
    <div
      className="w-full flex flex-col md:flex-row items-center justify-between gap-4 py-4 px-6 md:px-8 border-b border-[#ECECEC] text-right font-['Cairo'] select-none"
      dir="rtl"
      data-node-id="5634:69126"
      data-name="top bar"
    >
      {/* Right side in RTL: Search Input Bar matching Figma 5634:69152 */}
      <div className="relative w-full md:w-79.5 shrink-0">
        <div className="bg-white border border-[#ECECEC] rounded-[64px] px-3.5 py-2 flex items-center justify-between gap-2 h-9.5 transition-colors focus-within:border-gray-400">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث بالاسم، البريد الإلكتروني، رقم الهاتف..."
            className="w-full bg-transparent border-0 outline-none text-right font-['Cairo'] font-medium text-[13px] text-[#111111] placeholder-[#989898]"
            dir="rtl"
          />
          <Search className="w-4.5 h-4.5 text-[#989898] shrink-0" />
        </div>
      </div>

      {/* Left side in RTL: Filter Buttons matching Figma 5634:69127 */}
      <div className="flex flex-wrap items-center gap-2 w-full md:w-auto justify-end">
        {/* Type Filter Dropdown ("النوع") */}
        {onTypeChange && (
          <div className="relative">
            <button
              type="button"
              onClick={() => {
                setTypeDropdownOpen(!typeDropdownOpen)
                setStatusDropdownOpen(false)
                setPlanDropdownOpen(false)
              }}
              className={`h-8.5 bg-white border border-[#E2E8F0] rounded-md px-2.5 py-1.5 flex items-center gap-2 text-[14px] font-medium transition-colors cursor-pointer ${
                selectedType
                  ? 'text-[#111111] font-semibold border-gray-400 bg-gray-50'
                  : 'text-[#111111] hover:bg-[#F8FAFC]'
              }`}
            >
              <span>{getTypeLabel()}</span>
              <ChevronDown className="w-3.5 h-3.5 text-[#6B6A6A]" />
            </button>

            <TypeFilterDropdown
              isOpen={typeDropdownOpen}
              onClose={() => setTypeDropdownOpen(false)}
              selectedType={selectedType}
              onSelectType={(val) => {
                onTypeChange(val)
                setTypeDropdownOpen(false)
              }}
            />
          </div>
        )}

        {/* Status Filter Dropdown ("الحالة") matching Figma 5634:68327 */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setStatusDropdownOpen(!statusDropdownOpen)
              setTypeDropdownOpen(false)
              setPlanDropdownOpen(false)
            }}
            className={`h-8.5 bg-white border border-[#E2E8F0] rounded-md px-2.5 py-1.5 flex items-center gap-2 text-[14px] font-medium transition-colors cursor-pointer ${
              selectedStatus
                ? 'text-[#111111] font-semibold border-gray-400 bg-gray-50'
                : 'text-[#A0A0A0] hover:bg-[#F8FAFC]'
            }`}
          >
            <span>{getStatusLabel()}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6A6A]" />
          </button>

          <StatusFilterDropdown
            isOpen={statusDropdownOpen}
            onClose={() => setStatusDropdownOpen(false)}
            selectedStatus={selectedStatus}
            onSelectStatus={(val) => {
              onStatusChange?.(val)
              setStatusDropdownOpen(false)
            }}
          />
        </div>

        {/* Subscription Plan Dropdown ("الاشتراك") matching Figma 5634:68334 */}
        <div className="relative">
          <button
            type="button"
            onClick={() => {
              setPlanDropdownOpen(!planDropdownOpen)
              setTypeDropdownOpen(false)
              setStatusDropdownOpen(false)
            }}
            className={`h-8.5 bg-white border border-[#E2E8F0] rounded-md px-2.5 py-1.5 flex items-center gap-2 text-[14px] font-medium transition-colors cursor-pointer ${
              selectedSubscription
                ? 'text-[#111111] font-semibold border-gray-400 bg-gray-50'
                : 'text-[#A0A0A0] hover:bg-[#F8FAFC]'
            }`}
          >
            <span>{getPlanLabel()}</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6A6A]" />
          </button>

          <PlanFilterDropdown
            isOpen={planDropdownOpen}
            onClose={() => setPlanDropdownOpen(false)}
            selectedPlan={selectedSubscription}
            onSelectPlan={(val) => {
              onSubscriptionChange?.(val)
              setPlanDropdownOpen(false)
            }}
          />
        </div>

        {/* Registration Date Sort / Filter Button ("تاريخ التسجيل") */}
        <button
          type="button"
          onClick={onDateSortToggle}
          className={`h-8.5 bg-white border border-[#E2E8F0] rounded-lg px-2.5 py-1.5 flex items-center gap-2 text-[14px] font-medium text-[#111111] hover:bg-[#F8FAFC] cursor-pointer transition-colors ${
            dateSort ? 'border-gray-400 bg-gray-50' : ''
          }`}
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
