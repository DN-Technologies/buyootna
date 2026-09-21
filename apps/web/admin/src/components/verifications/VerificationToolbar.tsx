'use client'

import React from 'react'
import {
  CalendarFilterIcon,
  SearchIcon,
  ChevronDownIcon,
  CloseIcon,
} from '@/components/icons/AdminIcons'
import StatusFilterDropdown, {
  VerificationStatusFilter,
} from '@/components/dashboard/StatusFilterDropdown'
import SortByDropdown, {
  SortByOption,
} from '@/components/dashboard/SortByDropdown'

interface VerificationToolbarProps {
  searchQuery: string
  onSearchChange: (value: string) => void
  statusFilter: VerificationStatusFilter
  onStatusFilterChange: (status: VerificationStatusFilter) => void
  showStatusMenu: boolean
  onToggleStatusMenu: () => void
  onCloseStatusMenu: () => void
  sortBy: SortByOption
  onSortByChange: (sort: SortByOption) => void
  showSortMenu: boolean
  onToggleSortMenu: () => void
  onCloseSortMenu: () => void
  selectedCount: number
  onBulkBlock: () => void
  onBulkSuspend: () => void
  onBulkExport: () => void
  onBulkNotify: () => void
  onClearSelection: () => void
}

export default function VerificationToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  showStatusMenu,
  onToggleStatusMenu,
  onCloseStatusMenu,
  sortBy,
  onSortByChange,
  showSortMenu,
  onToggleSortMenu,
  onCloseSortMenu,
  selectedCount,
  onBulkBlock,
  onBulkSuspend,
  onBulkExport,
  onBulkNotify,
  onClearSelection,
}: VerificationToolbarProps) {
  if (selectedCount > 0) {
    return (
      /* Selected Users Bulk Action Toolbar matching Figma 2769:49892 */
      <div
        className="bg-[#F9FAFE] border border-[#ECECEC] rounded-lg flex items-center justify-between py-2.5 px-4 mt-2 transition-all animate-in fade-in"
        data-name="bulk-actions-toolbar"
      >
        {/* Right Side (RTL): Count + Action Buttons */}
        <div className="flex items-center gap-4">
          <span className="font-['Cairo'] font-medium text-[14px] text-[#6B6A6A]">
            {selectedCount} محدد
          </span>

          <div className="flex items-center gap-2">
            {/* Red Ban Button */}
            <button
              type="button"
              onClick={onBulkBlock}
              className="bg-[#9C1E28] hover:bg-[#801921] text-white font-['Cairo'] font-semibold text-[14px] h-8.5 px-4 rounded-lg cursor-pointer transition-colors shadow-xs"
            >
              حظر
            </button>

            {/* Suspend Button */}
            <button
              type="button"
              onClick={onBulkSuspend}
              className="bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#111111] font-['Cairo'] font-semibold text-[14px] h-8.5 px-4 rounded-lg cursor-pointer transition-colors shadow-xs"
            >
              ايقاف
            </button>

            {/* Export Button */}
            <button
              type="button"
              onClick={onBulkExport}
              className="bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#111111] font-['Cairo'] font-semibold text-[14px] h-8.5 px-4 rounded-lg cursor-pointer transition-colors shadow-xs"
            >
              تصدير
            </button>

            {/* Bulk Notify Button */}
            <button
              type="button"
              onClick={onBulkNotify}
              className="bg-white border border-[#E2E8F0] hover:bg-slate-50 text-[#111111] font-['Cairo'] font-semibold text-[14px] h-8.5 px-4 rounded-lg cursor-pointer transition-colors shadow-xs"
            >
              ارسال اشعار جماعي
            </button>
          </div>
        </div>

        {/* Left Side (RTL): Cancel Selection */}
        <button
          type="button"
          onClick={onClearSelection}
          className="flex items-center gap-1.5 text-[#3E4042] hover:text-[#111111] font-['Cairo'] font-bold text-[14px] cursor-pointer transition-colors"
        >
          <CloseIcon className="w-4 h-4 text-[#3E4042]" />
          <span>إلغاء</span>
        </button>
      </div>
    )
  }

  return (
    <div
      className="flex items-center justify-between pt-3 pb-1"
      data-name="filter-bar"
    >
      {/* Right: Search Input */}
      <div className="relative w-80">
        <div className="bg-white border border-[#ECECEC] rounded-[64px] px-3.5 py-2 flex items-center justify-between w-full focus-within:border-primary transition-colors">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث بالاسم، البريد الإلكتروني، رقم الهاتف..."
            className="bg-transparent border-0 outline-none text-[13px] font-['Cairo'] font-medium text-[#111111] placeholder:text-[#989898] w-full text-right"
          />
          <SearchIcon className="w-4.5 h-4.5 text-[#989898] shrink-0 mr-1.5" />
        </div>
      </div>

      {/* Left: Filter Buttons */}
      <div className="flex items-center gap-2 relative">
        {/* Date Filter */}
        <button
          type="button"
          className="bg-white border border-[#E2E8F0] hover:bg-slate-50 h-8.5 px-3 rounded-lg flex items-center gap-2 text-[#111111] font-['Cairo'] font-medium text-[14px] cursor-pointer transition-colors"
        >
          <span>تاريخ التسجيل</span>
          <CalendarFilterIcon className="w-4 h-4 text-[#111111]" />
        </button>

        {/* Sort By Filter matching Figma node 2772:54857 */}
        <div className="relative">
          <button
            type="button"
            onClick={onToggleSortMenu}
            className="bg-white border border-[#E2E8F0] hover:bg-slate-50 h-8.5 px-3 rounded-md flex items-center gap-2 text-[#111111] font-['Cairo'] font-medium text-[14px] cursor-pointer transition-colors"
          >
            <span>
              {sortBy === 'ALL'
                ? 'الترتيب حسب'
                : sortBy === 'NEWEST'
                  ? 'الأحدث أولًا'
                  : 'الأقدم أولًا'}
            </span>
            <ChevronDownIcon className="w-3.5 h-3.5 text-[#111111]" />
          </button>

          <SortByDropdown
            isOpen={showSortMenu}
            onClose={onCloseSortMenu}
            selectedSort={sortBy}
            onSelect={onSortByChange}
          />
        </div>

        {/* Status Filter */}
        <div className="relative">
          <button
            type="button"
            onClick={onToggleStatusMenu}
            className="bg-white border border-[#E2E8F0] hover:bg-slate-50 h-8.5 px-3 rounded-md flex items-center gap-2 text-[#111111] font-['Cairo'] font-medium text-[14px] cursor-pointer transition-colors"
          >
            <span>
              {statusFilter === 'ALL'
                ? 'الحالة'
                : statusFilter === 'VERIFIED'
                  ? 'موثق'
                  : statusFilter === 'PENDING'
                    ? 'قيد الانتظار'
                    : 'غير موثق'}
            </span>
            <ChevronDownIcon className="w-3.5 h-3.5 text-[#111111]" />
          </button>

          <StatusFilterDropdown
            isOpen={showStatusMenu}
            onClose={onCloseStatusMenu}
            selectedStatus={statusFilter}
            onSelect={onStatusFilterChange}
          />
        </div>
      </div>
    </div>
  )
}
