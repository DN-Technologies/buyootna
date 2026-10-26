import 'server-only'
import { cache } from 'react'
import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { apiFetch } from './api'
import { SESSION_COOKIE, Tester, verifySessionToken } from './session-token'

export async function getSessionToken(): Promise<string | undefined> {
  return (await cookies()).get(SESSION_COOKIE)?.value
}

/**
 * The signed-in tester. The token is checked locally and then with the
 * API, which also refuses tokens from before the password was changed.
 * Fails closed: if the API can't confirm, the tester is signed out.
 */
export const getSession = cache(async (): Promise<Tester | null> => {
  const token = await getSessionToken()
  const tester = await verifySessionToken(token)
  if (!tester) return null
  try {
    const res = await apiFetch('/testing-portal/auth/me', { token })
    return res.ok ? tester : null
  } catch {
    return null
  }
})

export async function requireSession(): Promise<Tester> {
  const tester = await getSession()
  if (!tester) redirect('/login')
  return tester
}
