import { api } from '@/lib/api'

// --- What the API returns on a successful sign-in ---

export interface Identity {
  id: string
  type: 'INDIVIDUAL' | 'COMPANY' | 'OFFICE'
  individualData?: { name: string | null } | null
  companyData?: { name: string } | null
  officeData?: { name: string } | null
}

export interface Session {
  access_token: string
  user: { id: string; email: string | null; phone: string | null }
  activeIdentity: Identity
  identities: Identity[]
}

const KEYS = ['token', 'user', 'activeIdentity', 'identities'] as const

/**
 * Keeps the session for later requests. With `remember` it survives closing
 * the browser; without it, it ends with the tab.
 */
export function saveSession(session: Session, remember = true) {
  clearSession()
  const store = remember ? localStorage : sessionStorage
  store.setItem('token', session.access_token)
  store.setItem('user', JSON.stringify(session.user))
  store.setItem('activeIdentity', JSON.stringify(session.activeIdentity))
  store.setItem('identities', JSON.stringify(session.identities ?? []))
}

export function clearSession() {
  for (const key of KEYS) {
    localStorage.removeItem(key)
    sessionStorage.removeItem(key)
  }
}

/** The profiles of the account last remembered on this browser, if any. */
export function savedProfiles(): {
  user: Session['user']
  activeIdentityId?: string
  identities: Identity[]
} | null {
  try {
    if (!localStorage.getItem('token')) return null
    const identities = JSON.parse(localStorage.getItem('identities') ?? '[]')
    if (!Array.isArray(identities) || identities.length === 0) return null
    return {
      user: JSON.parse(localStorage.getItem('user') ?? '{}'),
      activeIdentityId: JSON.parse(
        localStorage.getItem('activeIdentity') ?? 'null',
      )?.id,
      identities,
    }
  } catch {
    return null
  }
}

export const identityName = (identity: Identity) =>
  identity.companyData?.name ||
  identity.officeData?.name ||
  identity.individualData?.name ||
  ''

// --- Identifiers ---

export const isEmail = (value: string) =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
// The same Kuwaiti mobile rule the API applies
export const isPhone = (value: string) => /^(?:\+?965)?[569]\d{7}$/.test(value)
export const cleanIdentifier = (value: string) =>
  value.trim().replace(/\s+/g, '')

/** Where a code went, partly hidden: "+965 •••• 4821" or "a•••@mail.com". */
export function maskIdentifier(identifier: string): string {
  if (isEmail(identifier)) {
    const [name, domain] = identifier.split('@')
    return `${name.slice(0, 1)}•••@${domain}`
  }
  return `+965 •••• ${identifier.slice(-4)}`
}

// --- Errors ---

interface ApiError {
  response?: {
    data?: { message?: string | string[]; code?: string; retryAfter?: number }
  }
}

/** The API's own Arabic message when it sent one, else the fallback. */
export function errorMessage(error: unknown, fallback: string): string {
  const message = (error as ApiError)?.response?.data?.message
  if (Array.isArray(message)) return message[0] ?? fallback
  return message || fallback
}

/** Seconds to wait before asking for another code, when the API says so. */
export const retryAfterOf = (error: unknown) =>
  (error as ApiError)?.response?.data?.retryAfter

// --- Sign in ---

export async function login(
  identifier: string,
  password: string,
  remember: boolean,
) {
  const { data } = await api.post<Session>('/auth/login', {
    identifier: cleanIdentifier(identifier),
    password,
  })
  saveSession(data, remember)
}

/** Continue as another profile of the remembered account. */
export async function switchIdentity(identityId: string) {
  const { data } = await api.post<Session>('/auth/identity/switch', {
    identityId,
  })
  saveSession(data, true)
}

// --- Individual sign-up: register, then confirm the code ---

export interface IndividualSignup {
  name: string
  identifier: string
  password: string
}

/** Also what "resend the code" calls: registering again sends a fresh one. */
export async function registerIndividual(form: IndividualSignup) {
  await api.post('/users/register/individual', {
    name: form.name.trim(),
    identifier: cleanIdentifier(form.identifier),
    password: form.password,
  })
}

export async function verifySignupCode(
  identifier: string,
  otp: string,
  remember: boolean,
) {
  const { data } = isEmail(identifier)
    ? await api.post<Session>('/auth/register/verify-email-otp', {
        email: identifier,
        otp,
      })
    : await api.post<Session>('/auth/register/verify-otp', {
        phone: identifier,
        otp,
      })
  saveSession(data, remember)
}

// --- Company / office sign-up ---

export interface BusinessSignup {
  name: string
  email: string
  phone: string
  password: string
  services: string
  hqLocation: string
  // Companies only
  serviceAreas: string
  about: string
  licenseActivity: string
  licenseNumber: string
  licenseExpiry: string
  logo: File | null
  license: File | null
}

/** Registers the company or office with its files, then signs it in. */
export async function registerBusiness(
  kind: 'company' | 'office',
  form: BusinessSignup,
) {
  const body = new FormData()
  body.append('name', form.name.trim())
  body.append('email', form.email.trim())
  if (form.phone) body.append('phone', cleanIdentifier(form.phone))
  body.append('password', form.password)
  if (form.services) body.append('services', form.services.trim())
  if (form.hqLocation) body.append('hqLocation', form.hqLocation.trim())
  if (kind === 'company' && form.serviceAreas) {
    body.append('serviceAreas', form.serviceAreas)
  }
  if (form.about) body.append('about', form.about.trim())
  if (form.licenseActivity)
    body.append('licenseActivity', form.licenseActivity.trim())
  body.append('licenseNumber', form.licenseNumber.trim())
  if (form.licenseExpiry) body.append('licenseExpiry', form.licenseExpiry)
  if (form.logo) body.append('logo', form.logo)
  if (form.license) body.append('license', form.license)

  await api.post(`/users/register/${kind}`, body, {
    headers: { 'Content-Type': 'multipart/form-data' },
  })
  await login(form.email, form.password, true)
}

// --- Forgotten password: code, then a new password ---

export async function requestPasswordCode(identifier: string) {
  await api.post('/auth/recovery/request-otp', {
    identifier: cleanIdentifier(identifier),
  })
}

/** Resolves with the short-lived token the new password is saved with. */
export async function verifyPasswordCode(identifier: string, otp: string) {
  const { data } = await api.post<{ resetToken: string }>(
    '/auth/recovery/verify-otp',
    { identifier: cleanIdentifier(identifier), otp },
  )
  return data.resetToken
}

export async function resetPassword(resetToken: string, newPassword: string) {
  await api.post('/auth/recovery/reset-password', { resetToken, newPassword })
}
