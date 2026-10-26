'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Activity, Gauge, KeyRound, ScrollText, Menu } from 'lucide-react'

const TABS = [
  { href: '/', label: 'الحالة', icon: Activity },
  { href: '/otps', label: 'الرموز', icon: KeyRound },
  { href: '/metrics', label: 'المقاييس', icon: Gauge },
  { href: '/logs', label: 'السجلات', icon: ScrollText },
  { href: '/more', label: 'المزيد', icon: Menu },
]

/** The phone's bottom navigation, above the home indicator. */
export default function TabBar() {
  const pathname = usePathname()
  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-[#0a1118]/95 backdrop-blur"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-xl">
        {TABS.map(({ href, label, icon: Icon }) => {
          const active =
            href === '/' ? pathname === '/' : pathname.startsWith(href)
          return (
            <li key={href} className="flex-1">
              <Link
                href={href}
                className={`flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold ${
                  active ? 'text-accent' : 'text-muted'
                }`}
              >
                <Icon className="h-5 w-5" />
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
