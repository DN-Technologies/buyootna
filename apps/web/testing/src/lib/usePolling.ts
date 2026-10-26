'use client'

import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * GETs /api/t/<path> now and every `intervalMs` while the page is visible
 * (a phone in a pocket doesn't poll). A 401 sends the tester to /login.
 */
export function usePolling<T>(path: string | null, intervalMs = 10_000) {
  const [data, setData] = useState<T | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null)
  const pathRef = useRef(path)
  pathRef.current = path

  const load = useCallback(async () => {
    const current = pathRef.current
    if (!current) return
    try {
      const res = await fetch(`/api/t/${current}`, { cache: 'no-store' })
      if (res.status === 401) {
        window.location.href = '/login'
        return
      }
      const body = await res.json()
      if (!res.ok) {
        setError(
          typeof body?.message === 'string' ? body.message : 'تعذر التحميل',
        )
        return
      }
      if (pathRef.current === current) {
        setData(body as T)
        setError(null)
        setUpdatedAt(new Date())
      }
    } catch {
      setError('تعذر الاتصال')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    setLoading(true)
    load()
    if (!intervalMs) return
    const tick = () => {
      if (document.visibilityState === 'visible') load()
    }
    const timer = setInterval(tick, intervalMs)
    document.addEventListener('visibilitychange', tick)
    return () => {
      clearInterval(timer)
      document.removeEventListener('visibilitychange', tick)
    }
  }, [path, intervalMs, load])

  return { data, error, loading, updatedAt, reload: load }
}
