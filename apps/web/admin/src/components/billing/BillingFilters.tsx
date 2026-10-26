'use client'

import { useState, useRef, useEffect } from 'react'
import { Search, ChevronDown, Check } from 'lucide-react'
import { FilterOption } from './billing.types'

interface FilterDropdownProps {
  label: string
  value: string
  options: FilterOption[]
  onSelect: (value: string) => void
}

function FilterDropdown({
  label,
  value,
  options,
  onSelect,
}: FilterDropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const selected = options.find((o) => o.value === value)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="h-10 px-3.5 bg-white border border-[#ECECEC] rounded-xl text-[13px] font-medium text-[#111111] flex items-center gap-2 hover:bg-slate-50 cursor-pointer"
      >
        <span>
          {label}
          {value && selected ? `: ${selected.label}` : ''}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-[#6B6A6A]" />
      </button>

      {open && (
        <div className="absolute right-0 mt-1.5 w-48 max-h-72 overflow-y-auto bg-white border border-[#ECECEC] rounded-xl shadow-lg p-1.5 z-30 flex flex-col gap-1 text-right">
          {options.map((opt) => (
            <button
              key={opt.value || 'all'}
              type="button"
              onClick={() => {
                onSelect(opt.value)
                setOpen(false)
              }}
              className="w-full px-3 py-1.5 text-[13px] font-medium rounded-lg text-right flex items-center justify-between hover:bg-slate-50 text-[#111111]"
            >
              <span>{opt.label}</span>
              {value === opt.value && (
                <Check className="w-3.5 h-3.5 text-[#018B1B]" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

export interface BillingFiltersProps {
  search: string
  onSearchChange: (value: string) => void
  searchPlaceholder: string
  dropdowns: FilterDropdownProps[]
}

export default function BillingFilters({
  search,
  onSearchChange,
  searchPlaceholder,
  dropdowns,
}: BillingFiltersProps) {
  return (
    <div className="flex items-center justify-between flex-wrap gap-3 font-['Cairo'] text-right">
      <div className="relative w-full sm:w-72">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder={searchPlaceholder}
          className="w-full h-10 border border-[#ECECEC] bg-white rounded-xl pr-10 pl-4 text-[13px] text-[#111111] placeholder:text-[#94A3B8] focus:outline-none focus:border-primary"
        />
        <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#94A3B8]" />
      </div>
      <div className="flex items-center gap-2.5 flex-wrap">
        {dropdowns.map((dropdown) => (
          <FilterDropdown key={dropdown.label} {...dropdown} />
        ))}
      </div>
    </div>
  )
}
