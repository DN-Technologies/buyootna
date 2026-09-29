'use client'

import { AlertTriangle } from 'lucide-react'
import { appVersions } from '@/data/versions'
import { t } from '@/data/types'
import { useLanguage } from '@/contexts/LanguageContext'
import { chrome } from '@/lib/chrome'

export default function VersionsPage() {
  const { lang } = useLanguage()
  const c = chrome[lang]

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">{c.versionsTitle}</h1>
        <p className="mt-2 max-w-2xl text-[#B9C3CC]">{c.versionsDescription}</p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-[#1B2936]">
        <table className="w-full text-start text-sm">
          <thead className="bg-primary text-xs uppercase tracking-wider text-[#7C8894]">
            <tr>
              <th className="px-4 py-3 text-start">{c.versionsColApp}</th>
              <th className="px-4 py-3 text-start">{c.versionsColVersion}</th>
              <th className="px-4 py-3 text-start">{c.versionsColPlatform}</th>
              <th className="px-4 py-3 text-start">{c.versionsColNotes}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1B2936]">
            {appVersions.map((app) => (
              <tr key={app.packageName} className="align-top">
                <td className="px-4 py-3">
                  <div className="font-medium text-white">
                    {t(app.name, lang)}
                  </div>
                  <div dir="ltr" className="text-xs text-[#7C8894]">
                    {app.packageName}
                  </div>
                </td>
                <td dir="ltr" className="px-4 py-3 font-mono text-accent-light">
                  {app.version}
                </td>
                <td className="px-4 py-3 text-[#B9C3CC]">
                  {t(app.platform, lang)}
                </td>
                <td className="px-4 py-3 text-[#B9C3CC]">
                  {t(app.notes, lang)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex gap-3 rounded-2xl border border-dashed border-[#5A4A26] bg-[#3A2E14]/30 p-5">
        <AlertTriangle className="h-5 w-5 flex-none text-[#E0B96B]" />
        <p className="text-sm text-[#DCE1E6]">
          <span className="font-semibold text-white">
            {c.versionsWarningTitle}
          </span>{' '}
          {c.versionsWarningBody}
        </p>
      </div>
    </div>
  )
}
