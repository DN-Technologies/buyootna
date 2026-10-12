import Link from 'next/link'
import type { ReactNode } from 'react'

import { LOGIN_PATH, SIGNUP_PATH } from '@/lib/siteLinks'

interface GuestPromptProps {
  icon: ReactNode
  title: string
  text: string
}

/**
 * What a signed-in area (chats, favourites, activity) shows a visitor:
 * what it is for, and the way in.
 */
export default function GuestPrompt({ icon, title, text }: GuestPromptProps) {
  return (
    <div className="mx-auto flex min-h-120 w-full max-w-7xl items-center justify-center px-5 py-16">
      <div className="flex w-full max-w-83.75 flex-col items-center gap-6 text-center">
        <div className="flex flex-col items-center gap-3">
          {icon}
          <div className="flex flex-col gap-2">
            <h2 className="text-lg font-bold text-ink">{title}</h2>
            <p className="text-base leading-normal font-medium tracking-[0.32px] text-muted">
              {text}
            </p>
          </div>
        </div>
        <div className="flex w-full gap-2">
          <Link
            href={SIGNUP_PATH}
            className="flex h-12 flex-1 items-center justify-center rounded-3xl bg-brand text-sm font-bold text-white transition hover:bg-brand-dark"
          >
            انشاء حساب
          </Link>
          <Link
            href={LOGIN_PATH}
            className="flex h-12 flex-1 items-center justify-center rounded-3xl border border-brand text-sm font-bold text-brand transition hover:bg-surface"
          >
            تسجيل دخول
          </Link>
        </div>
      </div>
    </div>
  )
}
