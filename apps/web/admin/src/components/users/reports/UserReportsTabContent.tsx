'use client'

import { useCallback, useEffect, useState } from 'react'
import { AlertTriangle, CheckCircle2, MoreVertical } from 'lucide-react'
import ReportDetailDrawer from './ReportDetailDrawer'
import AssignUserReportDialog, { AdminOption } from './AssignUserReportDialog'
import {
  AdminReportRow,
  fetchUserReports,
  updateReport,
} from '@/lib/admin-reports'
import {
  USER_TAB_PRIORITY_LABEL,
  USER_TAB_STATUS_LABEL,
} from '@/lib/report-labels'
import { formatRelativeArabicTime } from '@/lib/admin-dashboard'

export interface UserReportItem {
  id: string
  code: string
  title: string
  submitter: string
  submitterId?: string
  submitterEmail?: string
  submitterPhone?: string
  date: string
  status: 'مفتوحة' | 'معلقة' | 'مغلقة'
  priority?: 'منخفضة' | 'متوسطة' | 'عالية'
  details?: string
}

function toUserReportItem(row: AdminReportRow): UserReportItem {
  return {
    id: row.id,
    code: `${row.reportNumber} #`,
    title: row.reason,
    submitter: row.submittedBy?.name || 'مستخدم بيوتنا',
    submitterId: row.submittedBy?.id,
    submitterEmail: row.submittedBy?.email || undefined,
    submitterPhone: row.submittedBy?.phone || undefined,
    date: formatRelativeArabicTime(row.createdAt),
    status: USER_TAB_STATUS_LABEL[row.status],
    priority: USER_TAB_PRIORITY_LABEL[row.priority],
    details: row.description || undefined,
  }
}

const statusBadgeStyles: Record<UserReportItem['status'], string> = {
  مفتوحة: 'bg-[#FEF3F2] text-[#9C1E28]',
  معلقة: 'bg-[#FEF6E6] text-[#D97706]',
  مغلقة: 'bg-[#F1F5F9] text-[#6B6A6A]',
}

const priorityBadgeStyles: Record<
  NonNullable<UserReportItem['priority']>,
  string
> = {
  منخفضة: 'bg-[#F1F5F9] text-[#6B6A6A]',
  متوسطة: 'bg-[#FEF6E6] text-[#D97706]',
  عالية: 'bg-[#FEF3F2] text-[#9C1E28]',
}

interface UserReportsTabContentProps {
  userId: string
  identityId?: string
}

