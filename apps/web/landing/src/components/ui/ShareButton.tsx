'use client'

import { useState, type ReactNode } from 'react'

/**
 * Shares a page: the device's share sheet where there is one, otherwise the
 * link is copied and the button says so for a moment.
 */
export default function ShareButton({
  path,
  title,
  className,
  children,
}: {
  // The page to share, from the site root
  path: string
  title: string
  className?: string
  children: ReactNode
}) {
  const [copied, setCopied] = useState(false)

  const share = async () => {
    const url = new URL(path, window.location.origin).toString()
    try {
      if (navigator.share) {
        await navigator.share({ title, url })
        return
      }
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Closing the share sheet rejects; nothing to report
    }
  }

  return (
    <button
      type="button"
      aria-label="مشاركة"
      onClick={share}
      className={`relative ${className ?? ''}`}
    >
      {children}
      {copied && (
        <span
          role="status"
          className="absolute top-full left-1/2 z-20 mt-1.5 -translate-x-1/2 rounded-md bg-ink px-2 py-1 text-xs font-medium whitespace-nowrap text-white"
        >
          تم نسخ الرابط
        </span>
      )}
    </button>
  )
}
