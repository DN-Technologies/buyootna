'use client'

import Link from 'next/link'

import { openAccountTypePicker } from '@/lib/accountTypePicker'
import { LOGIN_PATH } from '@/lib/siteLinks'

const TAB =
  'flex h-[46px] flex-1 flex-col items-center justify-between pt-[11px]'

function Label({ active, children }: { active: boolean; children: string }) {
  return (
    <>
      <span
        className={`px-2.5 text-base leading-[1.3] ${
          active ? 'font-bold text-brand' : 'font-medium text-muted'
        }`}
      >
        {children}
      </span>
      <span
        className={`h-0.5 w-full rounded-t-md ${active ? 'bg-brand' : 'bg-transparent'}`}
      />
    </>
  )
}

/**
 * تسجيل الدخول / تسجيل جديد. Opening sign-up from here asks which kind of
 * account first.
 */
export default function AuthTabs({ active }: { active: 'login' | 'signup' }) {
  return (
    <div className="flex h-11.5 w-full items-baseline gap-2.5 border-b border-[#D7D7D7]">
      {active === 'login' ? (
        <span aria-current="page" className={TAB}>
          <Label active>تسجيل الدخول</Label>
        </span>
      ) : (
        <Link href={LOGIN_PATH} className={TAB}>
          <Label active={false}>تسجيل الدخول</Label>
        </Link>
      )}
      {active === 'signup' ? (
        <span aria-current="page" className={TAB}>
          <Label active>تسجيل جديد</Label>
        </span>
      ) : (
        <button type="button" onClick={openAccountTypePicker} className={TAB}>
          <Label active={false}>تسجيل جديد</Label>
        </button>
      )}
    </div>
  )
}
