'use client'

import { Info, ScrollText, type LucideIcon } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useEffect } from 'react'

import { LOGIN_PATH, SIGNUP_PATH } from '@/lib/siteLinks'

interface DrawerLink {
  label: string
  href: string
  // A file under /landing, or a drawn icon where the design file exports none
  icon: string | LucideIcon
}

const SECTIONS: { title: string; links: DrawerLink[] }[] = [
  {
    title: 'النشاط',
    links: [
      {
        label: 'المحفوظات',
        href: '/favorites',
        icon: '/landing/drawer-heart.svg',
      },
    ],
  },
  {
    title: 'الدعم والمساعدة',
    links: [
      { label: 'عن بيوتنا', href: '/about', icon: Info },
      {
        label: 'تواصل معنا',
        href: '/contact',
        icon: '/landing/drawer-phone.svg',
      },
    ],
  },
  {
    title: 'السياسات',
    links: [
      {
        label: 'سياسة الخصوصية',
        href: '/privacy',
        icon: '/landing/drawer-shield.svg',
      },
      { label: 'الشروط والأحكام', href: '/terms', icon: ScrollText },
    ],
  },
]

/**
 * The side menu a visitor who isn't signed in gets from the account icon:
 * an invitation to create an account, then help and policy links.
 */
export default function GuestDrawer({
  open,
  onClose,
}: {
  open: boolean
  onClose: () => void
}) {
  // Escape closes it, and the page behind doesn't scroll while it is open
  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
    }
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="إغلاق القائمة"
        onClick={onClose}
        className="absolute inset-0 cursor-default"
      />
      <aside
        role="dialog"
        aria-modal="true"
        aria-label="القائمة"
        className="absolute inset-y-0 left-0 flex w-89.25 max-w-full flex-col gap-2 overflow-y-auto bg-white p-5 shadow-[0_0_24px_rgba(33,37,41,0.16)]"
      >
        <div className="flex pb-1.5">
          <button type="button" aria-label="إغلاق" onClick={onClose}>
            <Image
              src="/landing/drawer-close.svg"
              alt=""
              width={32}
              height={32}
            />
          </button>
        </div>

        <div className="relative h-47.75 w-full shrink-0 rounded-lg border-t-40 border-brand bg-white px-2.75 pt-10.75 pb-3 shadow-[0_0_1.4px_rgba(61,61,61,0.25)]">
          <Image
            src="/landing/guest-avatar.jpg"
            alt=""
            width={60}
            height={60}
            className="absolute -top-6.75 right-2.5 rounded-t-lg rounded-bl-lg object-cover"
          />
          <p className="text-base font-semibold text-ink">مرحبا بك !</p>
          <p className="mt-1 text-sm font-medium tracking-[-0.408px] text-[#A0A0A0]">
            أنشئ حسابك للوصول إلى جميع المميزات
          </p>
          <Link
            href={SIGNUP_PATH}
            className="mt-3 flex h-10 items-center text-sm font-bold text-brand"
          >
            إنشاء حساب
          </Link>
        </div>

        <div className="flex flex-col gap-5 pt-5">
          {SECTIONS.map((section) => (
            <section key={section.title}>
              <h2 className="px-1 text-sm leading-none font-semibold tracking-[0.28px] text-muted">
                {section.title}
              </h2>
              <div className="flex flex-col gap-0.5 py-2">
                {section.links.map((link) => (
                  <Link
                    key={link.label}
                    href={link.href}
                    onClick={onClose}
                    className="flex h-10 items-center justify-between rounded-lg px-3 py-2 transition hover:bg-surface"
                  >
                    <span className="flex items-center gap-2">
                      <span className="flex h-5 w-5 items-center justify-center">
                        {typeof link.icon === 'string' ? (
                          <Image
                            src={link.icon}
                            alt=""
                            width={18}
                            height={18}
                          />
                        ) : (
                          <link.icon
                            className="h-4.5 w-4.5"
                            strokeWidth={1.25}
                          />
                        )}
                      </span>
                      <span className="text-[15px] font-medium tracking-[-0.408px] whitespace-nowrap text-ink">
                        {link.label}
                      </span>
                    </span>
                    <Image
                      src="/landing/drawer-chevron.svg"
                      alt=""
                      width={12}
                      height={12}
                      className="-scale-y-100"
                    />
                  </Link>
                ))}
              </div>
            </section>
          ))}

          <Link
            href={LOGIN_PATH}
            className="flex h-10 w-full items-center justify-center rounded-[20px] border border-brand bg-white px-4.5 text-sm font-bold text-brand transition hover:bg-surface"
          >
            تسجيل الدخول
          </Link>
        </div>
      </aside>
    </div>
  )
}
