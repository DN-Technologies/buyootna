'use client'

import React from 'react'
import { X } from 'lucide-react'

export interface SelectedUsersActionsProps {
  selectedCount: number
  onClearSelection: () => void
  onBulkNotification?: () => void
  onBulkExport?: () => void
  onBulkSuspend?: () => void
  onBulkBlock?: () => void
}

export default function SelectedUsersActions({
  selectedCount,
  onClearSelection,
  onBulkNotification,
  onBulkExport,
  onBulkSuspend,
  onBulkBlock,
}: SelectedUsersActionsProps) {
  if (selectedCount === 0) return null

  return (
    <div
      className="bg-[#F9FAFE] border-b border-[#ECECEC] flex items-center justify-between py-3 px-6 md:px-8 w-full select-none animate-in fade-in slide-in-from-top-1 duration-150 font-['Cairo']"
      dir="rtl"
      data-node-id="2376:74201"
      data-name="SelectedUsersActions"
    >
      {/* Right side in RTL: Count and Action Buttons */}
      <div className="flex items-center gap-4">
        <p className="font-['Cairo'] font-medium text-[#6B6A6A] text-[14px] whitespace-nowrap">
          {selectedCount} محدد
        </p>

        <div className="flex items-center gap-2">
          {/* ارسال اشعار جماعي - Outline Button */}
          {onBulkNotification && (
            <button
              type="button"
              onClick={onBulkNotification}
              className="bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#111111] h-8.5 px-4 rounded-lg text-[14px] font-semibold transition-colors cursor-pointer flex items-center justify-center whitespace-nowrap"
            >
              ارسال اشعار جماعي
            </button>
          )}

          {/* تصدير - Outline Button */}
          {onBulkExport && (
            <button
              type="button"
              onClick={onBulkExport}
              className="bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#111111] h-8.5 px-4 rounded-lg text-[14px] font-semibold transition-colors cursor-pointer flex items-center justify-center whitespace-nowrap"
            >
              تصدير
            </button>
          )}

          {/* ايقاف - Outline Button */}
          {onBulkSuspend && (
            <button
              type="button"
              onClick={onBulkSuspend}
              className="bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] text-[#111111] h-8.5 px-4 rounded-lg text-[14px] font-semibold transition-colors cursor-pointer flex items-center justify-center whitespace-nowrap"
            >
              ايقاف
            </button>
          )}

          {/* حظر - Solid Red Button */}
          {onBulkBlock && (
            <button
              type="button"
              onClick={onBulkBlock}
              className="bg-[#9C1E28] hover:bg-[#851821] text-white h-8.5 px-4 rounded-lg text-[14px] font-semibold transition-colors cursor-pointer flex items-center justify-center whitespace-nowrap"
            >
              حظر
            </button>
          )}
        </div>
      </div>

      {/* Left side in RTL: Cancel Button */}
      <button
        type="button"
        onClick={onClearSelection}
        className="flex items-center gap-1.5 text-[14px] font-bold text-[#3E4042] hover:text-[#111111] transition-colors cursor-pointer"
      >
        <span>إلغاء</span>
        <X className="w-4 h-4 text-[#3E4042]" />
      </button>
    </div>
  )
}
