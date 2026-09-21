'use client'

import { Eye, MoreVertical } from 'lucide-react'
import { Card, Button } from '@buyootna/ui'
import {
  AdminDashboardRecentRegistration,
  formatRelativeArabicTime,
} from '@/lib/admin-dashboard'

export interface RecentRegistrationsTableProps {
  registrations: AdminDashboardRecentRegistration[]
}

const PLAN_STYLES: Record<string, { color: string; bg: string }> = {
  المجاني: { color: 'text-[#2563eb]', bg: 'bg-[#eaf0fd]' },
  العادية: { color: 'text-[#2563eb]', bg: 'bg-[#eaf0fd]' },
  الفضية: { color: 'text-[#344054]', bg: 'bg-[#f2f4f7]' },
  الذهبية: { color: 'text-[#12c281]', bg: 'bg-[#12c281]/10' },
}
const DEFAULT_PLAN_STYLE = { color: 'text-[#111111]', bg: 'bg-[#f2f4f7]' }

export default function RecentRegistrationsTable({
  registrations,
}: RecentRegistrationsTableProps) {
  return (
    <Card
      className="bg-white lg:col-span-2 border-[#ECECEC] py-5 select-none relative overflow-hidden"
      data-node-id="2376:5586"
    >
      <div className="flex items-start justify-between w-full px-6 pb-4">
        <div className="space-y-1 text-right">
          <h3 className="font-['Cairo'] font-bold text-[16px] text-[#111111] leading-none">
            التسجيلات الاخيرة
          </h3>
          <p className="font-['Cairo'] font-medium text-[13px] text-[#6b6a6a] leading-none">
            آخر الحسابات التي انضمت للمنصة
          </p>
        </div>
        <Button
          variant="ghost"
          className="text-[#15304d] font-['Cairo'] font-bold text-[13px] hover:bg-slate-50 h-7.5 px-3 rounded-xl"
        >
          عرض الكل
        </Button>
      </div>

      {registrations.length === 0 ? (
        <p className="px-6 py-6 text-center font-['Cairo'] text-[13px] text-[#6b6a6a]">
          لا توجد تسجيلات حديثة
        </p>
      ) : (
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
              {registrations.map((reg) => {
                const planStyle = reg.planName
                  ? PLAN_STYLES[reg.planName] ?? DEFAULT_PLAN_STYLE
                  : null
                return (
                  <tr
                    key={reg.id}
                    className="hover:bg-[#F9FAFB]/50 transition duration-150 h-12"
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
                      {reg.accountType}
                    </td>
                    <td className="px-6 py-2">
                      {!planStyle ? (
                        <span className="font-['Cairo'] font-medium text-[11px] text-[#a0a0a0]">
                          ــــــ
                        </span>
                      ) : (
                        <span
                          className={`px-2 py-0.5 rounded-[99px] text-[12px] font-['Cairo'] font-medium ${planStyle.bg} ${planStyle.color}`}
                        >
                          {reg.planName}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-2 font-['Cairo'] font-normal text-[12px] text-[#6b6a6a]">
                      {formatRelativeArabicTime(reg.createdAt)}
                    </td>
                    <td className="px-6 py-2 text-left">
                      <div className="flex justify-end items-center gap-3">
                        <button className="p-1 rounded hover:bg-slate-50 text-[#111111] transition cursor-pointer">
                          <Eye className="w-5 h-5 text-[#6B6A6A]" />
                        </button>
                        <button className="p-1 rounded hover:bg-slate-50 text-[#111111] transition cursor-pointer">
                          <MoreVertical className="w-5 h-5 text-[#6B6A6A]" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  )
}
