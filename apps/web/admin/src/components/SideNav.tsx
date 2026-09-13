'use client'

import { Suspense } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import {
  LayoutGrid,
  User,
  Building2,
  Store,
  CreditCard,
  Tag,
  Bell,
  Scale,
  Shield,
  Settings,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import Image from 'next/image'

interface NavItem {
  title: string
  href: string
  icon: React.ComponentType<any>
}

interface NavGroup {
  label: string
  items: NavItem[]
}

const navGroups: NavGroup[] = [
  {
    label: 'نظرة عامة',
    items: [{ title: 'لوحة التحكم', href: '/', icon: LayoutGrid }],
  },
  {
    label: 'إدارة الحسابات',
    items: [
      { title: 'الأفراد', href: '/users?type=individual', icon: User },
      { title: 'الشركات', href: '/users?type=company', icon: Building2 },
      { title: 'المكاتب العقارية', href: '/users?type=office', icon: Store },
    ],
  },
  {
    label: 'المالية',
    items: [
      { title: 'الاشتراكات والفواتير', href: '/billing', icon: CreditCard },
      { title: 'الباقات والأسعار', href: '/plans', icon: Tag },
    ],
  },
  {
    label: 'ادارة المنصة',
    items: [
      { title: 'الاشعارات', href: '/notifications', icon: Bell },
      { title: 'الصفقات والمزادات', href: '/deals', icon: Scale },
      { title: 'الأدوار والصلاحيات', href: '/roles', icon: Shield },
    ],
  },
  {
    label: 'النظام',
    items: [{ title: 'الإعدادت', href: '/settings', icon: Settings }],
  },
]

function SideNavContent() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentType = searchParams?.get('type')

  const isItemActive = (href: string) => {
    const [targetPath, queryString] = href.split('?')
    const targetParams = new URLSearchParams(queryString || '')
    const targetType = targetParams.get('type')

    if (targetPath === '/') {
      return pathname === '/'
    }

    if (targetType) {
      return (
        pathname.startsWith(targetPath) &&
        (currentType === targetType ||
          (!currentType && targetType === 'individual'))
      )
    }

    return pathname === targetPath || pathname.startsWith(`${targetPath}/`)
  }

  return (
    <div
      className="w-64 bg-white border-l border-[#ECECEC] flex flex-col h-full relative select-none"
      dir="rtl"
    >
      {/* Brand Header */}
      <div className="h-17.5 border-b border-[#ECECEC] flex items-center justify-center px-6 shrink-0">
        <Link href="/" className="flex items-center justify-center">
          <Image
            src="/logo.png"
            alt="Buyootna Logo"
            width={138}
            height={34}
            className="h-8.5 w-34.5 object-contain"
            priority
          />
        </Link>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto px-4 pt-4 pb-6 space-y-4">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-1.5">
            {/* Group Label */}
            <div className="px-3 py-1 text-right">
              <span className="font-['Cairo'] font-medium text-[12px] text-[#6B6A6A]">
                {group.label}
              </span>
            </div>

            {/* Group Items */}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = isItemActive(item.href)
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center justify-start gap-2.5 h-10.5 px-3 rounded-xl transition-colors duration-150 text-right w-full',
                      isActive
                        ? 'bg-primary text-white font-bold'
                        : 'bg-white text-[#111111] hover:bg-[#F8F9FA] font-medium',
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-4.5 h-4.5 shrink-0',
                        isActive ? 'text-white' : 'text-[#111111]',
                      )}
                    />
                    <span
                      className={cn(
                        "font-['Cairo'] text-[14px] leading-normal tracking-[-0.408px]",
                        isActive
                          ? 'font-bold text-white'
                          : 'font-medium text-[#111111]',
                      )}
                    >
                      {item.title}
                    </span>
                  </Link>
                )
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Empty Spacer */}
      <div className="flex-1 min-h-2" />
    </div>
  )
}

export default function SideNav() {
  return (
    <Suspense
      fallback={
        <div
          className="w-64 bg-white border-l border-[#ECECEC] flex flex-col h-full"
          dir="rtl"
        >
          <div className="h-17.5 border-b border-[#ECECEC] flex items-center justify-center px-6 shrink-0" />
        </div>
      }
    >
      <SideNavContent />
    </Suspense>
  )
}
