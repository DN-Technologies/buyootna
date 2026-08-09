'use client'

import { useState } from 'react'
import LogDetailDrawer from './LogDetailDrawer'
import RepublishAdDialog from './RepublishAdDialog'

export interface UserLogRecord {
  id: string
  code: string
  actionTitle: string
  actionTarget: string
  actorName: string
  actorInitial: string
  timestamp: string
}

const mockLogs: UserLogRecord[] = [
  {
    id: '1',
    code: 'LOG-001',
    actionTitle: 'حذف اعلان',
    actionTarget: 'شقة للبيع بالسالمية',
    actorName: 'علي البالي (مشرف)',
    actorInitial: 'م',
    timestamp: '8 يوليو 2026 - 10:30 ص',
  },
  {
    id: '2',
    code: 'LOG-001',
    actionTitle: 'حذف اعلان',
    actionTarget: 'شقة للبيع بالسالمية',
    actorName: 'النظام',
    actorInitial: 'م',
    timestamp: '8 يوليو 2026 - 10:30 ص',
  },
  {
    id: '3',
    code: 'LOG-001',
    actionTitle: 'شراء باقة',
    actionTarget: 'الباقة الفضية',
    actorName: 'المستخدم',
    actorInitial: 'م',
    timestamp: '8 يوليو 2026 - 10:30 ص',
  },
  {
    id: '4',
    code: 'LOG-001',
    actionTitle: 'شراء باقة',
    actionTarget: 'الباقة الفضية',
    actorName: 'المستخدم',
    actorInitial: 'م',
    timestamp: '8 يوليو 2026 - 10:30 ص',
  },
  {
    id: '5',
    code: 'LOG-001',
    actionTitle: 'شراء باقة',
    actionTarget: 'الباقة الفضية',
    actorName: 'علي البالي (مشرف)',
    actorInitial: 'م',
    timestamp: '8 يوليو 2026 - 10:30 ص',
  },
  {
    id: '6',
    code: 'LOG-001',
    actionTitle: 'اخفاء اعلان',
    actionTarget: 'شقة للبيع بالسالمية',
    actorName: 'علي البالي (مشرف عام)',
    actorInitial: 'م',
    timestamp: '8 يوليو 2026 - 10:30 ص',
  },
]

export default function UserLogsTabContent() {
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedLog, setSelectedLog] = useState<UserLogRecord | null>(null)
  const [republishOpen, setRepublishOpen] = useState(false)

  return (
    <div className="flex flex-col gap-5 w-full font-['Cairo']" dir="rtl">
      {/* Audit Logs Table Card */}
      <div className="bg-white border border-[#ECECEC] rounded-xl p-5 flex flex-col gap-4 w-full">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-right border-collapse">
            <thead>
              <tr className="border-b border-[#ECECEC] bg-[#F8FAFC] text-[13px] font-medium text-[#6B6A6A]">
                <th className="py-3 px-4 text-right">رقم العملية</th>
                <th className="py-3 px-4 text-right">الإجراء</th>
                <th className="py-3 px-4 text-right">المسؤول</th>
                <th className="py-3 px-4 text-right">تاريخ التسجيل</th>
                <th className="py-3 px-4 text-center">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#ECECEC] text-[14px]">
              {mockLogs.map((log) => (
                <tr
                  key={log.id}
                  className="hover:bg-[#F8FAFC] transition-colors"
                >
                  <td className="py-3.5 px-4 font-semibold text-[#111111]">
                    {log.code}
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="font-bold text-[#111111]">
                        {log.actionTitle}
                      </span>
                      <span className="text-[12px] font-medium text-[#6B6A6A]">
                        {log.actionTarget}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2">
                      <div className="size-7 rounded-full bg-[#D1FAE5] text-[#059669] font-bold text-[12px] flex items-center justify-center shrink-0">
                        {log.actorInitial}
                      </div>
                      <span className="font-medium text-[#111111]">
                        {log.actorName}
                      </span>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-[#6B6A6A] font-medium">
                    {log.timestamp}
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedLog(log)}
                      className="text-primary font-bold hover:underline cursor-pointer text-[14px]"
                    >
                      عرض
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Row (Node 4043:131798) */}
      <div className="flex items-center justify-between gap-4 w-full px-2 text-[13px] font-medium text-[#6B6A6A] flex-wrap">
        <span>6 من 8 طلبات</span>

        <div className="flex items-center gap-1.5 dir-rtl">
          <button
            type="button"
            disabled={currentPage === 1}
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            className="px-2.5 py-1 text-[#6B6A6A] hover:text-[#111111] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed"
          >
            &lt; السابق
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(1)}
            className={`size-7 rounded-lg flex items-center justify-center font-bold text-[13px] cursor-pointer ${
              currentPage === 1
                ? 'bg-primary text-white'
                : 'text-[#111111] hover:bg-[#F8FAFC]'
            }`}
          >
            1
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(2)}
            className={`size-7 rounded-lg flex items-center justify-center font-bold text-[13px] cursor-pointer ${
              currentPage === 2
                ? 'bg-primary text-white'
                : 'text-[#111111] hover:bg-[#F8FAFC]'
            }`}
          >
            2
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage(3)}
            className={`size-7 rounded-lg flex items-center justify-center font-bold text-[13px] cursor-pointer ${
              currentPage === 3
                ? 'bg-primary text-white'
                : 'text-[#111111] hover:bg-[#F8FAFC]'
            }`}
          >
            3
          </button>
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(3, p + 1))}
            className="px-2.5 py-1 text-[#6B6A6A] hover:text-[#111111] cursor-pointer"
          >
            التالي &gt;
          </button>
        </div>
      </div>

      {/* Log Detail Slide-Over Drawer (Nodes 4043:131986, 4043:132406, 4043:132662) */}
      <LogDetailDrawer
        open={!!selectedLog}
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
        onOpenRepublishModal={() => setRepublishOpen(true)}
      />

      {/* Re-publish Confirmation Dialog (Node 4043:136634) */}
      <RepublishAdDialog
        open={republishOpen}
        onClose={() => setRepublishOpen(false)}
        onConfirm={() => {
          setSelectedLog(null)
          setRepublishOpen(false)
        }}
      />
    </div>
  )
}
