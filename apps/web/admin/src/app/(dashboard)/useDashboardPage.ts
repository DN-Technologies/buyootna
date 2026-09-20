import { useCallback, useEffect, useState } from 'react'
import {
  fetchAdminDashboard,
  AdminDashboardResponse,
} from '@/lib/admin-dashboard'

export function useDashboardPage() {
  const [data, setData] = useState<AdminDashboardResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadDashboard = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await fetchAdminDashboard()
      setData(res)
    } catch (err: any) {
      console.error('Failed to load dashboard:', err)
      if (err?.response?.status === 404) {
        setError(
          'مسار نقطة النهاية غير موجود (404). يرجى التأكد من تشغيل خادم الخلفية.',
        )
      } else {
        setError('تعذر الاتصال بالخادم. يرجى التأكد من تشغيل خادم الخلفية.')
      }
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadDashboard()
  }, [loadDashboard])

  return { data, loading, error, reload: loadDashboard }
}
