'use client'

import { Card, Button } from '@buyootna/ui'

const recentActivities = [
  {
    id: '1',
    text: 'قام المشرف أحمد بتعديل باقات الشركات.',
    time: 'منذ ساعتين',
  },
  {
    id: '2',
    text: 'قام المشرف ايمن بتوثيق مكتب "أطلس الهندسي".',
    time: 'منذ 30 دقيقة',
  },
  { id: '3', text: 'تم استلام بلاغ جديد لخدمة التشطيب.', time: 'منذ ساعتين' },
  {
    id: '4',
    text: 'تم الاشتراك في باقة سنوية جديدة من مكتب المستقبل للعقارات.',
    time: 'منذ ساعتين',
  },
  {
    id: '5',
    text: 'قام المشرف ايمن بتوثيق مكتب "أطلس الهندسي".',
    time: 'منذ ساعتين',
  },
  {
    id: '6',
    text: 'قام المشرف ايمن بتوثيق مكتب "أطلس الهندسي".',
    time: 'منذ ساعتين',
  },
]

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
          className="text-[#15304d] font-['Cairo'] font-bold text-[13px] hover:bg-slate-50 h-7.5 px-3 rounded-xl"
        >
          عرض سجل الأنشطة
        </Button>
      </div>

      <div className="flex flex-col w-full divide-y divide-[#ECECEC] border-t border-[#ECECEC]">
        {recentActivities.map((act) => (
          <div
            key={act.id}
            className="flex items-center justify-between px-6 h-12 w-full hover:bg-[#F9FAFB]/50 transition duration-150"
          >
            <p className="font-['Cairo'] font-semibold text-[13px] text-[#111111] text-right truncate pl-4 flex-1">
              {act.text}
            </p>
            <span className="font-['Cairo'] font-normal text-[12px] text-[#6b6a6a] text-left shrink-0">
              {act.time}
            </span>
          </div>
        ))}
      </div>
    </Card>
  )
}
