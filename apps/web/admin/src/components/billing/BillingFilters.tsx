'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, Calendar, Check } from 'lucide-react'
import { BillingFilterState } from './billing.types'

export interface BillingFiltersProps {
  filters: BillingFilterState
  onChange: (updates: Partial<BillingFilterState>) => void
}

export default function BillingFilters({
  filters,
  onChange,
}: BillingFiltersProps) {
  const [userDropdownOpen, setUserDropdownOpen] = useState(false)
  const [packageDropdownOpen, setPackageDropdownOpen] = useState(false)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState(false)

  const userDropRef = useRef<HTMLDivElement>(null)
  const packageDropRef = useRef<HTMLDivElement>(null)
  const statusDropRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        userDropRef.current &&
        !userDropRef.current.contains(e.target as Node)
      ) {
        setUserDropdownOpen(false)
      }
      if (
        packageDropRef.current &&
        !packageDropRef.current.contains(e.target as Node)
      ) {
        setPackageDropdownOpen(false)
      }
      if (
        statusDropRef.current &&
        !statusDropRef.current.contains(e.target as Node)
      ) {
        setStatusDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="flex items-center justify-between flex-wrap gap-3 font-['Cairo'] text-right">
      {/* Left side: Search Input */}
      <div className="relative w-full sm:w-72">
        <input
          type="text"
          value={filters.searchQuery}
          onChange={(e) => onChange({ searchQuery: e.target.value })}
          placeholder="ابحث بالاسم أو البريد أو نوع الباقة..."
          className="w-full h-10 border border-[#ECECEC] bg-white rounded-xl pr-10 pl-4 text-[13px] text-[#111111] placeholder:text-[#94A3B8] focus:outline-none focus:border-primary"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
      </div>
      {/* Right side: Filter Dropdowns */}
      <div className="flex items-center gap-2.5 flex-wrap">
        {/* Dropdown 1: المستخدم */}
        <div className="relative" ref={userDropRef}>
          <button
            type="button"
            onClick={() => setUserDropdownOpen((v) => !v)}
            className="h-10 px-3.5 bg-white border border-[#ECECEC] rounded-xl text-[13px] font-medium text-[#111111] flex items-center gap-2 hover:bg-slate-50 cursor-pointer"
          >
            <span>المستخدم</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6A6A]" />
          </button>

          {userDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-44 bg-white border border-[#ECECEC] rounded-xl shadow-lg p-1.5 z-30 flex flex-col gap-1 text-right">
              {['الكل', 'الأفراد', 'المكاتب العقارية', 'الشركات'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange({ userRoleFilter: opt })
                    setUserDropdownOpen(false)
                  }}
                  className="w-full px-3 py-1.5 text-[13px] font-medium rounded-lg text-right flex items-center justify-between hover:bg-slate-50 text-[#111111]"
                >
                  <span>{opt}</span>
                  {filters.userRoleFilter === opt && (
                    <Check className="w-3.5 h-3.5 text-[#018B1B]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dropdown 2: الباقة */}
        <div className="relative" ref={packageDropRef}>
          <button
            type="button"
            onClick={() => setPackageDropdownOpen((v) => !v)}
            className="h-10 px-3.5 bg-white border border-[#ECECEC] rounded-xl text-[13px] font-medium text-[#111111] flex items-center gap-2 hover:bg-slate-50 cursor-pointer"
          >
            <span>الباقة</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6A6A]" />
          </button>

          {packageDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-40 bg-white border border-[#ECECEC] rounded-xl shadow-lg p-1.5 z-30 flex flex-col gap-1 text-right">
              {['الكل', 'العادية', 'الفضية', 'الذهبية'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange({ packageFilter: opt })
                    setPackageDropdownOpen(false)
                  }}
                  className="w-full px-3 py-1.5 text-[13px] font-medium rounded-lg text-right flex items-center justify-between hover:bg-slate-50 text-[#111111]"
                >
                  <span>{opt}</span>
                  {filters.packageFilter === opt && (
                    <Check className="w-3.5 h-3.5 text-[#018B1B]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dropdown 3: الحالة  */}
        <div className="relative" ref={statusDropRef}>
          <button
            type="button"
            onClick={() => setStatusDropdownOpen((v) => !v)}
            className="h-10 px-3.5 bg-white border border-[#ECECEC] rounded-xl text-[13px] font-medium text-[#111111] flex items-center gap-2 hover:bg-slate-50 cursor-pointer"
          >
            <span>الحالة</span>
            <ChevronDown className="w-3.5 h-3.5 text-[#6B6A6A]" />
          </button>

          {statusDropdownOpen && (
            <div className="absolute right-0 mt-1.5 w-40 bg-white border border-[#ECECEC] rounded-xl shadow-lg p-1.5 z-30 flex flex-col gap-1 text-right">
              {['الكل', 'مدفوعة', 'منتهية', 'ملغية'].map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    onChange({ statusFilter: opt })
                    setStatusDropdownOpen(false)
                  }}
                  className="w-full px-3 py-1.5 text-[13px] font-medium rounded-lg text-right flex items-center justify-between hover:bg-slate-50 text-[#111111]"
                >
                  <span>{opt}</span>
                  {filters.statusFilter === opt && (
                    <Check className="w-3.5 h-3.5 text-[#018B1B]" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dropdown 4: تاريخ الاشتراك */}
        <button
          type="button"
          onClick={() => alert('تصفية تاريخ الاشتراك')}
          className="h-10 px-3.5 bg-white border border-[#ECECEC] rounded-xl text-[13px] font-medium text-[#111111] flex items-center gap-2 hover:bg-slate-50 cursor-pointer"
        >
          <Calendar className="w-4 h-4 text-[#6B6A6A]" />
          <span>تاريخ الاشتراك</span>
        </button>
      </div>
    </div>
  )
}
