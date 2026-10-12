'use client'

import Image from 'next/image'
import { useRef, type ReactNode } from 'react'

interface CarouselProps {
  children: ReactNode
  // Accessible name of the list, e.g. "احدث العقارات"
  label: string
}

/**
 * A row of cards that scrolls sideways (swipe, trackpad or the two arrows
 * under it). The page is right-to-left, so "next" moves the row leftwards.
 */
export default function Carousel({ children, label }: CarouselProps) {
  const track = useRef<HTMLDivElement>(null)

  const scroll = (direction: 'next' | 'previous') => {
    const element = track.current
    if (!element) return
    const distance = element.clientWidth * 0.9
    element.scrollBy({
      left: direction === 'next' ? -distance : distance,
      behavior: 'smooth',
    })
  }

  return (
    <div className="flex flex-col gap-5">
      <div
        ref={track}
        role="list"
        aria-label={label}
        className="no-scrollbar flex snap-x snap-mandatory gap-5 overflow-x-auto pb-1"
      >
        {children}
      </div>
      {/* Laid out left-to-right so the pair sits as in the design */}
      <div dir="ltr" className="flex items-center gap-2">
        <button
          type="button"
          aria-label="التالي"
          onClick={() => scroll('next')}
          className="transition hover:opacity-85"
        >
          <Image src="/landing/arrow-next.svg" alt="" width={51} height={30} />
        </button>
        <button
          type="button"
          aria-label="السابق"
          onClick={() => scroll('previous')}
          className="transition hover:opacity-85"
        >
          <Image src="/landing/arrow-prev.svg" alt="" width={51} height={30} />
        </button>
      </div>
    </div>
  )
}

/** One card's slot in a Carousel; `className` sets how many fit per row. */
export function CarouselItem({
  children,
  className = '',
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div role="listitem" className={`shrink-0 snap-start ${className}`}>
      {children}
    </div>
  )
}
