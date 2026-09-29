import { jwtVerify } from 'jose'
import { DOCS_ROLES, type DocsRole, type DocsUser } from './access'

export const SESSION_COOKIE = 'docs_session'
// Matches the API's docs token lifetime
export const SESSION_MAX_AGE = 12 * 60 * 60

function secretKey(): Uint8Array | null {
  const secret = process.env.DOCS_JWT_SECRET
  return secret && secret.length >= 32 ? new TextEncoder().encode(secret) : null
}

/**
 * Checks the docs token's signature and expiry (the API issued it with the
 * same DOCS_JWT_SECRET). Null for anything invalid, or when the site isn't
 * configured -- every page then stays locked.
 */
export async function verifySessionToken(
  token: string | undefined,
): Promise<DocsUser | null> {
  const key = secretKey()
  if (!token || !key) return null
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] })
    const role = payload.role as DocsRole
    if (payload.kind !== 'docs' || !DOCS_ROLES.includes(role)) return null
    return { role, name: String(payload.name ?? '') }
  } catch {
    return null
  }
}
