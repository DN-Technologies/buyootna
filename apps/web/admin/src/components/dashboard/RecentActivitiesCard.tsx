'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Card, Button } from '@buyootna/ui'
import { AdminLogRow, fetchLogs } from '@/lib/admin-logs'
import { describeLog } from '@/lib/log-labels'
import { formatRelativeArabicTime } from '@/lib/admin-dashboard'

/** The newest admin actions, from the audit log (السجل). */
export default function RecentActivitiesCard() {
  const [rows, setRows] = useState<AdminLogRow[] | null>(null)

  useEffect(() => {
    let cancelled = false
    fetchLogs(1, 4)
      .then((res) => !cancelled && setRows(res.data))
      .catch(() => !cancelled && setRows([]))
    return () => {
      cancelled = true
    }
  }, [])

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
        <Link href="/logs">
          <Button
            variant="ghost"
            className="text-[#15304d] font-['Cairo'] font-bold text-[13px] hover:bg-slate-50 h-7.5 px-3 rounded-xl cursor-pointer"
          >
            عرض سجل الأنشطة
          </Button>
        </Link>
      </div>

      <div className="flex flex-col w-full divide-y divide-[#ECECEC] px-6">
        {rows === null ? (
          <p className="py-6 text-center font-['Cairo'] text-[13px] text-[#6b6a6a]">
            جاري التحميل...
          </p>
        ) : rows.length === 0 ? (
          <p className="py-6 text-center font-['Cairo'] text-[13px] text-[#6b6a6a]">
            لا توجد أنشطة بعد
          </p>
        ) : (
          rows.map((row) => (
            <div
              key={row.id}
              className="flex items-center justify-between py-3.5 hover:bg-[#F9FAFB]/50 transition duration-150"
            >
              <span className="font-['Cairo'] font-medium text-[13px] text-[#111111] text-right">
                {describeLog(row)}
              </span>
              <span className="font-['Cairo'] font-normal text-[12px] text-[#6b6a6a] shrink-0 mr-4">
                {formatRelativeArabicTime(row.createdAt)}
              </span>
            </div>
          ))
        )}
      </div>
    </Card>
  )
}
