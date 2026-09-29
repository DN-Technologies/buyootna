'use client'

import { useRouter } from 'next/navigation'
import { Flag } from 'lucide-react'
import { useLanguage } from '@/contexts/LanguageContext'
import { RELEASE_COOKIE, trackingText } from '@/lib/tracking'

export interface ReleaseOption {
  id: string
  name: string
  status: 'OPEN' | 'CLOSED'
}

/** Which release the story pages show results for (remembered per browser). */
export function ReleasePicker({
  releases,
  currentId,
}: {
  releases: ReleaseOption[]
  currentId: string | null
}) {
  const router = useRouter()
  const { lang } = useLanguage()
  const tx = trackingText[lang]

  return (
    <label className="block rounded-lg border border-[#1B2936] px-3 py-2">
      <span className="flex items-center gap-1.5 text-[11px] text-[#7C8894]">
        <Flag className="h-3.5 w-3.5" />
        {tx.releasePicker}
      </span>
      {releases.length === 0 ? (
        <span className="text-sm text-[#B9C3CC]">{tx.noRelease}</span>
      ) : (
        <select
          value={currentId ?? ''}
          onChange={(e) => {
            document.cookie = `${RELEASE_COOKIE}=${encodeURIComponent(e.target.value)}; path=/; max-age=${60 * 60 * 24 * 90}; samesite=lax`
            router.refresh()
          }}
          className="mt-1 w-full bg-transparent text-sm text-white outline-none"
        >
          {releases.map((r) => (
            <option key={r.id} value={r.id} className="bg-primary">
              {r.name}
              {r.status === 'CLOSED' ? ` (${tx.closed})` : ''}
            </option>
          ))}
        </select>
      )}
    </label>
  )
}
