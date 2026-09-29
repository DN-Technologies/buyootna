import type { Localized } from '@/data/types'

export const DOCS_ROLES = [
  'QA',
  'DEVELOPER',
  'UIUX',
  'CLIENT',
  'ADMIN',
] as const
export type DocsRole = (typeof DOCS_ROLES)[number]

export interface DocsUser {
  role: DocsRole
  name: string
}

export const ROLE_LABELS: Record<DocsRole, Localized<string>> = {
  QA: { en: 'QA / Tester', ar: 'ضمان الجودة / مختبر' },
  DEVELOPER: { en: 'Developer', ar: 'مطور' },
  UIUX: { en: 'UI/UX Designer', ar: 'مصمم واجهات' },
  CLIENT: { en: 'Client / Management', ar: 'العميل / الإدارة' },
  ADMIN: { en: 'Admin', ar: 'مسؤول' },
}

// Sections a client doesn't see: internal API detail
const CLIENT_HIDDEN_SECTIONS = new Set(['api'])

/** Whether this role may open a docs section. Checked on the server. */
export function canSeeSection(role: DocsRole, slug: string): boolean {
  return role !== 'CLIENT' || !CLIENT_HIDDEN_SECTIONS.has(slug)
}

/** The Postman collection and its setup guide: everyone but the client. */
export function canSeePostman(role: DocsRole): boolean {
  return role !== 'CLIENT'
}

export function isAdmin(role: DocsRole): boolean {
  return role === 'ADMIN'
}
