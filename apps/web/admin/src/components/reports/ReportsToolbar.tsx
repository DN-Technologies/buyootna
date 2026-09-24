'use client'

import React, { useState, useRef, useEffect } from 'react'
import {
  SearchIcon,
  ChevronDownIcon,
  CalendarFilterIcon,
  CheckBigIcon,
  CloseIcon,
} from '@/components/icons/AdminIcons'
import {
  StatusFilterOption,
  TypeFilterOption,
  PriorityFilterOption,
  DateFilterOption,
} from './types'

interface ReportsToolbarProps {
  searchQuery: string
  onSearchChange: (query: string) => void
  statusFilter: StatusFilterOption
  onStatusFilterChange: (status: StatusFilterOption) => void
  typeFilter: TypeFilterOption
  onTypeFilterChange: (type: TypeFilterOption) => void
  priorityFilter: PriorityFilterOption
  onPriorityFilterChange: (priority: PriorityFilterOption) => void
  dateFilter: DateFilterOption
  onDateFilterChange: (date: DateFilterOption) => void
  selectedCount: number
  onBulkResolve: () => void
  onClearSelection: () => void
}

const TYPE_OPTIONS: TypeFilterOption[] = [
  'الكل',
  'عقار',
  'خدمة',
  'فرد',
  'مكتب عقاري',
  'شركة',
]

const STATUS_OPTIONS: StatusFilterOption[] = [
  'الكل',
  'قيد الانتظار',
  'تم حلها',
  'مرفوض',
]

const PRIORITY_OPTIONS: PriorityFilterOption[] = [
  'الكل',
  'منخفض',
  'متوسط',
  'عاجل',
]

const DATE_OPTIONS: DateFilterOption[] = [
  'الكل',
  'اليوم',
  'هذا الأسبوع',
  'هذا الشهر',
]

