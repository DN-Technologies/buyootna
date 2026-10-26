'use client'

import type { WorkingHourItem } from '@/lib/working-hours'

/** مواعيد العمل as the profile shows them, one chip per group of days. */
export default function WorkingHoursChips({
  items,
}: {
  items?: WorkingHourItem[] | null
}) {
  if (!items?.length) {
    return <p className="text-[14px] font-medium text-[#111111]">—</p>
  }
  return (
    <div className="flex items-center gap-2 flex-wrap">
      {items.map((item) => (
        <span
          key={item.days}
          className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[12px] font-medium bg-slate-50 text-[#111111]"
        >
          <span
            className={`size-1.5 rounded-full ${item.isOpen ? 'bg-[#018B1B]' : 'bg-[#9C1E28]'}`}
          />
          {item.days}: {item.hours}
        </span>
      ))}
    </div>
  )
}
