import { NextResponse, type NextRequest } from 'next/server'
import { apiFetch } from '@/lib/api'
import { getSessionToken } from '@/lib/session'

type Context = { params: Promise<{ path: string[] }> }

/**
 * Forwards the browser's calls to the API's /testing-portal routes with
 * the token from the httpOnly cookie. Each path segment is encoded, so a
 * call can't reach anything outside /testing-portal.
 */
async function forward(request: NextRequest, { params }: Context) {
  const { path } = await params
  const target =
    '/testing-portal/' +
    path.map(encodeURIComponent).join('/') +
    request.nextUrl.search

  const isRead = request.method === 'GET'
  const contentType = request.headers.get('content-type') ?? ''
  const clientIp =
    request.headers.get('x-real-ip') ??
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
  let res: Response
  try {
    res = await apiFetch(target, {
      method: request.method,
      token: await getSessionToken(),
      clientIp,
      ...(isRead
        ? {}
        : {
            body: Buffer.from(await request.arrayBuffer()),
            headers: { 'Content-Type': contentType || 'application/json' },
          }),
    })
  } catch {
    return NextResponse.json(
      { message: 'تعذر الاتصال بالخادم' },
      { status: 503 },
    )
  }

  const data: unknown = await res.json().catch(() => ({}))
  return NextResponse.json(data, { status: res.status })
}

export const GET = forward
export const POST = forward
export const PATCH = forward
export const PUT = forward
export const DELETE = forward
