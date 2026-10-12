'use client'

import { Bell, ChevronDown } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useCallback, useRef, useState } from 'react'

import AccountAction from '@/components/ui/AccountAction'
import { LOGIN_PATH } from '@/lib/siteLinks'
import { useDismiss } from '@/lib/useDismiss'

const PANEL_SHADOW =
  'shadow-[0_8px_24px_rgba(33,37,41,0.16),0_0_1px_rgba(33,37,41,0.2)]'

// "اجراءات": the things an account can do; a visitor gets the sign-in dialog
export const ACTIONS = [
  {
    label: 'اضافة اعلان',
    icon: '/landing/action-add.svg',
    width: 18.67,
    height: 18.67,
  },
  {
    label: 'اضافة تنبيه',
    icon: '/landing/action-alert.svg',
    width: 15.81,
    height: 16.1,
  },
  {
    label: 'طلب عرض سعر',
    icon: '/landing/action-quote.svg',
    width: 14.58,
    height: 16.1,
  },
]

/** The "اجراءات" entry of the nav and the menu it opens. */
export function ActionsMenu() {
  const [open, setOpen] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(container, open, close)

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={() => setOpen((value) => !value)}
        className="flex h-11.5 items-center gap-2 px-3.5 text-base font-medium text-ink transition hover:text-brand"
      >
        اجراءات
        <ChevronDown
          className={`h-4 w-4 transition ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <div
          role="menu"
          className={`absolute top-full right-0 z-30 mt-1 flex flex-col gap-1.5 rounded-md bg-white px-2.5 py-3 ${PANEL_SHADOW}`}
        >
          {ACTIONS.map((action) => (
            <AccountAction
              key={action.label}
              role="menuitem"
              onBeforeOpen={close}
              className="flex h-10 w-43 items-center gap-2 rounded-xl px-2 text-sm font-medium whitespace-nowrap text-ink transition hover:bg-surface"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-tag">
                <Image
                  src={action.icon}
                  alt=""
                  width={action.width}
                  height={action.height}
                />
              </span>
              {action.label}
            </AccountAction>
          ))}
        </div>
      )}
    </div>
  )
}

/**
 * The bell. A visitor who isn't signed in has no notifications, so it opens
 * an invitation to sign in instead of a list.
 */
export function GuestNotifications() {
  const [open, setOpen] = useState(false)
  const container = useRef<HTMLDivElement>(null)
  const close = useCallback(() => setOpen(false), [])
  useDismiss(container, open, close)

  return (
    <div ref={container} className="relative hidden sm:block">
      <button
        type="button"
        aria-label="الإشعارات"
        aria-expanded={open}
        aria-haspopup="dialog"
        onClick={() => setOpen((value) => !value)}
        className="flex h-10 w-10 items-center justify-center rounded-xl text-ink transition hover:bg-white/70"
      >
        <Bell className="h-4.5 w-4.5" strokeWidth={1.5} />
      </button>
      {open && (
        <div
          role="dialog"
          aria-label="الاشعارات"
          className={`absolute top-full left-0 z-30 mt-2 w-90.25 max-w-[calc(100vw-40px)] rounded-lg bg-white ${PANEL_SHADOW}`}
        >
          <h2 className="border-b border-[#ECEEEF] px-6 py-4 text-base font-bold text-ink">
            الاشعارات
          </h2>
          <div className="flex flex-col items-center px-6 pt-8 pb-10 text-center">
            <div className="relative flex flex-col items-center gap-1">
              <Image
                src="/landing/bell-large.svg"
                alt=""
                width={39.1}
                height={41.1}
              />
              <Image
                src="/landing/bell-shadow.svg"
                alt=""
                width={39.9}
                height={3.12}
              />
              <span className="absolute -top-0.5 left-0 flex h-3 w-3 items-center justify-center rounded-full bg-[#9C1E28] text-[8px] leading-none font-bold text-white">
                0
              </span>
            </div>
            <p className="mt-5 text-base font-bold text-ink">
              ابقَ على اطلاع دائم
            </p>
            <p className="mt-2 text-sm font-medium text-muted">
              سجل حسابك لاستقبال إشعارات العقارات الجديدة والرسائل والتنبيهات
              المهمة.
            </p>
            <Link
              href={LOGIN_PATH}
              className="mt-4 flex h-10 w-full max-w-66.25 items-center justify-center rounded-[20px] bg-brand text-sm font-bold text-white transition hover:bg-brand-dark"
            >
              تسجيل دخول
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
