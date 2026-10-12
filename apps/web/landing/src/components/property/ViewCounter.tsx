'use client'

import { useEffect } from 'react'

import { api } from '@/lib/api'

/** Counts one view of the ad per browser tab. */
export default function ViewCounter({ id }: { id: string }) {
  useEffect(() => {
    const key = `viewed:${id}`
    try {
      if (sessionStorage.getItem(key)) return
      sessionStorage.setItem(key, '1')
    } catch {
      // Storage blocked: count anyway
    }
    api.patch(`/properties/${id}/view`).catch(() => {})
  }, [id])

  return null
}
