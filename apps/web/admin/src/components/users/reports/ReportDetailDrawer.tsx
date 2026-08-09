'use client'

import { useEffect } from 'react'
import { ExternalLink, FileText, X } from 'lucide-react'
import { UserReportItem } from './UserReportsTabContent'

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
                    mohamedelgareh@gmail.com · +96568690396
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
              معلومات مضللة
            </span>
          </div>

          {/* Section 3: Details */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[12px] font-medium text-[#6B6A6A]">
              التفاصيل
            </span>
            <p className="text-[13px] font-medium text-[#111111] leading-relaxed bg-[#F8FAFC] p-3.5 rounded-xl border border-[#ECECEC]">
              أرغب بالبدل في منطقة &quot;خيران السكنية&quot; أو &quot;المنطقة
              العاشرة&quot; ▪ يفضل زاوية أو شارع واحد ▪ مستعد للتفاوض مع المواقع
              المميزة في خيران الأرض في موقع مميز جداً بضاحية N5، قريبة من مجمع
              الخدمات والمسجد، مدخل ومخرج سهل جداً من الطريق الرئيسي، الرغبة
              جادة جداً للبدل في خيران السكنية لدواعي القرب من الأهل.
            </p>
          </div>

          {/* Section 4: Attachments */}
          <div className="flex flex-col gap-2">
            <span className="text-[12px] font-medium text-[#6B6A6A]">
              المرفقات
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              <button
                type="button"
                onClick={() => alert('معاينة تقرير_الفحص.pdf')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#ECECEC] text-[13px] font-medium text-[#111111] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#6B6A6A]" />
                <span>تقرير_الفحص.pdf</span>
              </button>

              <button
                type="button"
                onClick={() => alert('معاينة صورة_الكهرباء.jpg')}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#ECECEC] text-[13px] font-medium text-[#111111] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#6B6A6A]" />
                <span>صورة_الكهرباء.jpg</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Actions (Node 4043:133626) */}
        {!isClosed && (
          <div className="p-6 border-t border-[#ECECEC] flex items-center gap-3 bg-white">
            <button
              type="button"
              onClick={() => {
                onAssign?.(report)
                onClose()
              }}
              className="h-11 w-full px-6 bg-primary hover:bg-[#0F2238] text-white font-bold text-[14px] rounded-xl transition-colors cursor-pointer"
            >
              اسناد لمسؤول
            </button>
            <button
              type="button"
              onClick={() => {
                onCloseReport?.(report)
                onClose()
              }}
              className="h-11 w-full px-6 bg-white border border-[#ECECEC] hover:bg-[#F8FAFC] text-[#111111] font-bold text-[14px] rounded-xl transition-colors cursor-pointer"
            >
              اغلاق البلاغ
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
