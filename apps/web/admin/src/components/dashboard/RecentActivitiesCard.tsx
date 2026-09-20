'use client'

import { Card, Button } from '@buyootna/ui'

// Not wired to real data -- no activity/audit-log model exists in the
// backend yet, so nothing in the app records a row here. Shows an honest
// empty state instead of fabricated rows until that domain gets built.
export default function RecentActivitiesCard() {
  return (
    <Card
      className="bg-white lg:col-span-2  border-[#ECECEC] py-5 select-none relative overflow-hidden"
      data-node-id="2376:5896"
    >
      <div className="flex items-start justify-between w-full px-6 pb-4">
        <div className="space-y-1 text-right">
          <h3 className="font-['Cairo'] font-bold text-[16px] text-[#111111] leading-none">
            اخر الانشطة
          </h3>
          <p className="font-['Cairo'] font-medium text-[13px] text-[#6b6a6a] leading-none">
            احدث الانشطة والاجراءات
          </p>
        </div>
        <Button
          variant="ghost"
          disabled
          className="text-[#15304d] font-['Cairo'] font-bold text-[13px] hover:bg-slate-50 h-7.5 px-3 rounded-xl opacity-50 cursor-not-allowed"
        >
          عرض سجل الأنشطة
        </Button>
      </div>

      <p className="px-6 py-6 text-center font-['Cairo'] text-[13px] text-[#6b6a6a] border-t border-[#ECECEC]">
        سجل الأنشطة غير متاح بعد
      </p>
    </Card>
  )
}
