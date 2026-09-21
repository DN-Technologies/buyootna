'use client'

import React, { useEffect, useRef } from 'react'
import { CheckBigIcon } from '@/components/icons/AdminIcons'

export type VerificationStatusFilter =
  'ALL' | 'VERIFIED' | 'PENDING' | 'UNVERIFIED'

export interface StatusFilterOption {
  value: VerificationStatusFilter
  label: string
}

export const STATUS_FILTER_OPTIONS: StatusFilterOption[] = [
  { value: 'ALL', label: 'الكل' },
  { value: 'VERIFIED', label: 'موثق' },
  { value: 'PENDING', label: 'قيد الانتظار' },
  { value: 'UNVERIFIED', label: 'غير موثق' },
]

interface StatusFilterDropdownProps {
  isOpen: boolean
  onClose: () => void
  selectedStatus: VerificationStatusFilter
  onSelect: (status: VerificationStatusFilter) => void
}

export default function StatusFilterDropdown({
  isOpen,
  onClose,
  selectedStatus,
  onSelect,
}: StatusFilterDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute left-0 mt-1 bg-white border border-[#ECECEC] rounded-md shadow-[0px_4px_6px_0px_rgba(130,130,130,0.2),0px_0px_1px_0px_rgba(130,130,130,0.32)] px-3 py-1.5 flex flex-col gap-0.5 w-31 z-30 select-none animate-in fade-in-50 duration-100"
      data-node-id="2769:50306"
      data-name="Dropdown"
      dir="rtl"
    >
      {STATUS_FILTER_OPTIONS.map((option) => {
        const isSelected = selectedStatus === option.value
        return (
          <button
            key={option.value}
            type="button"
            onClick={() => {
              onSelect(option.value)
              onClose()
            }}
            className="flex items-center justify-start gap-1 h-8 py-2 w-full text-right hover:bg-[#F8FAFC] rounded transition-colors cursor-pointer"
          >
            <span className="font-['Cairo'] font-normal text-[14px] text-[#111111] leading-none tracking-[-0.408px]">
              {option.label}
            </span>
            {isSelected && (
              <div className="size-4 shrink-0 flex items-center justify-center">
                <CheckBigIcon className="w-4 h-4" color="#006C4A" />
              </div>
            )}
          </button>
        )
      })}
    </div>
  )
}
