export type RawSearchParams = Record<string, string | string[] | undefined>

/** The first value of a query parameter, or undefined. */
export function param(
  params: RawSearchParams,
  key: string,
): string | undefined {
  const value = params[key]
  return (Array.isArray(value) ? value[0] : value) || undefined
}

/** A page number from the URL: at least 1, garbage becomes 1. */
export function pageParam(params: RawSearchParams): number {
  const page = Number.parseInt(param(params, 'page') ?? '1', 10)
  return Number.isFinite(page) && page > 0 ? page : 1
}

/** The current path with these filters, for pagination links. */
export function hrefWith(
  path: string,
  filters: Record<string, string | number | undefined>,
): string {
  const query = new URLSearchParams()
  for (const [key, value] of Object.entries(filters)) {
    if (value !== undefined && value !== '') query.set(key, String(value))
  }
  const text = query.toString()
  return text ? `${path}?${text}` : path
}

/** A comma-separated query parameter as a list ("a,b" → ["a", "b"]). */
export function listParam(params: RawSearchParams, key: string): string[] {
  return (param(params, key) ?? '')
    .split(',')
    .map((part) => part.trim())
    .filter(Boolean)
}
