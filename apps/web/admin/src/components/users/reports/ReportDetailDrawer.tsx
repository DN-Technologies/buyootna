'use client'

import { useEffect, useState } from 'react'
import { ExternalLink, X } from 'lucide-react'
import { UserReportItem } from './UserReportsTabContent'
import AssignReportModal, { Moderator } from './AssignReportModal'
import ReportSuccessToast from './ReportSuccessToast'
import { updateReport } from '@/lib/admin-reports'

export interface ReportDetailDrawerProps {
  open: boolean
  onClose: () => void
  report: UserReportItem | null
  onAssign?: (report: UserReportItem) => void
  onCloseReport?: (report: UserReportItem) => void
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

export default function ReportDetailDrawer({
  open,
  onClose,
  report,
  onAssign,
  onCloseReport,
}: ReportDetailDrawerProps) {
  const [assignModalOpen, setAssignModalOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', onKeyDown)
    }
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open || !report) return null

  const isClosed = report.status === 'مغلقة'

  const handleAssignModerator = async (moderator: Moderator) => {
    try {
      await updateReport(report.id, { assignedAdminId: moderator.id })
      onAssign?.(report)
      setToastMessage(`تم إسناد البلاغ للمشرف ${moderator.name} بنجاح.`)
    } catch (err) {
      console.error('Failed to assign report:', err)
      setToastMessage('حدث خطأ أثناء اسناد البلاغ.')
    }
    setTimeout(() => setToastMessage(null), 5000)
  }

  const handleCloseReportAction = () => {
    onCloseReport?.(report)
    setToastMessage('تم وضع علامة تم الحل (مغلق) للبلاغ بنجاح.')
    setTimeout(() => setToastMessage(null), 5000)
  }

  return (
    <div className="fixed inset-0 z-50 font-['Cairo'] flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Slide-over Drawer Panel */}
      <div
        className="relative bg-white w-full max-w-lg h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto text-right"
        dir="rtl"
      >
        {/* Top Header */}
        <div className="p-6 border-b border-[#ECECEC] flex flex-col gap-3">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-[16px] font-bold text-[#111111]">
              بلاغ رقم # {report.code} · {report.title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="size-8 flex items-center justify-center rounded-full text-[#6B6A6A] hover:bg-[#F1F5F9] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center w-full flex-wrap gap-2">
            <span className="text-[12px] font-medium text-[#6B6A6A]">
              {report.submitter} · {report.date}
            </span>
            <div className="flex items-center gap-1.5">
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
        </div>

        {/* Drawer Body Content */}
        <div className="p-6 flex flex-col gap-6 flex-1 text-right">
          {/* Section 1: Submitter Info */}
          <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-xl p-4 flex flex-col gap-2">
            <span className="text-[12px] font-medium text-[#6B6A6A]">
              مقدم البلاغ
            </span>
            <div className="flex items-center justify-between gap-3 w-full">
              <div className="flex items-center gap-3">
                <div className="size-10 rounded-full bg-[#D1FAE5] text-[#059669] font-bold text-[15px] flex items-center justify-center shrink-0">
                  م
                </div>
                <div className="flex flex-col gap-0.5">
                  <span className="text-[14px] font-bold text-[#111111]">
                    {report.submitter}
                  </span>
                  <span className="text-[12px] font-medium text-[#6B6A6A]">
                    {[report.submitterEmail, report.submitterPhone]
                      .filter(Boolean)
                      .join(' · ') || '—'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => alert(`الانتقال إلى ملف ${report.submitter}`)}
                className="text-[#6B6A6A] hover:text-primary p-1 cursor-pointer"
                title="عرض ملف المستخدم"
              >
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Section 2: Reason */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-[#6B6A6A]">
              سبب البلاغ
            </span>
            <span className="text-[14px] font-bold text-[#111111]">
              {report.title}
            </span>
          </div>

          {/* Section 3: Details */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-[#6B6A6A]">
              التفاصيل
            </span>
            <p className="text-[13px] font-medium text-[#111111] leading-relaxed bg-[#F8FAFC] p-3.5 rounded-xl border border-[#ECECEC]">
              {report.details || 'لا توجد تفاصيل إضافية.'}
            </p>
          </div>

          {/* No attachments section: the Report model has no attachments
              field yet -- there is nothing real to render here. */}
        </div>

        {/* Footer Actions (Node 4043:133626) */}
        {!isClosed && (
          <div className="p-6 border-t border-[#ECECEC] flex items-center gap-3 bg-white">
            <button
              type="button"
              onClick={() => setAssignModalOpen(true)}
              className="h-11 w-full px-6 bg-primary hover:bg-[#0F2238] text-white font-bold text-[14px] rounded-xl transition-colors cursor-pointer"
            >
              اسناد لمسؤول
            </button>
            <button
              type="button"
              onClick={handleCloseReportAction}
              className="h-11 w-full px-6 bg-white border border-[#ECECEC] hover:bg-[#F8FAFC] text-[#111111] font-bold text-[14px] rounded-xl transition-colors cursor-pointer"
            >
              اغلاق البلاغ
            </button>
          </div>
        )}
      </div>

      {/* Assign Report Modal */}
      {assignModalOpen && (
        <AssignReportModal
          isOpen={assignModalOpen}
          onClose={() => setAssignModalOpen(false)}
          onAssign={handleAssignModerator}
        />
      )}

      {/* Toast Notification */}
      {toastMessage && (
        <ReportSuccessToast
          message={toastMessage}
          onUndo={() => alert('تم التراجع عن الإجراء بنجاح.')}
          onDismiss={() => setToastMessage(null)}
        />
      )}
    </div>
  )
}
