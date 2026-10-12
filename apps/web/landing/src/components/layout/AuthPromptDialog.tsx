'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useEffect, useSyncExternalStore } from 'react'

import {
  closeAuthPrompt,
  isAuthPromptOpen,
  subscribeAuthPrompt,
} from '@/lib/authPrompt'
import SignupLink from '@/components/auth/SignupLink'
import { LOGIN_PATH } from '@/lib/siteLinks'

/** "سجل حسابك للمتابعة": shown when a visitor tries something that needs an account. */
export default function AuthPromptDialog() {
  const open = useSyncExternalStore(
    subscribeAuthPrompt,
    isAuthPromptOpen,
    () => false,
  )

  useEffect(() => {
    if (!open) return
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') closeAuthPrompt()
    }
    document.addEventListener('keydown', onKeyDown)
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = overflow
    }
  }, [open])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center p-5">
      <button
        type="button"
        aria-label="إغلاق"
        onClick={closeAuthPrompt}
        className="absolute inset-0 cursor-default bg-black/40"
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="auth-prompt-title"
        className="relative w-full max-w-100 rounded-2xl bg-white p-6 shadow-[0_20px_24px_-4px_rgba(0,0,0,0.1),0_8px_8px_-4px_rgba(0,0,0,0.04)]"
      >
        <div className="flex items-center justify-between">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#FFEBEB]">
            <Image
              src="/landing/modal-warning.svg"
              alt=""
              width={28}
              height={28}
            />
          </span>
          <button
            type="button"
            aria-label="إغلاق"
            onClick={closeAuthPrompt}
            className="rounded-lg p-2.5"
          >
            <Image
              src="/landing/modal-close.svg"
              alt=""
              width={24}
              height={24}
            />
          </button>
        </div>

        <h2
          id="auth-prompt-title"
          className="mt-4 text-lg leading-[1.2] font-bold text-ink"
        >
          سجل حسابك للمتابعة
        </h2>
        <p className="mt-3 text-[15px] leading-normal font-medium tracking-[-0.408px] text-muted">
          سجل حسابك لنشر الاعلانات، وحفظ العقارات، واضافة التنبيهات، والتواصل
          بسهولة وحفظ المحادثات.
        </p>

        <div className="mt-8 flex gap-3">
          <SignupLink
            onBeforeOpen={closeAuthPrompt}
            className="flex h-12 flex-1 items-center justify-center rounded-3xl border border-brand bg-brand text-sm font-semibold tracking-[0.28px] text-white transition hover:bg-brand-dark"
          >
            إنشاء حساب
          </SignupLink>
          <Link
            href={LOGIN_PATH}
            onClick={closeAuthPrompt}
            className="flex h-12 flex-1 items-center justify-center rounded-3xl border border-brand text-sm font-semibold tracking-[0.28px] text-brand transition hover:bg-surface"
          >
            تسجيل دخول
          </Link>
        </div>
      </div>
    </div>
  )
}
