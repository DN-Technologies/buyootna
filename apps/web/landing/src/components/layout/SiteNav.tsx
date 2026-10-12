'use client'

import { Menu, MessageSquare, User, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useCallback, useState } from 'react'

import GuestDrawer from '@/components/layout/GuestDrawer'
import {
  ACTIONS,
  ActionsMenu,
  GuestNotifications,
} from '@/components/layout/NavPopovers'
import { LOGIN_PATH } from '@/lib/siteLinks'

const LINKS = [
  { href: '/', label: 'الرئيسية' },
  { href: '/properties', label: 'العقارات' },
  { href: '/companies', label: 'الشركات' },
  { href: '/offices', label: 'المكاتب' },
  // Signed-in area: sends the visitor to sign in for now
  { href: LOGIN_PATH, label: 'نشاطي' },
]

/** The rounded top bar: logo, sections, actions menu and account icons. */
export default function SiteNav() {
  const pathname = usePathname()
  const [menuOpen, setMenuOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const closeDrawer = useCallback(() => setDrawerOpen(false), [])

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname.startsWith(href)

  return (
    <header className="relative z-20 mx-auto w-full max-w-7xl px-5">
      <div className="flex h-16 items-center justify-between rounded-[64px] bg-[rgba(249,251,252,0.6)] px-5 backdrop-blur-[2px] md:h-20 md:px-8">
        <Link href="/" aria-label="بيوتنا - الرئيسية" className="shrink-0">
          <Image
            src="/landing/logo-mark.png"
            alt="بيوتنا"
            width={40}
            height={40}
            priority
          />
        </Link>

        <nav aria-label="الأقسام" className="hidden items-center gap-4 lg:flex">
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={`flex h-11.5 items-center px-3.5 text-base transition hover:text-brand ${
                isActive(link.href)
                  ? 'font-bold text-brand'
                  : 'font-medium text-ink'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <ActionsMenu />
        </nav>

        <div className="flex items-center gap-0.5">
          {/* Not signed in: the account icon opens the guest menu */}
          <button
            type="button"
            aria-label="حسابي"
            aria-haspopup="dialog"
            aria-expanded={drawerOpen}
            onClick={() => setDrawerOpen(true)}
            className="hidden h-10 w-10 items-center justify-center rounded-xl text-ink transition hover:bg-white/70 sm:flex"
          >
            <User className="h-4.5 w-4.5" strokeWidth={1.5} />
          </button>
          <Link
            href={LOGIN_PATH}
            aria-label="المحادثات"
            className="hidden h-10 w-10 items-center justify-center rounded-xl text-ink transition hover:bg-white/70 sm:flex"
          >
            <MessageSquare className="h-4.5 w-4.5" strokeWidth={1.5} />
          </Link>
          <GuestNotifications />
          <button
            type="button"
            aria-label={menuOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((open) => !open)}
            className="flex h-10 w-10 items-center justify-center rounded-xl text-ink lg:hidden"
          >
            {menuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav
          aria-label="القائمة"
          className="absolute inset-x-5 top-full mt-2 flex flex-col rounded-2xl border border-line bg-white p-2 shadow-lg lg:hidden"
        >
          {LINKS.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`rounded-xl px-4 py-3 text-base ${
                isActive(link.href)
                  ? 'bg-tag font-bold text-brand'
                  : 'font-medium text-ink'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="my-1 h-px bg-line" />
          {ACTIONS.map((action) => (
            <Link
              key={action.label}
              href={LOGIN_PATH}
              className="rounded-xl px-4 py-3 text-base font-medium text-ink"
            >
              {action.label}
            </Link>
          ))}
          <Link
            href={LOGIN_PATH}
            className="mt-1 flex h-12 items-center justify-center rounded-full bg-brand text-sm font-bold text-white"
          >
            تسجيل الدخول
          </Link>
        </nav>
      )}

      <GuestDrawer open={drawerOpen} onClose={closeDrawer} />
    </header>
  )
}
