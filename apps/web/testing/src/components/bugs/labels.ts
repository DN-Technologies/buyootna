export type BugStatus = 'NEW' | 'IN_PROGRESS' | 'RESOLVED' | 'NOT_A_BUG'
export type BugSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface Bug {
  id: string
  title: string
  area: string
  severity: BugSeverity
  status: BugStatus
  steps: string
  expected: string | null
  actual: string | null
  platform: string | null
  device: string | null
  appVersion: string | null
  screenshots: string[]
  reporterName: string
  createdAt: string
  updatedAt: string
  commentsCount?: number
  comments?: {
    id: string
    authorName: string
    body: string
    createdAt: string
  }[]
}

export const STATUS: Record<BugStatus, { label: string; style: string }> = {
  NEW: { label: 'جديد', style: 'bg-warn/15 text-warn' },
  IN_PROGRESS: { label: 'قيد العمل', style: 'bg-accent/15 text-accent' },
  RESOLVED: { label: 'تم الحل', style: 'bg-ok/15 text-ok' },
  NOT_A_BUG: { label: 'ليس خطأ', style: 'bg-line text-muted' },
}

export const SEVERITY: Record<BugSeverity, { label: string; style: string }> = {
  LOW: { label: 'منخفضة', style: 'text-muted' },
  MEDIUM: { label: 'متوسطة', style: 'text-white' },
  HIGH: { label: 'عالية', style: 'text-warn' },
  CRITICAL: { label: 'حرجة', style: 'text-down' },
}

export const AREAS: { value: string; label: string }[] = [
  { value: 'app', label: 'التطبيق' },
  { value: 'admin', label: 'لوحة الإدارة' },
  { value: 'companies', label: 'بوابة الشركات' },
  { value: 'offices', label: 'بوابة المكاتب' },
  { value: 'management', label: 'بوابة الإدارة العقارية' },
  { value: 'landing', label: 'الموقع' },
  { value: 'api', label: 'الخادم (API)' },
  { value: 'other', label: 'أخرى' },
]

export const areaLabel = (value: string) =>
  AREAS.find((a) => a.value === value)?.label ?? value

export function timeAgo(iso: string) {
  const minutes = Math.floor((Date.now() - new Date(iso).getTime()) / 60_000)
  if (minutes < 1) return 'الآن'
  if (minutes < 60) return `قبل ${minutes} د`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `قبل ${hours} س`
  return new Date(iso).toLocaleDateString('ar', {
    day: 'numeric',
    month: 'short',
    numberingSystem: 'latn',
  })
}
