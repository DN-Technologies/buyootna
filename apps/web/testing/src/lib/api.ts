import 'server-only'

// Server-side only: the browser never talks to the API directly, so the
// testing token stays in the httpOnly cookie
const API_URL = process.env.API_URL ?? 'http://localhost:8000'

export async function apiFetch(
  path: string,
  init: RequestInit & { token?: string; clientIp?: string } = {},
): Promise<Response> {
  const { token, clientIp, headers, ...rest } = init
  return fetch(`${API_URL}${path}`, {
    ...rest,
    cache: 'no-store',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      // The API rate-limits sign-ins per client IP
      ...(clientIp ? { 'X-Forwarded-For': clientIp } : {}),
      ...headers,
    },
  })
}
