'use client'

import type { AdminServiceRow } from '@/lib/admin-services'

function formatDate(iso: string) {
  return new Intl.DateTimeFormat('ar', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    calendar: 'gregory',
    numberingSystem: 'latn',
  }).format(new Date(iso))
}

/** One service of a company or office, as it is on the profile. */
export default function UserServiceCard({
  service,
  showDate = true,
}: {
  service: AdminServiceRow
  // An office's typed list has no date of its own
  showDate?: boolean
}) {
  return (
    <div
      className="bg-white border border-[#ECECEC] rounded-lg p-5 flex flex-col gap-3 font-['Cairo'] text-right shadow-2xs"
      dir="rtl"
    >
      <div className="flex items-center gap-2 flex-wrap">
        <h4 className="font-bold text-[18px] text-[#111111] leading-tight">
          {service.name}
        </h4>
        {service.isHidden ? (
          <span className="px-2.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B] text-[12px] font-medium">
            مخفية
          </span>
        ) : (
          <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#047857] text-[12px] font-medium">
            ظاهرة
          </span>
        )}
      </div>
      {service.description && (
        <p className="text-[13px] text-[#6B6A6A] leading-relaxed line-clamp-3">
          {service.description}
        </p>
      )}
      {(service.specialty || showDate) && (
        <div className="flex items-center gap-3 text-[12px] text-[#6B6A6A] flex-wrap">
          {service.specialty && <span>التخصص: {service.specialty}</span>}
          {showDate && <span>أضيفت في {formatDate(service.createdAt)}</span>}
        </div>
      )}
    </div>
  )
}
