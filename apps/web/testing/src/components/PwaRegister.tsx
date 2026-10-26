'use client'

import { useEffect } from 'react'

/** Registers the service worker (installable app + offline page). */
export default function PwaRegister() {
  useEffect(() => {
    if (!('serviceWorker' in navigator)) return
    navigator.serviceWorker
      .register('/sw.js', { scope: '/', updateViaCache: 'none' })
      .catch(() => {
        // Not fatal: the site works the same without it
      })
  }, [])
  return null
}
