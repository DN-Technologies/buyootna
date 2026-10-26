'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { History } from 'lucide-react'
import PageHeader from '@/components/PageHeader'
import UserPagination from '@/components/users/UserPagination'
import LogDetailDrawer from '@/components/users/logs/LogDetailDrawer'
import {
  AdminLogRow,
  AdminLogsResponse,
  BackendAdminActionType,
  fetchLogs,
} from '@/lib/admin-logs'
import { LOG_ACTION_LABEL, LOG_TARGET_TYPE_LABEL } from '@/lib/log-labels'

const PAGE_SIZE = 20

function formatDateTime(iso: string) {
  return new Intl.DateTimeFormat('ar', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    calendar: 'gregory',
    numberingSystem: 'latn',
  }).format(new Date(iso))
}

/** Every admin action (AdminActionLog), newest first. */
export default function LogsPage() {
  const [page, setPage] = useState(1)
  const [action, setAction] = useState<BackendAdminActionType | ''>('')
  const [result, setResult] = useState<AdminLogsResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selected, setSelected] = useState<AdminLogRow | null>(null)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    fetchLogs(page, PAGE_SIZE, action || undefined)
      .then((res) => !cancelled && setResult(res))
      .catch(() => !cancelled && setError('تعذر تحميل السجل.'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [page, action])

  return (
    <div className="space-y-6 text-right font-['Cairo']" dir="rtl">
      <PageHeader
        breadcrumbs={['الرئيسية', 'سجل العمليات']}
        title="سجل العمليات"
        subtitle="كل إجراء نفّذه المشرفون: من نفّذه، وعلى أي حساب، ومتى."
      />

      <div className="flex items-center gap-2">
        <label className="text-[13px] text-[#6B6A6A]" htmlFor="log-action">
          نوع الإجراء
        </label>
        <select
          id="log-action"
          value={action}
          onChange={(e) => {
            setAction(e.target.value as BackendAdminActionType | '')
            setPage(1)
          }}
          className="h-10 px-3 bg-white border border-[#ECECEC] rounded-xl text-[13px] text-[#111111] focus:outline-none focus:border-primary cursor-pointer"
        >
          <option value="">الكل</option>
          {Object.entries(LOG_ACTION_LABEL).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      ) : loading && !result ? (
        <div className="py-24 text-center text-[13px] text-[#6B6A6A]">جاري التحميل...</div>
      ) : !result || result.data.length === 0 ? (
        <div className="bg-white border border-[#ECECEC] rounded-2xl py-24 flex flex-col items-center text-center">
          <div className="size-16 rounded-2xl bg-[#F8FAFC] border border-[#ECECEC] flex items-center justify-center mb-4">
            <History className="w-8 h-8 stroke-[1.5] text-[#111111]" />
          </div>
          <h3 className="text-[18px] font-bold text-[#111111] mb-1.5">لا توجد عمليات</h3>
          <p className="text-[13px] text-[#6B6A6A]">
            ستظهر هنا إجراءات المشرفين مثل تغيير الباقات والتوثيق وحل البلاغات.
          </p>
        </div>
      ) : (
        <div className="bg-white border border-[#ECECEC] rounded-2xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-right border-collapse">
              <thead>
                <tr className="bg-[#F8FAFC] border-b border-[#ECECEC] text-[12px] font-bold text-[#6B6A6A]">
                  <th className="p-4">الإجراء</th>
                  <th className="p-4">بواسطة</th>
                  <th className="p-4">الحساب</th>
                  <th className="p-4">العنصر</th>
                  <th className="p-4">التاريخ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#ECECEC] text-[13px] text-[#111111]">
                {result.data.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelected(row)}
                    className="hover:bg-slate-50/70 transition-colors cursor-pointer"
                  >
                    <td className="p-4 font-bold">{LOG_ACTION_LABEL[row.action] ?? row.action}</td>
                    <td className="p-4">
                      {row.actorType === 'SYSTEM' ? 'النظام' : (row.actorAdmin?.name ?? '—')}
                    </td>
                    <td className="p-4">
                      {row.targetUser ? (
                        <Link
                          href={`/users/${row.targetUser.id}?tab=logs`}
                          onClick={(e) => e.stopPropagation()}
                          className="text-primary font-semibold hover:underline"
                        >
                          {row.targetUser.name ?? 'عرض الحساب'}
                        </Link>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="p-4 text-[#6B6A6A]">
                      {LOG_TARGET_TYPE_LABEL[row.targetType] ?? row.targetType}
                    </td>
                    <td className="p-4 text-[#6B6A6A]">{formatDateTime(row.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <UserPagination
            currentPage={result.meta.currentPage}
            totalPages={result.meta.totalPages}
            totalItems={result.meta.total}
            currentCount={result.data.length}
            itemLabel="عملية"
            onPageChange={setPage}
          />
        </div>
      )}

      <LogDetailDrawer
        open={!!selected}
        log={selected}
        onClose={() => setSelected(null)}
      />
    </div>
  )
}
