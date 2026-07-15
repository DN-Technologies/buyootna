'use client'

import { Eye, MoreVertical } from 'lucide-react'
import { Card, Button } from '@buyootna/ui'

const recentRegistrations = [
  {
    id: '1',
    name: 'أحمد سعيد',
    email: 'Ahmed@gmail.com',
    type: 'فرد',
    subscription: 'ــــــ',
    subColor: 'text-[#a0a0a0]',
    subBg: 'bg-transparent',
    date: 'منذ ساعتين',
  },
  {
    id: '2',
    name: 'فاطمة الحربي',
    email: 'fatima@desertdelights.com',
    type: 'فرد',
    subscription: 'المجاني',
    subColor: 'text-[#2563eb]',
    subBg: 'bg-[#eaf0fd]',
    date: 'منذ 30 دقيقة',
  },
  {
    id: '3',
    name: 'محمد الزهراني',
    email: 'mohammed@oasistreats.net',
    type: 'مكتب عقاري',
    subscription: 'الفضية',
    subColor: 'text-[#344054]',
    subBg: 'bg-[#f2f4f7]',
    date: 'منذ يوم',
  },
  {
    id: '4',
    name: 'محمد الزهراني',
    email: 'mohammed@oasistreats.net',
    type: 'شركة',
    subscription: 'السنوية',
    subColor: 'text-[#12c281]',
    subBg: 'bg-[#12c281]/10',
    date: 'منذ 5 دقائق',
  },
  {
    id: '5',
    name: 'محمد الزهراني',
    email: 'mohammed@oasistreats.net',
    type: 'فرد',
    subscription: 'ــــــ',
    subColor: 'text-[#a0a0a0]',
    subBg: 'bg-transparent',
    date: 'منذ 5 دقائق',
  },
  {
    id: '6',
    name: 'محمد الزهراني',
    email: 'mohammed@oasistreats.net',
    type: 'فرد',
    subscription: 'ــــــ',
    subColor: 'text-[#a0a0a0]',
    subBg: 'bg-transparent',
    date: 'منذ 5 دقائق',
  },
]

export default function RecentRegistrationsTable() {
  return (
    <Card
      className="bg-white border-[#ECECEC] py-[20px] select-none relative overflow-hidden"
      data-node-id="2376:5586"
    >
      <div className="flex items-start justify-between w-full px-6 pb-4">
        <Button
          variant="ghost"
          className="text-[#15304d] font-['Cairo'] font-bold text-[13px] hover:bg-slate-50 h-[30px] px-3 rounded-[12px]"
        >
          عرض الكل
        </Button>
        <div className="space-y-1 text-right">
          <h3 className="font-['Cairo'] font-bold text-[16px] text-[#111111] leading-none">
            التسجيلات الاخيرة
          </h3>
          <p className="font-['Cairo'] font-medium text-[13px] text-[#6b6a6a] leading-none">
            تحليل مالي شهري لعام 2026
          </p>
        </div>
      </div>

      <div className="overflow-x-auto w-full">
        <table className="w-full text-right text-sm">
          <thead>
            <tr className="bg-[#F7FAF9] border-b border-[#ECECEC] text-[#6B6A6A]">
              <th className="px-6 py-3 font-semibold font-['Cairo'] text-xs">
                اسم المستخدم
              </th>
              <th className="px-6 py-3 font-semibold font-['Cairo'] text-xs">
                نوع الحساب
              </th>
              <th className="px-6 py-3 font-semibold font-['Cairo'] text-xs">
                الاشتراك
              </th>
              <th className="px-6 py-3 font-semibold font-['Cairo'] text-xs">
                تاريخ التسجيل
              </th>
              <th className="px-6 py-3 font-semibold font-['Cairo'] text-xs text-left">
                الاجراءات
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#ECECEC]">
            {recentRegistrations.map((reg) => (
              <tr
                key={reg.id}
                className="hover:bg-[#F9FAFB]/50 transition duration-150 h-[48px]"
              >
                <td className="px-6 py-2">
                  <div className="flex flex-col gap-0.5 text-right leading-none">
                    <span className="font-['Cairo'] font-semibold text-[13px] text-[#111111]">
                      {reg.name}
                    </span>
                    <span className="font-['Cairo'] font-normal text-[12px] text-[#6b6a6a]">
                      {reg.email}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-2 font-['Cairo'] font-normal text-[13px] text-[#111111]">
                  {reg.type}
                </td>
                <td className="px-6 py-2">
                  {reg.subscription === 'ــــــ' ? (
                    <span className="font-['Cairo'] font-medium text-[11px] text-[#a0a0a0]">
                      ــــــ
                    </span>
                  ) : (
                    <span
                      className={`px-2 py-0.5 rounded-[99px] text-[12px] font-['Cairo'] font-medium ${reg.subBg} ${reg.subColor}`}
                    >
                      {reg.subscription}
                    </span>
                  )}
                </td>
                <td className="px-6 py-2 font-['Cairo'] font-normal text-[12px] text-[#6b6a6a]">
                  {reg.date}
                </td>
                <td className="px-6 py-2 text-left">
                  <div className="flex justify-end items-center gap-3">
                    <button className="p-1 rounded hover:bg-slate-50 text-[#111111] transition cursor-pointer">
                      <MoreVertical className="w-5 h-5 text-[#6B6A6A]" />
                    </button>
                    <button className="p-1 rounded hover:bg-slate-50 text-[#111111] transition cursor-pointer">
                      <Eye className="w-5 h-5 text-[#6B6A6A]" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  )
}
