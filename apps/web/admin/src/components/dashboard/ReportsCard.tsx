'use client'

import { Card, Button } from '@buyootna/ui'

// Not wired to real data -- no Report model exists in the backend yet, so
// nothing in the app can create a row here. Shows an honest empty state
// instead of fabricated rows until that domain gets built.
export default function ReportsCard() {
  return (
    <Card
      className="bg-white lg:col-span-1 border-[#ECECEC] p-4.25 flex flex-col gap-4 relative select-none"
      data-node-id="2376:5216"
    >
      <div className="flex items-start justify-between w-full pb-2">
        <div className="space-y-1 text-right">
          <h3 className="font-['Cairo'] font-bold text-[16px] text-[#111111] leading-none">
            البلاغات التي تحتاج مراجعة
          </h3>
          <p className="font-['Cairo'] font-medium text-[13px] text-[#6b6a6a] leading-none">
            آخر البلاغات التي لم يتم التعامل معها
          </p>
        </div>
        <Button
          variant="ghost"
          disabled
          className="text-[#15304d] font-['Cairo'] font-bold text-[13px] hover:bg-slate-50 h-7.5 px-3 rounded-xl opacity-50 cursor-not-allowed"
        >
          عرض الكل
        </Button>
      </div>

      <p className="py-6 text-center font-['Cairo'] text-[13px] text-[#6b6a6a]">
        نظام البلاغات غير متاح بعد
      </p>
    </Card>
  )
}
