'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useRef, useState } from 'react'

import { SORTS, type SortId, type ViewId } from '@/lib/propertySorts'
import { hrefWith } from '@/lib/searchParams'
import { useDismiss } from '@/lib/useDismiss'

interface PropertiesToolbarProps {
  // The applied filters, carried into every link here
  filters: Record<string, string | undefined>
  sort: SortId
  view: ViewId
}

/** Above the results: how they are ordered and whether as cards or rows. */
export default function PropertiesToolbar({
  filters,
  sort,
  view,
}: PropertiesToolbarProps) {
  const [sortOpen, setSortOpen] = useState(false)
  const sortMenu = useRef<HTMLDivElement>(null)
  const closeSort = useCallback(() => setSortOpen(false), [])
  useDismiss(sortMenu, sortOpen, closeSort)

  // Defaults stay out of the URL
  const href = (next: { sort?: SortId; view?: ViewId }) => {
    const nextSort = next.sort ?? sort
    const nextView = next.view ?? view
    return hrefWith('/properties', {
      ...filters,
      sort: nextSort === 'DEFAULT' ? undefined : nextSort,
      view: nextView === 'cards' ? undefined : nextView,
    })
  }

  const viewTab = (id: ViewId, label: string, icon: string) => {
    const active = view === id
    return (
      <Link
        href={href({ view: id })}
        scroll={false}
        aria-current={active ? 'true' : undefined}
        className={`flex h-8 items-center gap-1.5 rounded-[64px] pr-2.5 pl-3 text-[15px] font-semibold tracking-[0.3px] ${
          active ? 'bg-brand text-white' : 'text-ink'
        }`}
      >
        <Image
          src={icon}
          alt=""
          width={20}
          height={20}
          // Each icon ships in one colour; tint it for the other state
          className={active ? 'brightness-0 invert' : 'brightness-0'}
        />
        {label}
      </Link>
    )
  }

  return (
    <div className="flex items-center justify-between gap-3">
      <div ref={sortMenu} className="relative">
        <button
          type="button"
          aria-haspopup="menu"
          aria-expanded={sortOpen}
          onClick={() => setSortOpen((value) => !value)}
          className="flex h-10.5 items-center gap-1.5 rounded-3xl border border-line bg-white px-4 text-[13px] font-medium tracking-[-0.408px] text-ink"
        >
          <Image
            src="/landing/toolbar-sort.svg"
            alt=""
            width={18}
            height={18}
          />
          {sort === 'DEFAULT'
            ? 'الترتيب حسب'
            : SORTS.find((option) => option.id === sort)?.label}
        </button>
        {sortOpen && (
          <div
            role="menu"
            className="absolute top-full right-0 z-20 mt-2 flex w-50.75 flex-col gap-0.5 rounded-lg bg-white px-2.5 py-3 shadow-[0_4px_6px_rgba(33,37,41,0.2),0_0_1px_rgba(33,37,41,0.32)]"
          >
            {SORTS.map((option) => (
              <Link
                key={option.id}
                role="menuitemradio"
                aria-checked={option.id === sort}
                href={href({ sort: option.id })}
                scroll={false}
                onClick={closeSort}
                className={`flex h-10 items-center rounded-xl px-3 text-sm tracking-[-0.408px] whitespace-nowrap text-ink ${
                  option.id === sort
                    ? 'bg-surface font-bold'
                    : 'font-medium hover:bg-surface'
                }`}
              >
                {option.label}
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className="flex h-10.5 items-center gap-0.5 rounded-4xl border border-[#E2E8F0] bg-white p-1">
        {viewTab('cards', 'صورة', '/landing/view-cards.svg')}
        {viewTab('list', 'قائمة', '/landing/view-list.svg')}
      </div>
    </div>
  )
}
