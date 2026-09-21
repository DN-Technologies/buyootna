'use client'

import { Card, Button } from '@buyootna/ui'

interface ActivityItem {
  id: string
  text: string
  timeAgo: string
}

const ACTIVITIES_DATA: ActivityItem[] = [
  {
    id: '1',
    text: 'قام المشرف ايمن بتوثيق مكتب "أطلس الهندسي".',
    timeAgo: 'منذ ساعتين',
  },
  {
    id: '2',
    text: 'تم استلام بلاغ جديد لخدمة التشطيب.',
    timeAgo: 'منذ ساعتين',
  },
  {
    id: '3',
    text: 'تم الاتشراك في باقة سنوية جديدة من مكتب المستقبل للعقارات.',
    timeAgo: 'منذ ساعتين',
  },
  {
    id: '4',
    text: 'قام المشرف ايمن بتوثيق مكتب "أطلس الهندسي".',
    timeAgo: 'منذ ساعتين',
  },
]

export default function RecentActivitiesCard() {
  return (
    <Card
      className="bg-white lg:col-span-2 border-[#ECECEC] py-5 select-none relative overflow-hidden"
      data-node-id="2734:152755"
    >
      <div className="flex items-start justify-between w-full px-6 pb-2">
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
          className="text-[#15304d] font-['Cairo'] font-bold text-[13px] hover:bg-slate-50 h-7.5 px-3 rounded-xl cursor-pointer"
        >
          عرض سجل الأنشطة
        </Button>
      </div>

      <div className="flex flex-col w-full divide-y divide-[#ECECEC] px-6">
        {ACTIVITIES_DATA.map((act) => (
          <div
            key={act.id}
            className="flex items-center justify-between py-3.5 hover:bg-[#F9FAFB]/50 transition duration-150"
          >
            <span className="font-['Cairo'] font-medium text-[13px] text-[#111111] text-right">
              {act.text}
            </span>
            <span className="font-['Cairo'] font-normal text-[12px] text-[#6b6a6a] shrink-0 mr-4">
              {act.timeAgo}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
