'use client'

import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'

const GAP = 4

interface AnchoredMenuProps {
  anchor: HTMLElement | null
  onClose: () => void
  className?: string
  children: ReactNode
}

/**
 * A menu drawn over the page next to its trigger, so a table's overflow
 * can't clip it: it opens below the trigger, or above it when there isn't
 * room (the last rows), with its left edge on the trigger's. Scrolling or
 * resizing closes it.
 */
export default function AnchoredMenu({
  anchor,
  onClose,
  className = '',
  children,
}: AnchoredMenuProps) {
  const menuRef = useRef<HTMLDivElement>(null)
  const [position, setPosition] = useState<{ top: number; left: number } | null>(
    null,
  )

  useLayoutEffect(() => {
    if (!anchor || !menuRef.current) return
    const trigger = anchor.getBoundingClientRect()
    const menu = menuRef.current.getBoundingClientRect()
    const fitsBelow = trigger.bottom + GAP + menu.height <= window.innerHeight
    setPosition({
      top: fitsBelow ? trigger.bottom + GAP : Math.max(GAP, trigger.top - GAP - menu.height),
      left: Math.min(trigger.left, window.innerWidth - menu.width - GAP),
    })
  }, [anchor])

  useLayoutEffect(() => {
    window.addEventListener('scroll', onClose, true)
    window.addEventListener('resize', onClose)
    return () => {
      window.removeEventListener('scroll', onClose, true)
      window.removeEventListener('resize', onClose)
    }
  }, [onClose])

  if (!anchor) return null

  return createPortal(
    <>
      {/* Backdrop overlay to dismiss on click outside */}
      <div className="fixed inset-0 z-30" onClick={onClose} />
      <div
        ref={menuRef}
        className={`fixed z-40 ${className}`}
        style={
          position
            ? { top: position.top, left: position.left }
            : { top: 0, left: 0, visibility: 'hidden' }
        }
      >
        {children}
      </div>
    </>,
    document.body,
  )
}
