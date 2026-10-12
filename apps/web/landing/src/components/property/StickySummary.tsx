'use client'

import { useEffect, useRef, useState, type ReactNode } from 'react'

/**
 * Keeps an ad's summary in reach: once the title block has scrolled away,
 * a compact copy slides in at the top of the window.
 */
export default function StickySummary({
  children,
  summary,
}: {
  // The title block, in the page
  children: ReactNode
  // Its compact copy for the bar
  summary: ReactNode
}) {
  const block = useRef<HTMLDivElement>(null)
  const [stuck, setStuck] = useState(false)

  useEffect(() => {
    const element = block.current
    if (!element) return
    const observer = new IntersectionObserver(
      ([entry]) =>
        // Only once it has left through the top, not before it is reached
        setStuck(!entry.isIntersecting && entry.boundingClientRect.top < 0),
      { threshold: 0 },
    )
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  return (
    <>
      <div ref={block}>{children}</div>
      <div
        aria-hidden={!stuck}
        inert={!stuck}
        className={`fixed inset-x-0 top-0 z-40 border-b border-line bg-white/95 backdrop-blur-sm transition duration-200 ${
          stuck ? 'translate-y-0 opacity-100' : '-translate-y-full opacity-0'
        }`}
      >
        <div className="mx-auto w-full max-w-7xl px-5 py-4">{summary}</div>
      </div>
    </>
  )
}
