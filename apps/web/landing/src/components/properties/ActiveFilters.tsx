import { X } from 'lucide-react'
import Link from 'next/link'

export interface FilterChip {
  label: string
  // The same results without this filter
  href: string
}

/**
 * The filters in effect, each removable on its own, with "مسح الكل" and the
 * number of ads they leave. Renders nothing when no filter is applied.
 */
export default function ActiveFilters({
  chips,
  clearHref,
  countLabel,
}: {
  chips: FilterChip[]
  clearHref: string
  countLabel?: string
}) {
  if (chips.length === 0) return null

  return (
    <div className="flex items-start justify-between gap-4">
      <div className="flex min-w-0 flex-wrap items-center gap-3">
        {chips.map((chip) => (
          <Link
            key={chip.href}
            href={chip.href}
            scroll={false}
            aria-label={`إزالة ${chip.label}`}
            className="flex h-7.5 items-center gap-1.5 rounded-2xl border border-line bg-surface px-3 text-sm font-medium tracking-[-0.408px] text-ink transition hover:border-brand"
          >
            {chip.label}
            <X className="h-3.5 w-3.5" strokeWidth={1.5} />
          </Link>
        ))}
        <Link
          href={clearHref}
          scroll={false}
          className="flex h-8 items-center px-3 text-sm font-bold text-brand"
        >
          مسح الكل
        </Link>
      </div>
      {countLabel && (
        <p className="flex h-8 shrink-0 items-center text-sm font-medium text-muted">
          {countLabel}
        </p>
      )}
    </div>
  )
}
