import Image from 'next/image'
import Link from 'next/link'

interface PaginationProps {
  current: number
  totalPages: number
  // Builds the URL of a page, keeping the current filters
  hrefFor: (page: number) => string
}

/** 1 2 3 4 5 … 24: the first five around the current page, then the last. */
function pagesToShow(current: number, totalPages: number): (number | null)[] {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, index) => index + 1)
  }
  const start = Math.max(1, Math.min(current - 2, totalPages - 5))
  const window = Array.from({ length: 5 }, (_, index) => start + index)
  const pages: (number | null)[] = start > 1 ? [1, null] : []
  pages.push(...window.filter((page) => page > 1 || start === 1))
  if (window[4] < totalPages - 1) pages.push(null)
  if (window[4] < totalPages) pages.push(totalPages)
  return pages
}

const twoDigits = (page: number) => String(page).padStart(2, '0')

/** Numbered pages with previous / next arrows, for the listing pages. */
export default function Pagination({
  current,
  totalPages,
  hrefFor,
}: PaginationProps) {
  if (totalPages <= 1) return null

  const cell =
    'flex h-10 w-10 items-center justify-center rounded text-sm font-medium tracking-[-0.408px]'
  const arrow = 'flex h-10 w-10 items-center justify-center rounded-xl'

  return (
    <nav
      aria-label="الصفحات"
      className="flex flex-wrap items-center justify-center gap-x-6 gap-y-3 pt-8"
    >
      {current > 1 ? (
        <Link
          href={hrefFor(current - 1)}
          aria-label="الصفحة السابقة"
          className={`${arrow} border border-[#A0A0A0] bg-white transition hover:bg-tag`}
        >
          <Image src="/landing/page-prev.svg" alt="" width={20} height={20} />
        </Link>
      ) : (
        <span
          aria-hidden
          className={`${arrow} border border-[#A0A0A0] bg-white opacity-40`}
        >
          <Image src="/landing/page-prev.svg" alt="" width={20} height={20} />
        </span>
      )}

      <div className="flex items-center gap-2.5">
        {pagesToShow(current, totalPages).map((page, index) =>
          page === null ? (
            <span
              key={`gap-${index}`}
              className={`${cell} border-[0.5px] border-[#A0A0A0] text-[#363636]`}
            >
              ...
            </span>
          ) : page === current ? (
            <span
              key={page}
              aria-current="page"
              className={`${cell} bg-brand text-white`}
            >
              {twoDigits(page)}
            </span>
          ) : (
            <Link
              key={page}
              href={hrefFor(page)}
              className={`${cell} border-[0.5px] border-[#A0A0A0] text-[#363636] transition hover:bg-tag`}
            >
              {twoDigits(page)}
            </Link>
          ),
        )}
      </div>

      {current < totalPages ? (
        <Link
          href={hrefFor(current + 1)}
          aria-label="الصفحة التالية"
          className={`${arrow} bg-brand transition hover:bg-brand-dark`}
        >
          <Image src="/landing/page-next.svg" alt="" width={20} height={20} />
        </Link>
      ) : (
        <span aria-hidden className={`${arrow} bg-brand opacity-40`}>
          <Image src="/landing/page-next.svg" alt="" width={20} height={20} />
        </span>
      )}
    </nav>
  )
}
