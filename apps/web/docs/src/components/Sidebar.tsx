'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import {
  BookOpenCheck,
  Building2,
  Flag,
  KeyRound,
  Languages,
  LayoutDashboard,
  Lock,
  LogOut,
  Send,
  Server,
  Smartphone,
  Store,
  Tag,
  User,
  Warehouse,
  Wrench,
} from 'lucide-react'
import { t } from '@/data/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { chrome } from '@/lib/chrome'
import { ROLE_LABELS, isAdmin, type DocsUser } from '@/lib/access'
import type { NavSection } from '@/lib/nav'
import { trackingText } from '@/lib/tracking'
import { ReleasePicker, type ReleaseOption } from './ReleasePicker'

const ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'mobile-shared': Smartphone,
  'mobile-individual': User,
  'mobile-company': Building2,
  'mobile-office': Lock,
  'web-admin': LayoutDashboard,
  'web-companies': Building2,
  'web-offices': Store,
  'web-management': Warehouse,
  'web-landing': Wrench,
  api: Server,
}

const MOBILE_SLUGS = new Set([
  'mobile-shared',
  'mobile-individual',
  'mobile-company',
  'mobile-office',
])

function NavGroup({
  label,
  items,
  pathname,
  lang,
}: {
  label: string
  items: NavSection[]
  pathname: string
  lang: 'en' | 'ar'
}) {
  return (
    <div className="mt-6 first:mt-0">
      <p className="px-3 text-xs font-semibold uppercase tracking-wider text-[#7C8894]">
        {label}
      </p>
      <nav className="mt-1 flex flex-col gap-1">
        {items.map((section) => {
          const href = `/${section.slug}`
          const isActive = pathname === href
          const Icon = ICONS[section.slug] ?? Server
          return (
            <Link
              key={section.slug}
              href={href}
              className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                isActive
                  ? 'bg-primary text-white'
                  : 'text-[#B9C3CC] hover:bg-primary hover:text-white'
              }`}
            >
              <Icon className="h-4 w-4 flex-none" />
              {t(section.title, lang)}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export function Sidebar({
  sections,
  user,
  showPostman,
  releases,
  currentReleaseId,
}: {
  // Only the sections this role may open (filtered on the server)
  sections: NavSection[]
  user: DocsUser
  showPostman: boolean
  releases: ReleaseOption[]
  currentReleaseId: string | null
}) {
  const pathname = usePathname()
  const router = useRouter()
  const { lang, setLang } = useLanguage()
  const c = chrome[lang]
  const mobileSections = sections.filter((s) => MOBILE_SLUGS.has(s.slug))
  const webSections = sections.filter((s) => !MOBILE_SLUGS.has(s.slug))

  const resources = [
    { href: '/releases', label: trackingText[lang].releasesNav, icon: Flag },
    ...(showPostman
      ? [{ href: '/postman', label: c.navPostman, icon: Send }]
      : []),
    { href: '/versions', label: c.navVersions, icon: Tag },
    ...(isAdmin(user.role)
      ? [
          {
            href: '/admin/passwords',
            label: c.navAdminPasswords,
            icon: KeyRound,
          },
        ]
      : []),
  ]

  const signOut = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.replace('/login')
    router.refresh()
  }

  return (
    <aside className="flex h-full w-64 flex-none flex-col overflow-y-auto border-e border-[#1B2936] bg-primary-dark px-4 py-6">
      <Link href="/" className="flex items-center gap-3 px-2 pb-6">
        <Image
          src="/logo-icon.png"
          alt="Buyootna Logo"
          width={32}
          height={32}
          className="object-contain"
        />
        <div>
          <p className="text-sm font-semibold text-white">{c.appName}</p>
          <p className="text-xs text-[#7C8894]" dir="ltr">
            {c.appTagline}
          </p>
        </div>
      </Link>

      <NavGroup
        label={c.navGroupMobile}
        items={mobileSections}
        pathname={pathname}
        lang={lang}
      />
      <NavGroup
        label={c.navGroupWeb}
        items={webSections}
        pathname={pathname}
        lang={lang}
      />

      <div className="mt-6">
        <p className="px-3 text-xs font-semibold uppercase tracking-wider text-[#7C8894]">
          {c.navGroupResources}
        </p>
        <nav className="mt-1 flex flex-col gap-1">
          {resources.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? 'bg-primary text-white'
                    : 'text-[#B9C3CC] hover:bg-primary hover:text-white'
                }`}
              >
                <Icon className="h-4 w-4 flex-none" />
                {label}
              </Link>
            )
          })}
        </nav>
      </div>

      <div className="mt-auto pt-6">
        <ReleasePicker releases={releases} currentId={currentReleaseId} />
      </div>

      <div className="mt-3">
        <div className="rounded-lg border border-[#1B2936] px-3 py-2">
          <p className="text-[11px] text-[#7C8894]">{c.signedInAs}</p>
          <p className="truncate text-sm font-medium text-white">{user.name}</p>
          <p className="text-xs text-accent">{t(ROLE_LABELS[user.role], lang)}</p>
          <button
            onClick={signOut}
            className="mt-2 flex items-center gap-1.5 text-xs text-[#B9C3CC] transition-colors hover:text-white"
          >
            <LogOut className="h-3.5 w-3.5 flex-none rtl:rotate-180" />
            {c.logout}
          </button>
        </div>
      </div>

      <div className="mt-3 flex items-center gap-2 rounded-lg border border-[#1B2936] p-1">
        <Languages className="ms-1.5 h-4 w-4 flex-none text-[#7C8894]" />
        <div className="flex flex-1 gap-1">
          <button
            onClick={() => setLang('en')}
            className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors ${
              lang === 'en'
                ? 'bg-primary text-white'
                : 'text-[#7C8894] hover:text-white'
            }`}
          >
            EN
          </button>
          <button
            onClick={() => setLang('ar')}
            className={`flex-1 rounded-md py-1.5 text-xs font-semibold transition-colors ${
              lang === 'ar'
                ? 'bg-primary text-white'
                : 'text-[#7C8894] hover:text-white'
            }`}
          >
            عربي
          </button>
        </div>
      </div>
    </aside>
  )
}
