import { jwtVerify } from 'jose'

export const SESSION_COOKIE = 'testing_session'
// Matches the API's testing token lifetime
export const SESSION_MAX_AGE = 12 * 60 * 60

export interface Tester {
  name: string
}

function secretKey(): Uint8Array | null {
  const secret = process.env.TESTING_JWT_SECRET
  return secret && secret.length >= 32 ? new TextEncoder().encode(secret) : null
}

/**
 * Checks the testing token's signature and expiry (the API issued it with
 * the same TESTING_JWT_SECRET). Null for anything invalid, or when the site
 * isn't configured -- every page then stays locked.
 */
export async function verifySessionToken(
  token: string | undefined,
): Promise<Tester | null> {
  const key = secretKey()
  if (!token || !key) return null
  try {
    const { payload } = await jwtVerify(token, key, { algorithms: ['HS256'] })
    if (payload.kind !== 'testing') return null
    return { name: String(payload.name ?? '') }
  } catch {
    return null
  }
}
