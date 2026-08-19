'use client'

import Link from 'next/link'
import Image from 'next/image'
import { usePathname } from 'next/navigation'
import {
  BookOpenCheck,
  Building2,
  Languages,
  LayoutDashboard,
  Lock,
  Send,
  Server,
  Smartphone,
  Store,
  Tag,
  User,
  Warehouse,
  Wrench,
} from 'lucide-react'
import { sections } from '@/data/sections'
import { DocSection, t } from '@/data/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { chrome } from '@/lib/chrome'

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
  items: DocSection[]
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

export function Sidebar() {
  const pathname = usePathname()
  const { lang, setLang } = useLanguage()
  const c = chrome[lang]
  const mobileSections = sections.filter((s) => MOBILE_SLUGS.has(s.slug))
  const webSections = sections.filter((s) => !MOBILE_SLUGS.has(s.slug))

  const resources = [
    { href: '/postman', label: c.navPostman, icon: Send },
    { href: '/versions', label: c.navVersions, icon: Tag },
  ]

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

      <div className="mt-6 flex items-center gap-2 rounded-lg border border-[#1B2936] p-1">
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
