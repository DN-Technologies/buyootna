'use client'

import { Card, Button } from '@buyootna/ui'

const verificationRequests = [
  {
    id: '1',
    user: 'المستقبل',
    type: 'شركة',
    typeColor: 'text-[#93370d]',
    typeBg: 'bg-[#fffaeb]',
  },
  {
    id: '2',
    user: 'دار العقار الحديث',
    type: 'شركة',
    typeColor: 'text-[#93370d]',
    typeBg: 'bg-[#fffaeb]',
  },
  {
    id: '3',
    user: 'المنار',
    type: 'شركة',
    typeColor: 'text-[#93370d]',
    typeBg: 'bg-[#fffaeb]',
  },
  {
    id: '4',
    user: 'الأمل',
    type: 'مكتب عقاري',
    typeColor: 'text-[#344054]',
    typeBg: 'bg-[#f2f4f7]',
  },
  {
    id: '5',
    user: 'الأمل',
    type: 'شركة',
    typeColor: 'text-[#93370d]',
    typeBg: 'bg-[#fffaeb]',
  },
  {
    id: '6',
    user: 'الأمل',
    type: 'مكتب عقاري',
    typeColor: 'text-[#344054]',
    typeBg: 'bg-[#f2f4f7]',
  },
  {
    id: '7',
    user: 'دار العقار الحديث',
    type: 'شركة',
    typeColor: 'text-[#93370d]',
    typeBg: 'bg-[#fffaeb]',
  },
]

export default function VerificationRequestsCard() {
  return (
    <Card
      className="bg-white border-[#ECECEC] py-[20px] flex flex-col gap-4 relative select-none"
      data-node-id="2376:5816"
    >
      <div className="flex items-start justify-between w-full px-[18px]">
        <div className="space-y-1 text-right">
          <h3 className="font-['Cairo'] font-bold text-[16px] text-[#111111] leading-none">
            طلبات التحقق
          </h3>
          <p className="font-['Cairo'] font-medium text-[13px] text-[#6b6a6a] leading-none">
            حسابات تنتظر مراجعة مستندات التوثيق
          </p>
        </div>
        <Button
          variant="ghost"
          className="text-[#15304d] font-['Cairo'] font-bold text-[13px] hover:bg-slate-50 h-[30px] px-3 rounded-[12px]"
        >
          عرض الكل
        </Button>
      </div>

      <div className="flex flex-col w-full">
        <div className="border-b border-[#ECECEC] pb-3 pt-2 w-full px-[18px]">
          <div className="flex items-center justify-between w-full text-right">
            <span className="font-['Cairo'] font-semibold text-[12px] text-[#6b6a6a] w-[140px] text-right">
              المستخدم
            </span>
            <span className="font-['Cairo'] font-semibold text-[12px] text-[#6b6a6a] w-[100px] text-center">
              النوع
            </span>
            <span className="font-['Cairo'] font-semibold text-[12px] text-[#6b6a6a] w-[80px]">
              الاجراءات
            </span>
          </div>
        </div>

        <div className="flex flex-col w-full divide-y divide-[#ECECEC]">
          {verificationRequests.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between py-3 px-[18px] w-full hover:bg-[#F9FAFB]/50 transition duration-150 h-[48px]"
            >
              <span className="font-['Cairo'] font-semibold text-[13px] text-[#111111] text-right w-[140px] truncate">
                {req.user}
              </span>
              <div className="w-[100px] flex justify-center">
                <span
                  className={`px-2 py-0.5 rounded-[99px] text-[11px] font-['Cairo'] font-medium ${req.typeBg} ${req.typeColor}`}
                >
                  {req.type}
                </span>
              </div>
              <button className="text-[#15304d] font-['Cairo'] font-bold text-[13px] hover:underline cursor-pointer text-left w-[80px]">
                مراجعة
              </button>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
