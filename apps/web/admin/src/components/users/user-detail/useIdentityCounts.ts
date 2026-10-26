import { useEffect, useState } from 'react'
import { fetchUserReports } from '@/lib/admin-reports'
import { fetchUserReviewsSummary } from '@/lib/admin-ratings'
import { fetchUserRequests } from '@/lib/admin-requests'

export interface IdentityCounts {
  reportsCount?: number
  ratingAverage?: number
  ratingCount?: number
  requestsCount?: number
}

/**
 * The quick stats' counts for the selected persona, fetched in parallel
 * whatever tab is open; waits until the account has loaded.
 */
export function useIdentityCounts(
  userId: string,
  identityId: string | undefined,
  enabled: boolean,
): IdentityCounts {
  const [counts, setCounts] = useState<IdentityCounts>({})

  useEffect(() => {
    if (!enabled) return
    let cancelled = false
    const merge = (next: IdentityCounts) => {
      if (!cancelled) setCounts((prev) => ({ ...prev, ...next }))
    }
    fetchUserReports(userId, { limit: 1, identityId })
      .then((res) => merge({ reportsCount: res.meta.total }))
      .catch((err) => console.error('Failed to load reports count:', err))
    fetchUserReviewsSummary(userId, identityId)
      .then((res) =>
        merge({
          ratingAverage: res.averageRating,
          ratingCount: res.totalRatingsCount,
        }),
      )
      .catch((err) => console.error('Failed to load ratings summary:', err))
    fetchUserRequests(userId, identityId)
      .then((res) => merge({ requestsCount: res.length }))
      .catch((err) => console.error('Failed to load requests count:', err))
    return () => {
      cancelled = true
    }
  }, [userId, identityId, enabled])

  return counts
}
