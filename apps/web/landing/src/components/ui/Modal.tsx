'use client'

import { useEffect, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  // Omit to make the dialog one the visitor must answer
  onClose?: () => void
  labelledBy?: string
  className?: string
  children: ReactNode
}

/** A centred dialog over a dimmed page; Escape and the backdrop close it. */
export default function Modal({
  open,
  onClose,
  labelledBy,
  className = '',
  children,
}: ModalProps) {
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose?.()
    }
    document.addEventListener('keydown', onKeyDown)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center overflow-y-auto p-5">
      <button
        type="button"
        aria-label="إغلاق"
        tabIndex={-1}
        onClick={onClose}
        className="fixed inset-0 cursor-default bg-black/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={labelledBy}
        className={`relative my-auto w-full rounded-2xl bg-white shadow-[0_20px_24px_-4px_rgba(0,0,0,0.1),0_8px_8px_-4px_rgba(0,0,0,0.04)] ${className}`}
      >
        {children}
      </div>
    </div>
  )
}
