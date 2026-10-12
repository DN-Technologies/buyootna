'use client'

import type { ReactNode } from 'react'

import { openAuthPrompt } from '@/lib/authPrompt'

interface AccountActionProps {
  className?: string
  'aria-label'?: string
  role?: string
  // Runs first, e.g. to close the menu the action sits in
  onBeforeOpen?: () => void
  children: ReactNode
}

/**
 * Something only an account can do (save an ad, start a chat, post an ad).
 * For a visitor it opens the sign-in dialog instead.
 */
export default function AccountAction({
  onBeforeOpen,
  children,
  ...rest
}: AccountActionProps) {
  return (
    <button
      type="button"
      onClick={() => {
        onBeforeOpen?.()
        openAuthPrompt()
      }}
      {...rest}
    >
      {children}
    </button>
  )
}
