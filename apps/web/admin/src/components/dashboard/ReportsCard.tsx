'use client'

import { Card, Button } from '@buyootna/ui'

const reports = [
  {
    id: '1',
    type: 'عقار',
    title: 'فيلا بالتجمع الخامس',
    reason: 'معلومات غير صحيحة',
    time: 'منذ 47 دقيقة',
    priority: 'عاجل',
    priorityColor: 'text-[#9c1e28]',
    bulletColor: 'bg-[#9c1e28]',
  },
  {
    id: '2',
    type: 'عقار',
    title: 'فيلا بالتجمع الخامس',
    reason: 'معلومات غير صحيحة',
    time: 'منذ 47 دقيقة',
    priority: 'عاجل',
    priorityColor: 'text-[#9c1e28]',
    bulletColor: 'bg-[#9c1e28]',
  },
  {
    id: '3',
    type: 'عقار',
    title: 'فيلا بالتجمع الخامس',
    reason: 'معلومات غير صحيحة',
    time: 'منذ 47 دقيقة',
    priority: 'منخفضة',
    priorityColor: 'text-[#344054]',
    bulletColor: 'bg-[#344054]',
  },
  {
    id: '4',
    type: 'عقار',
    title: 'فيلا بالتجمع الخامس',
    reason: 'معلومات غير صحيحة',
    time: 'منذ 47 دقيقة',
    priority: 'متوسط',
    priorityColor: 'text-[#b97500]',
    bulletColor: 'bg-[#b97500]',
  },
]

export default function ReportsCard() {
  return (
    <Card
      className="bg-white border-[#ECECEC] p-[17px] flex flex-col gap-4 relative select-none"
      data-node-id="2376:5216"
    >
      <div className="flex items-start justify-between w-full pb-2">
        <Button
          variant="ghost"
          className="text-[#15304d] font-['Cairo'] font-bold text-[13px] hover:bg-slate-50 h-[30px] px-3 rounded-[12px]"
        >
          عرض الكل
        </Button>
        <div className="space-y-1 text-right">
          <h3 className="font-['Cairo'] font-bold text-[16px] text-[#111111] leading-none">
            البلاغات التي تحتاج مراجعة
          </h3>
          <p className="font-['Cairo'] font-medium text-[13px] text-[#6b6a6a] leading-none">
            آخر البلاغات التي لم يتم التعامل معها
          </p>
        </div>
      </div>

      <div className="flex flex-col w-full">
        {reports.map((rep, idx) => (
          <div
            key={rep.id}
            className={`flex items-center justify-between py-3.5 w-full ${
              idx < reports.length - 1 ? 'border-b border-[#ECEEEF]' : ''
            }`}
          >
            <button className="text-[#15304d] font-['Cairo'] font-bold text-[13px] hover:underline cursor-pointer">
              التفاصيل
            </button>

            <div className="flex flex-col gap-1.5 items-end text-right">
              <div className="flex items-center gap-1 justify-end h-[20px] rounded-[99px]">
                <span
                  className={`font-['Cairo'] font-medium text-[12px] ${rep.priorityColor}`}
                >
                  {rep.priority}
                </span>
                <span className={`w-2 h-2 rounded-full ${rep.bulletColor}`} />
              </div>
              <p className="font-['Cairo'] font-semibold text-[13px] text-[#111111] leading-none">
                <span>عقار </span>
                <span className="font-normal text-[#111111]">{rep.title}</span>
              </p>
              <p className="font-['Cairo'] font-normal text-[12px] text-[#6b6a6a] leading-none mt-0.5">
                {rep.reason} · {rep.time}
              </p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  )
}