export function ReportsToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  typeFilter,
  onTypeFilterChange,
  priorityFilter,
  onPriorityFilterChange,
  dateFilter,
  onDateFilterChange,
  selectedCount,
  onBulkResolve,
  onClearSelection,
}: ReportsToolbarProps) {
  const [isTypeOpen, setIsTypeOpen] = useState(false)
  const [isStatusOpen, setIsStatusOpen] = useState(false)
  const [isPriorityOpen, setIsPriorityOpen] = useState(false)
  const [isDateOpen, setIsDateOpen] = useState(false)

  const typeDropdownRef = useRef<HTMLDivElement>(null)
  const statusDropdownRef = useRef<HTMLDivElement>(null)
  const priorityDropdownRef = useRef<HTMLDivElement>(null)
  const dateDropdownRef = useRef<HTMLDivElement>(null)

  // Handle outside clicks to close dropdowns
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        typeDropdownRef.current &&
        !typeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsTypeOpen(false)
      }
      if (
        statusDropdownRef.current &&
        !statusDropdownRef.current.contains(event.target as Node)
      ) {
        setIsStatusOpen(false)
      }
      if (
        priorityDropdownRef.current &&
        !priorityDropdownRef.current.contains(event.target as Node)
      ) {
        setIsPriorityOpen(false)
      }
      if (
        dateDropdownRef.current &&
        !dateDropdownRef.current.contains(event.target as Node)
      ) {
        setIsDateOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="space-y-3">
      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Search input pill */}
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none text-[#989898]">
            <SearchIcon className="w-4.5 h-4.5" color="#989898" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="ابحث بالاسم، البريد الإلكتروني، رقم الهاتف..."
            className="w-full h-10 pr-10 pl-4 bg-white border border-[#ECECEC] rounded-[64px] text-sm text-[#111111] placeholder:text-[#989898] focus:outline-hidden focus:border-primary focus:ring-1 focus:ring-primary transition"
          />
        </div>

        {/* Action Filters Group */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Date Filter Dropdown */}
          <div className="relative" ref={dateDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsDateOpen(!isDateOpen)
                setIsTypeOpen(false)
                setIsStatusOpen(false)
                setIsPriorityOpen(false)
              }}
              className={`h-10 px-3.5 inline-flex items-center gap-2 rounded-lg border text-sm font-medium transition cursor-pointer ${
                dateFilter !== 'الكل'
                  ? 'border-primary bg-[#F4F7FB] text-primary'
                  : 'border-[#ECECEC] bg-white text-[#111111] hover:bg-[#F9FAFB]'
              }`}
            >
              <CalendarFilterIcon className="w-4 h-4" color="#6B6A6A" />
              <span>
                {dateFilter === 'الكل' ? 'تاريخ التسجيل' : dateFilter}
              </span>
              <ChevronDownIcon
                className={`w-3.5 h-3.5 transition-transform ${isDateOpen ? 'rotate-180' : ''}`}
                color="#6B6A6A"
              />
            </button>

            {isDateOpen && (
              <div
                className="absolute left-0 mt-1.5 w-44 bg-white rounded-md shadow-[0px_4px_6px_0px_rgba(130,130,130,0.2),0px_0px_1px_0px_rgba(130,130,130,0.32)] py-1.5 z-30 flex flex-col"
                dir="rtl"
              >
                {DATE_OPTIONS.map((option) => {
                  const isSelected = dateFilter === option
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        onDateFilterChange(option)
                        setIsDateOpen(false)
                      }}
                      className="h-8 px-3 flex items-center justify-between hover:bg-[#F8FAFC] text-right text-sm text-[#111111] transition cursor-pointer"
                    >
                      <span>{option}</span>
                      {isSelected && (
                        <CheckBigIcon className="w-4 h-4" color="#018B1B" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Type Filter Dropdown (Figma Node 4881:16032) */}
          <div className="relative" ref={typeDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsTypeOpen(!isTypeOpen)
                setIsStatusOpen(false)
                setIsPriorityOpen(false)
                setIsDateOpen(false)
              }}
              className={`h-10 px-3.5 inline-flex items-center gap-2 rounded-lg border text-sm font-medium transition cursor-pointer ${
                typeFilter !== 'الكل'
                  ? 'border-primary bg-[#F4F7FB] text-primary'
                  : 'border-[#ECECEC] bg-white text-[#111111] hover:bg-[#F9FAFB]'
              }`}
            >
              <span>
                {typeFilter === 'الكل' ? 'نوع البلاغ' : `النوع: ${typeFilter}`}
              </span>
              <ChevronDownIcon
                className={`w-3.5 h-3.5 transition-transform ${isTypeOpen ? 'rotate-180' : ''}`}
                color="#6B6A6A"
              />
            </button>

            {isTypeOpen && (
              <div
                className="absolute left-0 mt-1.5 w-44 bg-white rounded-md shadow-[0px_4px_6px_0px_rgba(130,130,130,0.2),0px_0px_1px_0px_rgba(130,130,130,0.32)] py-1.5 z-30 flex flex-col"
                dir="rtl"
              >
                {TYPE_OPTIONS.map((option) => {
                  const isSelected = typeFilter === option
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        onTypeFilterChange(option)
                        setIsTypeOpen(false)
                      }}
                      className="h-8 px-3 flex items-center justify-between hover:bg-[#F8FAFC] text-right text-sm text-[#111111] transition cursor-pointer"
                    >
                      <span>{option}</span>
                      {isSelected && (
                        <CheckBigIcon className="w-4 h-4" color="#018B1B" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Status Filter Dropdown (Figma Node 4779:125426) */}
          <div className="relative" ref={statusDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsStatusOpen(!isStatusOpen)
                setIsTypeOpen(false)
                setIsPriorityOpen(false)
                setIsDateOpen(false)
              }}
              className={`h-10 px-3.5 inline-flex items-center gap-2 rounded-lg border text-sm font-medium transition cursor-pointer ${
                statusFilter !== 'الكل'
                  ? 'border-primary bg-[#F4F7FB] text-primary'
                  : 'border-[#ECECEC] bg-white text-[#111111] hover:bg-[#F9FAFB]'
              }`}
            >
              <span>
                {statusFilter === 'الكل' ? 'الحالة' : `الحالة: ${statusFilter}`}
              </span>
              <ChevronDownIcon
                className={`w-3.5 h-3.5 transition-transform ${isStatusOpen ? 'rotate-180' : ''}`}
                color="#6B6A6A"
              />
            </button>

            {isStatusOpen && (
              <div
                className="absolute left-0 mt-1.5 w-40 bg-white rounded-md shadow-[0px_4px_6px_0px_rgba(130,130,130,0.2),0px_0px_1px_0px_rgba(130,130,130,0.32)] py-1.5 z-30 flex flex-col"
                dir="rtl"
              >
                {STATUS_OPTIONS.map((option) => {
                  const isSelected = statusFilter === option
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        onStatusFilterChange(option)
                        setIsStatusOpen(false)
                      }}
                      className="h-8 px-3 flex items-center justify-between hover:bg-[#F8FAFC] text-right text-sm text-[#111111] transition cursor-pointer"
                    >
                      <span>{option}</span>
                      {isSelected && (
                        <CheckBigIcon className="w-4 h-4" color="#018B1B" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>

          {/* Priority / Severity Filter Dropdown (Figma Node 4881:16018) */}
          <div className="relative" ref={priorityDropdownRef}>
            <button
              type="button"
              onClick={() => {
                setIsPriorityOpen(!isPriorityOpen)
                setIsTypeOpen(false)
                setIsStatusOpen(false)
                setIsDateOpen(false)
              }}
              className={`h-10 px-3.5 inline-flex items-center gap-2 rounded-lg border text-sm font-medium transition cursor-pointer ${
                priorityFilter !== 'الكل'
                  ? 'border-primary bg-[#F4F7FB] text-primary'
                  : 'border-[#ECECEC] bg-white text-[#111111] hover:bg-[#F9FAFB]'
              }`}
            >
              <span>
                {priorityFilter === 'الكل'
                  ? 'الخطورة'
                  : `الخطورة: ${priorityFilter}`}
              </span>
              <ChevronDownIcon
                className={`w-3.5 h-3.5 transition-transform ${isPriorityOpen ? 'rotate-180' : ''}`}
                color="#6B6A6A"
              />
            </button>

            {isPriorityOpen && (
              <div
                className="absolute left-0 mt-1.5 w-36 bg-white rounded-md shadow-[0px_4px_6px_0px_rgba(130,130,130,0.2),0px_0px_1px_0px_rgba(130,130,130,0.32)] py-1.5 z-30 flex flex-col"
                dir="rtl"
                data-node-id="4881:16018"
              >
                {PRIORITY_OPTIONS.map((option) => {
                  const isSelected = priorityFilter === option
                  return (
                    <button
                      key={option}
                      type="button"
                      onClick={() => {
                        onPriorityFilterChange(option)
                        setIsPriorityOpen(false)
                      }}
                      className="h-8 px-3 flex items-center justify-between hover:bg-[#F8FAFC] text-right text-sm text-[#111111] transition cursor-pointer"
                    >
                      <span>{option}</span>
                      {isSelected && (
                        <CheckBigIcon className="w-4 h-4" color="#018B1B" />
                      )}
                    </button>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Action Bar (Figma Node 4880:74436) */}
      {selectedCount > 0 && (
        <div
          className="bg-[#F9FAFE] border border-[#ECECEC] rounded-lg px-6 py-3 flex items-center justify-between transition-all animate-in fade-in slide-in-from-top-1 duration-200"
          dir="rtl"
        >
          <div className="flex items-center gap-4">
            <span className="text-sm font-semibold text-[#111111]">
              {selectedCount} محدد
            </span>
            <button
              type="button"
              onClick={onBulkResolve}
              className="bg-primary hover:bg-[#1c3f64] text-white text-xs font-semibold px-4 py-2 rounded-md transition cursor-pointer shadow-2xs"
            >
              تم الحل
            </button>
          </div>

          <button
            type="button"
            onClick={onClearSelection}
            className="flex items-center gap-1.5 text-xs font-medium text-[#6B6A6A] hover:text-[#111111] transition cursor-pointer"
          >
            <span>إلغاء</span>
            <CloseIcon className="w-3.5 h-3.5" color="currentColor" />
          </button>
        </div>
      )}
    </div>
  )
}
