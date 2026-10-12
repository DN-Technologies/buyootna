'use client'

import { useSyncExternalStore } from 'react'

import { identityName, SESSION_EVENT, type Identity } from '@/lib/auth'

function subscribe(listener: () => void) {
  window.addEventListener(SESSION_EVENT, listener)
  // Signing in or out in another tab
  window.addEventListener('storage', listener)
  return () => {
    window.removeEventListener(SESSION_EVENT, listener)
    window.removeEventListener('storage', listener)
  }
}

const read = (key: string) =>
  localStorage.getItem(key) ?? sessionStorage.getItem(key)

// A string, so the snapshot stays equal between renders
const snapshot = () => (read('token') ? (read('activeIdentity') ?? '{}') : '')

export interface CurrentSession {
  // undefined until the browser has been asked (the server can't know)
  signedIn: boolean | undefined
  name: string
  type?: Identity['type']
}

/** Who is signed in on this browser, kept current across sign-in and sign-out. */
export function useSession(): CurrentSession {
  const raw = useSyncExternalStore(subscribe, snapshot, () => null)
  if (raw === null) return { signedIn: undefined, name: '' }
  if (!raw) return { signedIn: false, name: '' }
  try {
    const identity = JSON.parse(raw) as Identity
    return { signedIn: true, name: identityName(identity), type: identity.type }
  } catch {
    return { signedIn: true, name: '' }
  }
}
