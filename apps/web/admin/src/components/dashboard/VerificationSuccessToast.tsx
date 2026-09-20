'use client'

import React, { useEffect } from 'react'
import { ToastSuccessRosetteIcon } from '@/components/icons/AdminIcons'

export interface VerificationSuccessToastProps {
  show: boolean
  message?: string
  undoText?: string
  onUndo?: () => void
  onClose?: () => void
  autoHideDuration?: number
}

export default function VerificationSuccessToast({
  show,
  message = 'تم اعتماد التوثيق بنجاح.',
  undoText = 'تراجع',
  onUndo,
  onClose,
  autoHideDuration = 5000,
}: VerificationSuccessToastProps) {
  useEffect(() => {
    if (!show || !onClose || autoHideDuration <= 0) return

    const timer = setTimeout(() => {
      onClose()
    }, autoHideDuration)

    return () => clearTimeout(timer)
  }, [show, onClose, autoHideDuration])

  if (!show) return null

  return (
    <div
      className="fixed top-6 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 animate-in fade-in slide-in-from-top-4"
      dir="rtl"
    >
      <div
        className="bg-white border border-[#15a72b] drop-shadow-[0px_2px_1px_rgba(33,37,41,0.06),0px_0px_0.5px_rgba(33,37,41,0.08)] flex items-center justify-between gap-6 px-4 py-2.5 rounded-lg min-w-85 max-w-120 shadow-sm select-none"
        data-node-id="2734:152341"
        data-name="update ad success mess"
      >
        {/* Right side: Icon + Message */}
        <div className="flex items-center gap-2.5">
          <div className="w-[23.5px] h-6 shrink-0 flex items-center justify-center">
            <ToastSuccessRosetteIcon className="w-[23.5px] h-6" />
          </div>
          <p className="font-['Cairo'] font-normal text-[#111111] text-[16px] leading-normal whitespace-nowrap">
            {message}
          </p>
        </div>

        {/* Left side: Undo button */}
        {onUndo && (
          <button
            type="button"
            onClick={onUndo}
            className="font-['Cairo'] font-bold text-[#15304d] text-[16px] leading-normal hover:underline cursor-pointer whitespace-nowrap bg-transparent border-0 p-0"
          >
            {undoText}
          </button>
        )}
      </div>
    </div>
  )
}
