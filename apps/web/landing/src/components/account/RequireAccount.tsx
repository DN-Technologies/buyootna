'use client'

import Link from 'next/link'
import type { ReactNode } from 'react'

import SignupLink from '@/components/auth/SignupLink'
import { useSession } from '@/lib/session'
import { LOGIN_PATH } from '@/lib/siteLinks'

/**
 * Wraps a page only an account can use. A visitor is told so, with the
 * way in; nothing shows until the browser has said who is signed in.
 */
export default function RequireAccount({
  children,
  text,
}: {
  children: ReactNode
  // What signing in is for, e.g. "سجل حسابك لنشر إعلانك"
  text: string
}) {
  const { signedIn } = useSession()

  if (signedIn === undefined) return <div className="min-h-120" />
  if (signedIn) return <>{children}</>

  return (
    <div className="mx-auto flex min-h-105 w-full max-w-83.75 flex-col items-center justify-center gap-6 px-5 pb-24 text-center">
      <p className="text-base leading-normal font-medium text-muted">{text}</p>
      <div className="flex w-full gap-2">
        <SignupLink className="flex h-12 flex-1 items-center justify-center rounded-3xl bg-brand text-sm font-bold text-white transition hover:bg-brand-dark">
          انشاء حساب
        </SignupLink>
        <Link
          href={LOGIN_PATH}
          className="flex h-12 flex-1 items-center justify-center rounded-3xl border border-brand text-sm font-bold text-brand transition hover:bg-surface"
        >
          تسجيل دخول
        </Link>
      </div>
    </div>
  )
}
