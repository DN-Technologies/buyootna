'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutGrid,
  Users,
  CreditCard,
  Tag,
  Bell,
  FileText,
  ShieldAlert,
  Settings,
  History,
  Building2,
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
    items: [{ title: 'المستخدمون', href: '/users', icon: Users }],
  },
  {
    label: 'المالية',
    items: [
      { title: 'الاشتراكات والفواتير', href: '/billing', icon: CreditCard },
      { title: 'الباقات والأسعار', href: '/plans', icon: Tag },
    ],
  },
  {
    label: 'إدارة المنصة',
    items: [
      { title: 'الإشعارات', href: '/notifications', icon: Bell },
      { title: 'إدارة المحتوى', href: '/content', icon: FileText },
      { title: 'الأدوار والصلاحيات', href: '/roles', icon: ShieldAlert },
    ],
  },
  {
    label: 'النظام',
    items: [
      { title: 'الإعدادات', href: '/settings', icon: Settings },
      { title: 'السجل', href: '/logs', icon: History },
    ],
  },
]

export default function SideNav() {
  const pathname = usePathname()

  return (
    <div
      className="w-64 bg-white border-l border-[#ECECEC] flex flex-col h-full relative"
      dir="rtl"
    >
      {/* Brand Header */}
      <div className="h-[70px] border-b border-[#ECECEC] flex items-center justify-between px-6 shrink-0">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="Logo" width={50} height={50} />
          <span className="font-['Cairo'] font-bold text-[20px] text-primary">
            بيوتنا
          </span>
        </div>
      </div>

      {/* Navigation Groups */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {navGroups.map((group) => (
          <div key={group.label} className="space-y-2">
            {/* Group Label */}
            <div className="px-3 text-right">
              <span className="font-['Cairo'] font-medium text-[12px] text-[#6B6A6A]">
                {group.label}
              </span>
            </div>
            {/* Group Items */}
            <div className="space-y-1">
              {group.items.map((item) => {
                const isActive = pathname === item.href
                const Icon = item.icon

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      'flex items-center justify-start gap-3 h-[42px] px-3 rounded-xl transition duration-150 text-right w-full',
                      isActive
                        ? 'bg-primtext-primary text-white font-bold'
                        : 'bg-white text-[#111111] hover:bg-[#F8F9FA] hover:text-primary font-medium',
                    )}
                  >
                    <Icon
                      className={cn(
                        'w-[18px] h-[18px]',
                        isActive ? 'text-white' : 'text-[#6B6A6A]',
                      )}
                    />
                    <span className="font-['Cairo'] text-[14px] leading-normal tracking-[-0.408px]">
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
      <div className="p-4 border-t border-[#ECECEC] text-center text-xs text-[#6B6A6A]/50">
        لوحة التحكم الإدارية v1.0
      </div>
    </div>
  )
}
