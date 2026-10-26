import { NextResponse, type NextRequest } from 'next/server'
import { SESSION_COOKIE, verifySessionToken } from '@/lib/session-token'

// The PWA's files must load signed out (install, offline page, worker updates)
const PUBLIC_PATHS = new Set([
  '/login',
  '/api/auth/login',
  '/manifest.webmanifest',
  '/sw.js',
  '/offline.html',
])

/**
 * First line only: sends anyone without a valid session to /login. Pages
 * and route handlers check the session again on the server.
 */
export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  if (PUBLIC_PATHS.has(pathname)) return NextResponse.next()

  const tester = await verifySessionToken(
    request.cookies.get(SESSION_COOKIE)?.value,
  )
  if (!tester) {
    if (pathname.startsWith('/api/')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }
    return NextResponse.redirect(new URL('/login', request.url))
  }
  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon\\.ico|favicon\\.png|apple-touch-icon\\.png|icon-[^/]*\\.png|logo[^/]*\\.png).*)',
  ],
}
