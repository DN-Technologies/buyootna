'use client'

import { Ticket, Gift } from 'lucide-react'

// Static placeholder: computing a real "X / Y" ad-credit figure requires
// aggregating UserPlanSlot.adsRemaining across the user's identities plus
// Plan.maxActiveAds — not wired into the admin API yet. Matches the same
// placeholder policy used for the overview tab's quick-stats row.
export default function UserAdsCreditCard() {
  return (
    <div
      className="bg-white border border-[#ECECEC] rounded-lg flex flex-col gap-3.5 p-4 w-full font-['Cairo']"
      dir="rtl"
    >
      <p className="text-[14px] font-medium text-[#6B6A6A] w-full text-right">
        الفرد يحصل على إعلان <span className="text-[#111111]">واحد مجاني</span>{' '}
        ثم يحتاج لشراء باقة إعلانات
      </p>
      <div className="flex items-center gap-3 w-full">
        <div className="flex-1 flex items-center gap-3 bg-[rgba(241,245,249,0.5)] border border-[#ECECEC] rounded-md p-3.5">
          <div className="flex flex-col gap-0.5 text-[13px]">
            <p className="font-medium text-[#6B6A6A]">الإعلان المجاني</p>
            <p className="font-bold text-[#111111]">مستخدم</p>
          </div>
          <div className="bg-[#F1F5F9] rounded-full flex items-center justify-center shrink-0 size-8.5">
            <Gift className="w-4 h-4 text-[#6B6A6A]" />
          </div>
        </div>
        <div className="flex-1 flex items-center gap-3 bg-[rgba(173,70,255,0.05)] border border-[#ECECEC] rounded-md p-3.5">
          <div className="flex flex-col gap-0.5 text-[13px]">
            <p className="font-medium text-[#6B6A6A]">7 / 10</p>
            <p className="font-bold text-[#111111]">رصيد الاعلانات</p>
          </div>
          <div className="bg-[rgba(173,70,255,0.1)] rounded-full flex items-center justify-center shrink-0 size-8.5">
            <Ticket className="w-4 h-4 text-[#AD46FF]" />
          </div>
        </div>
      </div>
    </div>
  )
}
