'use client'

import Image from 'next/image'
import { useCallback, useRef, useState } from 'react'

import AccountAction from '@/components/ui/AccountAction'
import ShareButton from '@/components/ui/ShareButton'
import { useDismiss } from '@/lib/useDismiss'

const BUTTON =
  'flex h-10 w-10 items-center justify-center rounded-[10px] border border-line bg-white transition hover:bg-surface'

/** Save, share and the "more" menu beside an ad's title. */
export default function PropertyActions({
  path,
  title,
}: {
  path: string
  title: string
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menu = useRef<HTMLDivElement>(null)
  const closeMenu = useCallback(() => setMenuOpen(false), [])
  useDismiss(menu, menuOpen, closeMenu)

  return (
    <div className="flex shrink-0 items-center gap-2">
      {/* Saving needs an account */}
      <AccountAction
        aria-label="أضف إلى المفضلة"
        className={`${BUTTON} rounded-xl`}
      >
        <Image src="/landing/detail-heart.svg" alt="" width={24} height={24} />
      </AccountAction>
      <ShareButton path={path} title={title} className={BUTTON}>
        <Image src="/landing/detail-share.svg" alt="" width={20} height={20} />
      </ShareButton>
      <div ref={menu} className="relative">
        <button
          type="button"
          aria-label="المزيد"
          aria-haspopup="menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
          className={BUTTON}
        >
          <Image src="/landing/detail-more.svg" alt="" width={24} height={24} />
        </button>
        {menuOpen && (
          <div
            role="menu"
            className="absolute top-full left-0 z-20 mt-2 w-48 rounded-lg bg-white px-2.5 py-3 shadow-[0_4px_6px_rgba(33,37,41,0.2),0_0_1px_rgba(33,37,41,0.32)]"
          >
            {/* Reports are tied to the account that files them */}
            <AccountAction
              role="menuitem"
              onBeforeOpen={closeMenu}
              className="flex h-10 w-full items-center rounded-xl px-3 text-sm font-medium tracking-[-0.408px] text-ink transition hover:bg-surface"
            >
              الإبلاغ عن الإعلان
            </AccountAction>
          </div>
        )}
      </div>
    </div>
  )
}
