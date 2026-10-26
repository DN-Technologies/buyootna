import { useCallback, useEffect, useState } from 'react'
import { AdminUserDetail, fetchUserDetails } from '@/lib/admin-users'

/** The account and all its identities; `reload` refreshes it quietly. */
export function useUserDetail(userId: string) {
  const [user, setUser] = useState<AdminUserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(
    async (opts: { showSpinner?: boolean } = {}) => {
      try {
        if (opts.showSpinner) setLoading(true)
        setError(null)
        setUser(await fetchUserDetails(userId))
      } catch (err) {
        console.error('Failed to load user details:', err)
        setError('تعذر تحميل بيانات المستخدم.')
      } finally {
        if (opts.showSpinner) setLoading(false)
      }
    },
    [userId],
  )

  useEffect(() => {
    load({ showSpinner: true })
  }, [load])

  const reload = useCallback(() => {
    load()
  }, [load])

  return { user, loading, error, reload }
}
