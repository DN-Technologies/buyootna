/** 150000 → "150,000" */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US').format(value)
}

const UNITS: [number, string, string, string][] = [
  // seconds in unit, singular, dual, plural (3-10)
  [60 * 60 * 24 * 365, 'سنة', 'سنتين', 'سنوات'],
  [60 * 60 * 24 * 30, 'شهر', 'شهرين', 'أشهر'],
  [60 * 60 * 24, 'يوم', 'يومين', 'أيام'],
  [60 * 60, 'ساعة', 'ساعتين', 'ساعات'],
  [60, 'دقيقة', 'دقيقتين', 'دقائق'],
]

/** "منذ ساعتين", "منذ 5 أيام"; "الآن" under a minute. */
export function timeAgo(iso: string, now = new Date()): string {
  const seconds = Math.max(
    0,
    Math.floor((now.getTime() - new Date(iso).getTime()) / 1000),
  )
  for (const [size, one, two, few] of UNITS) {
    const count = Math.floor(seconds / size)
    if (count < 1) continue
    if (count === 1) return `منذ ${one}`
    if (count === 2) return `منذ ${two}`
    if (count <= 10) return `منذ ${count} ${few}`
    return `منذ ${count} ${one}`
  }
  return 'الآن'
}

/** A company's services: "تشطيب • تصميم داخلي" → ["تشطيب", "تصميم داخلي"]. */
export function splitServices(category: string): string[] {
  return category
    .split('•')
    .map((part) => part.trim())
    .filter(Boolean)
}
