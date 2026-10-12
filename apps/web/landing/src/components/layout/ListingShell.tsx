import type { ReactNode } from 'react'

import PageHeader from '@/components/layout/PageHeader'

interface ListingShellProps {
  title: string
  // e.g. "502 شركة"
  countLabel?: string
  children: ReactNode
}

/** The frame of a listing page: the page header, the result count, the list. */
export default function ListingShell({
  title,
  countLabel,
  children,
}: ListingShellProps) {
  return (
    <>
      <PageHeader title={title} />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-8 px-5 pb-24">
        {countLabel && (
          <p className="text-sm font-medium text-muted">{countLabel}</p>
        )}
        {children}
      </div>
    </>
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
