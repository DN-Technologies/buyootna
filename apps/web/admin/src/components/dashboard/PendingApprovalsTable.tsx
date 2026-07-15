'use client'

import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@buyootna/ui'

const pendingRequests = [
  {
    id: '1',
    name: 'شركة النخبة العقارية',
    type: 'شركة',
    license: 'LIC-88390',
    date: 'منذ ساعتين',
    status: 'قيد الانتظار',
  },
  {
    id: '2',
    name: 'مكتب دار الخليج للعقارات',
    type: 'مكتب عقاري',
    license: 'LIC-22451',
    date: 'منذ 4 ساعات',
    status: 'قيد الانتظار',
  },
  {
    id: '3',
    name: 'شركة روتانا للمقاولات',
    type: 'شركة',
    license: 'LIC-11928',
    date: 'منذ يوم واحد',
    status: 'قيد الانتظار',
  },
  {
    id: '4',
    name: 'مكتب الصديق للخدمات العقارية',
    type: 'مكتب عقاري',
    license: 'LIC-77421',
    date: 'منذ يومين',
    status: 'قيد الانتظار',
  },
]

export default function PendingApprovalsTable() {
  return (
    <Card
      className="bg-white border-[#ECECEC]"
      data-node-id="pending-approvals-card"
    >
      <CardHeader className="flex flex-row items-center justify-between border-b border-[#ECECEC] pb-4">
        <div>
          <CardTitle className="text-base font-['Cairo'] font-bold text-primary">
            طلبات الاعتماد قيد الانتظار
          </CardTitle>
          <p className="text-xs text-[#6B6A6A] mt-1">
            طلبات جديدة للتسجيل كشركات أو مكاتب عقارية بحاجة لمراجعة التراخيص.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="font-['Cairo'] font-semibold text-xs gap-1"
        >
          عرض الكل
          <ArrowLeft className="w-3.5 h-3.5" />
        </Button>
      </CardHeader>
      <CardContent className="pt-4 p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-right text-sm">
            <thead>
              <tr className="border-b border-[#ECECEC] text-[#6B6A6A]">
                <th className="px-6 py-3 font-semibold font-['Cairo'] text-xs">
                  الجهة الطالبة
                </th>
                <th className="px-6 py-3 font-semibold font-['Cairo'] text-xs">
                  نوع الحساب
                </th>
                <th className="px-6 py-3 font-semibold font-['Cairo'] text-xs">
                  رقم الترخيص
                </th>
                <th className="px-6 py-3 font-semibold font-['Cairo'] text-xs">
                  التاريخ
                </th>
                <th className="px-6 py-3 font-semibold font-['Cairo'] text-xs text-left">
                  الإجراء
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECECEC]">
              {pendingRequests.map((req) => (
                <tr
                  key={req.id}
                  className="hover:bg-[#F9FAFB]/50 transition duration-150"
                >
                  <td className="px-6 py-3.5 font-semibold text-[#111111]">
                    {req.name}
                  </td>
                  <td className="px-6 py-3.5 text-[#6B6A6A] text-xs">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                        req.type === 'شركة'
                          ? 'bg-blue-50 text-blue-600'
                          : 'bg-purple-50 text-purple-600'
                      }`}
                    >
                      {req.type}
                    </span>
                  </td>
                  <td className="px-6 py-3.5 text-[#6B6A6A] font-mono text-xs">
                    {req.license}
                  </td>
                  <td className="px-6 py-3.5 text-[#6B6A6A] text-xs">
                    {req.date}
                  </td>
                  <td className="px-6 py-3.5 text-left">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="default"
                        className="bg-primary text-white hover:bg-primary/90 text-xs font-semibold px-2.5 py-1"
                      >
                        مراجعة
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
