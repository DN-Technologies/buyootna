'use client'

import type { ReactNode } from 'react'

import { openAccountTypePicker } from '@/lib/accountTypePicker'

/** A "create account" button: asks which kind of account before the form. */
export default function SignupLink({
  className,
  onBeforeOpen,
  children,
}: {
  className?: string
  // Runs first, e.g. to close the menu the button sits in
  onBeforeOpen?: () => void
  children: ReactNode
}) {
  return (
    <button
      type="button"
      className={className}
      onClick={() => {
        onBeforeOpen?.()
        openAccountTypePicker()
      }}
    >
      {children}
    </button>
  )
}
