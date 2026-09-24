'use client'

import { useCallback, useEffect, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import LogDetailDrawer from './LogDetailDrawer'
import { AdminLogRow, fetchUserLogs } from '@/lib/admin-logs'
import { LOG_ACTION_LABEL } from '@/lib/log-labels'
import { formatRelativeArabicTime } from '@/lib/admin-dashboard'

const PAGE_SIZE = 10

export default function UserLogsTabContent({ userId }: { userId: string }) {
  const [logs, setLogs] = useState<AdminLogRow[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [total, setTotal] = useState(0)
  const [selectedLog, setSelectedLog] = useState<AdminLogRow | null>(null)

  const load = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchUserLogs(userId, currentPage, PAGE_SIZE)
      setLogs(res.data)
      setTotalPages(res.meta.totalPages || 1)
      setTotal(res.meta.total)
    } catch (err) {
      console.error('Failed to load user logs:', err)
    } finally {
      setLoading(false)
    }
  }, [userId, currentPage])

  useEffect(() => {
    load()
  }, [load])

  if (loading) {
    return (
      <div className="w-full py-16 text-center text-[#6B6A6A] font-['Cairo']">
        جاري التحميل...
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 w-full font-['Cairo']" dir="rtl">
      {/* Audit Logs Table Card */}
      <div className="bg-white border border-[#ECECEC] rounded-xl p-5 flex flex-col gap-4 w-full">
        {logs.length === 0 ? (
          <p className="text-[13px] text-[#6B6A6A] text-center py-8">
            لا يوجد سجل عمليات لهذا المستخدم.
          </p>
        ) : (
          <div className="overflow-x-auto w-full">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="border-b border-[#ECECEC] bg-[#F8FAFC] text-[13px] font-medium text-[#6B6A6A]">
                  <th className="py-3 px-4 text-right">الإجراء</th>
                  <th className="py-3 px-4 text-right">المسؤول</th>
                  <th className="py-3 px-4 text-right">تاريخ التسجيل</th>
                  <th className="py-3 px-4 text-center">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECECEC] text-[14px]">
                {logs.map((log) => (
                  <tr
                    key={log.id}
                    className="hover:bg-[#F8FAFC] transition-colors"
                  >
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-[#111111]">
                        {LOG_ACTION_LABEL[log.action] || log.action}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="size-7 rounded-full bg-[#D1FAE5] text-[#059669] font-bold text-[12px] flex items-center justify-center shrink-0">
                          {log.actorType === 'SYSTEM'
                            ? 'ن'
                            : (log.actorAdmin?.name || 'م').charAt(0)}
                        </div>
                        <span className="font-medium text-[#111111]">
                          {log.actorType === 'SYSTEM'
                            ? 'النظام'
                            : log.actorAdmin?.name || 'مشرف'}
                        </span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 text-[#6B6A6A] font-medium">
                      {formatRelativeArabicTime(log.createdAt)}
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
        )}
      </div>

      {/* Pagination Row */}
      {total > 0 && (
        <div className="flex items-center justify-between gap-4 w-full px-2 text-[13px] font-medium text-[#6B6A6A] flex-wrap">
          <span>
            صفحة {currentPage} من {totalPages} ({total} عملية)
          </span>

          <div className="flex items-center gap-1.5">
            <button
              type="button"
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              className="px-2.5 py-1 text-[#6B6A6A] hover:text-[#111111] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
            >
              <ChevronRight className="w-4 h-4" />
              السابق
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              onClick={() =>
                setCurrentPage((p) => Math.min(totalPages, p + 1))
              }
              className="px-2.5 py-1 text-[#6B6A6A] hover:text-[#111111] disabled:opacity-40 cursor-pointer disabled:cursor-not-allowed flex items-center gap-1"
            >
              التالي
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Log Detail Slide-Over Drawer */}
      <LogDetailDrawer
        open={!!selectedLog}
        log={selectedLog}
        onClose={() => setSelectedLog(null)}
      />
    </div>
  )
}
