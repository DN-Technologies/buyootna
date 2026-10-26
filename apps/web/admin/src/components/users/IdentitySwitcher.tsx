'use client'

import type { AdminUserIdentity } from '@/lib/admin-users'

export const IDENTITY_TYPE_LABELS: Record<AdminUserIdentity['type'], string> = {
  INDIVIDUAL: 'فرد',
  COMPANY: 'شركة',
  OFFICE: 'مكتب عقاري',
}

interface IdentitySwitcherProps {
  identities: AdminUserIdentity[]
  selectedId?: string
  onSelect: (identityId: string) => void
}

/**
 * One account can be فرد + شركة + مكتب: picks the persona the page shows.
 * Hidden when the account has a single identity.
 */
export default function IdentitySwitcher({
  identities,
  selectedId,
  onSelect,
}: IdentitySwitcherProps) {
  if (identities.length < 2) return null

  return (
    <div
      role="tablist"
      aria-label="هويات الحساب"
      className="flex items-center gap-1 bg-[#F8FAFC] border border-[#ECECEC] p-1 rounded-xl w-fit"
    >
      {identities.map((identity) => {
        const active = identity.id === selectedId
        const data =
          identity.companyData ?? identity.officeData ?? identity.individualData
        const pending = data?.status === 'PENDING'
        return (
          <button
            key={identity.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => !active && onSelect(identity.id)}
            title={data?.name || undefined}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-bold transition-all cursor-pointer ${
              active
                ? 'bg-primary text-white shadow-xs'
                : 'text-[#6B6A6A] hover:text-[#111111]'
            }`}
          >
            <span>{IDENTITY_TYPE_LABELS[identity.type]}</span>
            {data?.name && (
              <span className={`font-medium ${active ? 'text-white/80' : 'text-[#A0A0A0]'}`}>
                {data.name}
              </span>
            )}
            {pending && (
              <span
                className="w-1.5 h-1.5 rounded-full bg-[#F79009]"
                aria-label="بانتظار التوثيق"
              />
            )}
          </button>
        )
      })}
    </div>
  )
}
