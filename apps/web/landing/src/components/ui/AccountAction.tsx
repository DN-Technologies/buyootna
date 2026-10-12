'use client'

import { useRouter } from 'next/navigation'
import type { ReactNode } from 'react'

import { openAuthPrompt } from '@/lib/authPrompt'
import { useSession } from '@/lib/session'

interface AccountActionProps {
  className?: string
  'aria-label'?: string
  role?: string
  // Where the action leads once signed in; without it the sign-in dialog
  // is all there is on the web so far
  href?: string
  // Runs first, e.g. to close the menu the action sits in
  onBeforeOpen?: () => void
  children: ReactNode
}

/**
 * Something only an account can do (save an ad, start a chat, post an ad).
 * A visitor gets the sign-in dialog; an account goes on to `href`.
 */
export default function AccountAction({
  href,
  onBeforeOpen,
  children,
  ...rest
}: AccountActionProps) {
  const router = useRouter()
  const { signedIn } = useSession()

  return (
    <button
      type="button"
      onClick={() => {
        onBeforeOpen?.()
        if (signedIn && href) router.push(href)
        else openAuthPrompt()
      }}
      {...rest}
    >
      {children}
    </button>
  )
}