export default function UserReportsTabContent({
  userId,
  identityId,
}: UserReportsTabContentProps) {
  const [reports, setReports] = useState<UserReportItem[]>([])
  const [loading, setLoading] = useState(true)
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [selectedReport, setSelectedReport] = useState<UserReportItem | null>(
    null,
  )
  const [assignDialogOpen, setAssignDialogOpen] = useState(false)
  const [reportForAssign, setReportForAssign] = useState<UserReportItem | null>(
    null,
  )
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const loadReports = useCallback(async () => {
    try {
      setLoading(true)
      const res = await fetchUserReports(userId, { limit: 50, identityId })
      setReports(res.data.map(toUserReportItem))
    } catch (err) {
      console.error('Failed to load user reports:', err)
    } finally {
      setLoading(false)
    }
  }, [userId, identityId])

  useEffect(() => {
    loadReports()
  }, [loadReports])

  const openCount = reports.filter((r) => r.status === 'مفتوحة').length
  const closedCount = reports.filter((r) => r.status === 'مغلقة').length
  const totalCount = reports.length

  const handleCloseReport = async (report: UserReportItem) => {
    try {
      await updateReport(report.id, { status: 'RESOLVED' })
      setToastMessage('تم وضع علامة تم الحل (مغلق) للبلاغ بنجاح.')
      setSelectedReport(null)
      await loadReports()
    } catch (err) {
      console.error('Failed to close report:', err)
      setToastMessage('حدث خطأ أثناء إغلاق البلاغ.')
    }
  }

  if (loading) {
    return (
      <div
        className="bg-white border border-[#ECECEC] rounded-xl flex items-center justify-center py-16 px-6 text-center w-full min-h-80 font-['Cairo']"
        dir="rtl"
      >
        <span className="text-[14px] font-medium text-[#6B6A6A]">
          جارٍ التحميل...
        </span>
      </div>
    )
  }

  if (reports.length === 0) {
    /* Node 4043:133410: 0-State View */
    return (
      <div
        className="bg-white border border-[#ECECEC] rounded-xl flex flex-col items-center justify-center py-16 px-6 text-center w-full min-h-80 font-['Cairo']"
        dir="rtl"
      >
        <div className="size-16 rounded-full bg-[#F8FAFC] border border-[#ECECEC] flex items-center justify-center mb-4 text-[#111111]">
          <AlertTriangle className="w-7 h-7" />
        </div>
        <h3 className="text-[18px] font-bold text-[#111111] mb-2">
          لا توجد بلاغات
        </h3>
        <p className="text-[14px] font-medium text-[#6B6A6A] max-w-md leading-relaxed">
          ستظهر البلاغات المقدمة هنا في حال تواجدها.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 w-full font-['Cairo']" dir="rtl">
      {/* Toast Notification (Node 4043:136729) */}
      {toastMessage && (
        <div className="bg-white border border-[#15A72B] rounded-xl p-4 flex items-center justify-between gap-4 shadow-sm w-full">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#15A72B] shrink-0" />
            <span className="text-[15px] font-medium text-[#111111]">
              {toastMessage}
            </span>
          </div>
          <button
            type="button"
            onClick={() => setToastMessage(null)}
            className="text-primary font-bold text-[15px] hover:underline cursor-pointer"
          >
            إغلاق
          </button>
        </div>
      )}

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {/* Total */}
        <div className="bg-white border border-[#ECECEC] rounded-xl p-4 flex flex-col justify-between h-22 text-right">
          <span className="text-[13px] font-medium text-[#6B6A6A]">
            إجمالي البلاغات
          </span>
          <span className="text-[20px] font-bold text-[#111111]">
            {totalCount}
          </span>
        </div>

        {/* Open */}
        <div className="bg-[#EBF3FF] border border-[#BFDBFE] rounded-xl p-4 flex flex-col justify-between h-22 text-right">
          <span className="text-[13px] font-medium text-[#6B6A6A]">
            بلاغات مفتوحة
          </span>
          <span className="text-[20px] font-bold text-[#111111]">
            {openCount}
          </span>
        </div>

        {/* Closed */}
        <div className="bg-white border border-[#ECECEC] rounded-xl p-4 flex flex-col justify-between h-22 text-right">
          <span className="text-[13px] font-medium text-[#6B6A6A]">
            بلاغات مغلقة
          </span>
          <span className="text-[20px] font-bold text-[#111111]">
            {closedCount}
          </span>
        </div>
      </div>

      {/* Reports Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
        {reports.map((report) => (
          <div
            key={report.id}
            className="relative bg-white border border-[#ECECEC] rounded-xl p-4 flex flex-col justify-between gap-3 text-right"
          >
            {/* Top row: Title & Action Menu */}
            <div className="flex items-start justify-between gap-2 w-full">
              <div className="flex flex-col gap-1 min-w-0">
                <span className="text-[14px] font-bold text-[#111111] truncate">
                  {report.title} · {report.code}
                </span>
                <span className="text-[12px] font-medium text-[#6B6A6A]">
                  {report.submitter} · {report.date}
                </span>
              </div>

              {/* Action Dropdown Toggle */}
              <div className="relative shrink-0">
                {activeMenuId === report.id && (
                  <div
                    className="fixed inset-0 z-10"
                    onClick={() => setActiveMenuId(null)}
                  />
                )}
                <button
                  type="button"
                  onClick={() =>
                    setActiveMenuId((prev) =>
                      prev === report.id ? null : report.id,
                    )
                  }
                  className="size-7 flex items-center justify-center rounded-lg text-[#6B6A6A] hover:bg-[#F8FAFC] cursor-pointer"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {/* Dropdown Menu (Node 4043:130376) */}
                {activeMenuId === report.id && (
                  <div className="absolute left-0 top-8 w-36 bg-white rounded-lg border border-[#ECECEC] shadow-[0px_4px_6px_0px_rgba(130,130,130,0.2)] py-1.5 px-1 z-20 flex flex-col text-right">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedReport(report)
                        setActiveMenuId(null)
                      }}
                      className="w-full px-3 py-1.5 text-[13px] font-medium text-[#111111] hover:bg-[#F8FAFC] rounded cursor-pointer text-right"
                    >
                      عرض التفاصيل
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setReportForAssign(report)
                        setAssignDialogOpen(true)
                        setActiveMenuId(null)
                      }}
                      className="w-full px-3 py-1.5 text-[13px] font-medium text-[#111111] hover:bg-[#F8FAFC] rounded cursor-pointer text-right"
                    >
                      اسناد لمسؤول
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleCloseReport(report)
                        setActiveMenuId(null)
                      }}
                      className="w-full px-3 py-1.5 text-[13px] font-medium text-[#111111] hover:bg-[#F8FAFC] rounded cursor-pointer text-right"
                    >
                      اغلاق البلاغ
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Badges Row */}
            <div className="flex items-center gap-2 flex-wrap pt-2 border-t border-[#ECECEC]/60">
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium ${
                  statusBadgeStyles[report.status]
                }`}
              >
                {report.status}
              </span>
              {report.priority && (
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium ${
                    priorityBadgeStyles[report.priority]
                  }`}
                >
                  {report.priority}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Drawer */}
      <ReportDetailDrawer
        open={!!selectedReport}
        onClose={() => setSelectedReport(null)}
        report={selectedReport}
        onAssign={() => loadReports()}
        onCloseReport={handleCloseReport}
      />

      {/* Assign Dialog (Nodes 4043:136666, 4043:136676, 4043:136772) */}
      <AssignUserReportDialog
        open={assignDialogOpen}
        onClose={() => {
          setAssignDialogOpen(false)
          setReportForAssign(null)
        }}
        onAssignSuccess={async (admin: AdminOption) => {
          if (!reportForAssign) return
          try {
            await updateReport(reportForAssign.id, {
              assignedAdminId: admin.id,
            })
            setToastMessage(`تم إسناد البلاغ للمشرف ${admin.name} بنجاح.`)
            await loadReports()
          } catch (err) {
            console.error('Failed to assign report:', err)
            setToastMessage('حدث خطأ أثناء اسناد البلاغ.')
          }
          setReportForAssign(null)
        }}
      />
    </div>
  )
}
