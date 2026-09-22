'use client'

import React, { useEffect, useRef } from 'react'

export interface StatusFilterDropdownProps {
  isOpen: boolean
  onClose: () => void
  selectedStatus?: string
  onSelectStatus: (status: string) => void
}

const statusOptions = [
  { label: 'الكل', value: '' },
  { label: 'نشط', value: 'active' },
  { label: 'موقوف', value: 'suspended' },
  { label: 'محظور', value: 'blocked' },
]

export default function StatusFilterDropdown({
  isOpen,
  onClose,
  selectedStatus = '',
  onSelectStatus,
}: StatusFilterDropdownProps) {
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleClickOutside = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node)
      ) {
        onClose()
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  if (!isOpen) return null

  return (
    <div
      ref={dropdownRef}
      className="absolute top-full mt-1.5 right-0 z-40 w-36.75 bg-white rounded-md shadow-[0px_4px_6px_0px_rgba(130,130,130,0.2),0px_0px_1px_0px_rgba(130,130,130,0.32)] border border-[#ECECEC]/60 py-1.5 px-3 flex flex-col gap-0.5 items-end text-right select-none animate-in fade-in zoom-in-95 duration-100"
      dir="rtl"
      data-node-id="5634:68327"
      data-name="activity dropdown"
    >
      {statusOptions.map((opt) => {
        const isSelected = selectedStatus === opt.value
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => {
              onSelectStatus(opt.value)
              onClose()
            }}
            className={`w-full h-8 py-2 px-1.5 flex items-center justify-start rounded-sm cursor-pointer transition-colors text-right ${
              isSelected ? 'bg-[#F2F4F7] font-semibold' : 'hover:bg-[#F8FAFC]'
            }`}
          >
            <p className="font-['Cairo'] font-normal leading-normal text-[#111111] text-[14px] text-right tracking-[-0.408px] w-full">
              {opt.label}
            </p>
          </button>
        )
      })}
    </div>
  )
}
