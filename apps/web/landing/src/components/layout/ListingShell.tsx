import type { ReactNode } from 'react'

import SiteNav from '@/components/layout/SiteNav'

interface ListingShellProps {
  title: string
  // e.g. "4,066 إعلان"
  countLabel?: string
  children: ReactNode
}

/** The frame of a listing page: the nav, a title with the result count, the list. */
export default function ListingShell({
  title,
  countLabel,
  children,
}: ListingShellProps) {
  return (
    <div className="bg-[#F9F9F9] pt-6 md:pt-8">
      <SiteNav />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 py-10 md:py-14">
        <div className="flex items-baseline justify-between gap-4">
          <h1 className="text-[26px] font-bold tracking-[-0.52px] text-ink md:text-[32px]">
            {title}
          </h1>
          {countLabel && (
            <p className="text-sm font-medium text-muted">{countLabel}</p>
          )}
        </div>
        {children}
      </div>
    </div>
  )
}

/** Shown in place of the grid when a search matches nothing. */
export function EmptyResults({ message }: { message: string }) {
  return (
    <p className="rounded-lg border border-line bg-white py-20 text-center text-base font-medium text-muted">
      {message}
    </p>
  )
}
