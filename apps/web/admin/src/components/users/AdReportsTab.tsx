'use client'

import { useState } from 'react'
import { Mail, MoreVertical, Paperclip, Smartphone, X } from 'lucide-react'

// Fully mock data: there is no Report model anywhere in the backend (for
// ads or otherwise), so this tab is a static visual mockup, matching the
// policy agreed for this tab. All actions below are placeholders.
export interface MockReport {
  id: string
  code: string
  reason: string
  reporterName: string
  reporterPhone: string
  reporterEmail: string
  timeAgo: string
  priority: 'متوسط' | 'منخفضة'
  status: 'مفتوحة' | 'مغلقة'
  details: string
  attachments: string[]
}

export const initialMockReports: MockReport[] = [
  {
    id: '1',
    code: 'RP-1025',
    reason: 'معلومات غير صحيحة',
    reporterName: 'محمد المالك',
    reporterPhone: '+96568690396',
    reporterEmail: 'mohamedelgareh@gmail.com',
    timeAgo: 'منذ 47 دقيقة',
    priority: 'متوسط',
    status: 'مفتوحة',
    details:
      'أرغب بالبدل في منطقة "خيران السكنية" أو "المنطقة العاشرة" • يفضل زاوية أو شارع واحد • مستعد للتفاوض مع المواقع المميزة في خيران الأرض في موقع مميز جداً بضاحية N5، قريبة من مجمع الخدمات والمسجد. مدخل ومخرج سهل جداً من الطريق الرئيسي.',
    attachments: ['صورة_الكهرباء.jpg', 'تقرير_الفحص.pdf'],
  },
  {
    id: '2',
    code: 'RP-1025',
    reason: 'معلومات غير صحيحة',
    reporterName: 'محمد المالك',
    reporterPhone: '+96568690396',
    reporterEmail: 'mohamedelgareh@gmail.com',
    timeAgo: 'منذ 47 دقيقة',
    priority: 'منخفضة',
    status: 'مفتوحة',
    details: 'معلومات مضللة حول مساحة العقار المعروضة في الإعلان.',
    attachments: [],
  },
  {
    id: '3',
    code: 'RP-1025',
    reason: 'معلومات غير صحيحة',
    reporterName: 'محمد المالك',
    reporterPhone: '+96568690396',
    reporterEmail: 'mohamedelgareh@gmail.com',
    timeAgo: 'منذ 47 دقيقة',
    priority: 'متوسط',
    status: 'مغلقة',
    details: 'تم التحقق من المعلومات ولا توجد مخالفة.',
    attachments: [],
  },
]

const priorityStyles: Record<MockReport['priority'], string> = {
  متوسط: 'bg-[#FFF9DA] text-[#B97500]',
  منخفضة: 'bg-[#EDEDED] text-[#344054]',
}

const statusStyles: Record<MockReport['status'], string> = {
  مفتوحة: 'bg-[#FEF3F2] text-[#9C1E28]',
  مغلقة: 'bg-[#F4F8EE] text-[#111111]',
}

function notImplemented(action: string) {
  alert(`"${action}" — لم يتم تفعيل هذا الإجراء بعد.`)
}

function ReportRow({
  report,
  onViewDetails,
  onCloseReport,
  onAssignReport,
}: {
  report: MockReport
  onViewDetails: () => void
  onCloseReport: (report: MockReport) => void
  onAssignReport: (report: MockReport) => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <div className="bg-white border border-[#ECECEC] rounded-md p-3 w-full relative">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 flex flex-col gap-1.5 text-right min-w-0">
          <p className="text-[14px] font-medium text-[#111111] truncate w-full">
            {report.reason} · {report.code} #
          </p>
          <p className="text-[12px] text-[#6B6A6A]">
            {report.reporterName} · {report.timeAgo}
          </p>
          <div className="flex items-center gap-2">
            <span
              className={`h-5 flex items-center px-2 rounded-full text-[12px] ${statusStyles[report.status]}`}
            >
              {report.status}
            </span>
            <span
              className={`h-5 flex items-center px-2 rounded-full text-[12px] ${priorityStyles[report.priority]}`}
            >
              {report.priority}
            </span>
          </div>
        </div>

        <div className="relative shrink-0">
          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <div className="absolute left-0 top-8 w-40 bg-white border border-[#ECECEC] rounded-lg shadow-lg py-1 z-20 text-right">
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onViewDetails()
                  }}
                  className="w-full px-3 py-2 text-[13px] text-[#111111] text-start hover:bg-[#F1F5F9] font-medium cursor-pointer"
                >
                  عرض التفاصيل
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setMenuOpen(false)
                    onAssignReport(report)
                  }}
                  className="w-full px-3 py-2 text-[13px] text-[#111111] text-start hover:bg-[#F1F5F9] font-medium cursor-pointer"
                >
                  اسناد لمسؤول
                </button>
                <button
                  type="button"
                  disabled={report.status === 'مغلقة'}
                  onClick={() => {
                    setMenuOpen(false)
                    onCloseReport(report)
                  }}
                  className="w-full px-3 py-2 text-[13px] text-[#111111] text-start hover:bg-[#F1F5F9] font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-transparent"
                >
                  اغلاق البلاغ
                </button>
              </div>
            </>
          )}
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            className="p-1 rounded-full text-[#6B6A6A] hover:bg-[#F1F5F9] cursor-pointer"
          >
            <MoreVertical className="w-4.5 h-4.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function ReportDetailView({
  report,
  onBack,
  onCloseReport,
  onAssignReport,
}: {
  report: MockReport
  onBack: () => void
  onCloseReport: (report: MockReport) => void
  onAssignReport: (report: MockReport) => void
}) {
  return (
    <div className="flex flex-col w-full font-['Cairo']" dir="rtl">
      <div className="flex gap-4 items-start p-5 w-full">
        <div className="flex-1 flex flex-col gap-1 min-w-0">
          <p className="text-[16px] font-bold text-[#111111] text-right">
            بلاغ # {report.code} · {report.reason}
          </p>
          <div className="flex items-center gap-2">
            <span
              className={`h-5 flex items-center px-2 rounded-full text-[12px] ${priorityStyles[report.priority]}`}
            >
              {report.priority}
            </span>
            <span
              className={`h-5 flex items-center px-2 rounded-full text-[12px] ${statusStyles[report.status]}`}
            >
              {report.status}
            </span>
          </div>
        </div>
        <button
          type="button"
          onClick={onBack}
          className="size-8 flex items-center justify-center rounded-full text-[#6B6A6A] hover:bg-[#F1F5F9] shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="flex flex-col gap-6 px-5 pb-5 w-full">
        <div className="bg-[#F9FAFE] rounded-lg p-4 flex flex-col gap-3 w-full">
          <p className="text-[13px] font-semibold text-[#111111]">
            مقدم البلاغ
          </p>
          <div className="flex items-center gap-3 w-full">
            <div className="size-10 rounded-full bg-[#BEEFB9] flex items-center justify-center text-[#0F1828] text-[14px] font-medium shrink-0">
              {report.reporterName.charAt(0)}
            </div>
            <div className="flex flex-col gap-1.5 text-right">
              <p className="text-[16px] font-medium text-[#111111]">
                {report.reporterName}
              </p>
              <div className="flex items-center gap-3 text-[14px] text-[#6B6A6A]">
                <span className="flex items-center gap-1">
                  <Mail className="w-4 h-4" />
                  {report.reporterEmail}
                </span>
                <span className="flex items-center gap-1">
                  <Smartphone className="w-4 h-4" />
                  {report.reporterPhone}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2.5 w-full border-t border-[#ECECEC] pt-5">
          <p className="text-[13px] font-semibold text-[#6B6A6A]">سبب البلاغ</p>
          <p className="text-[14px] font-medium text-[#111111]">
            {report.reason}
          </p>
        </div>

        <div className="flex flex-col gap-2.5 w-full border-t border-[#ECECEC] pt-5">
          <p className="text-[13px] font-semibold text-[#6B6A6A]">التفاصيل</p>
          <p className="text-[14px] font-medium text-[#111111] text-right">
            {report.details}
          </p>
        </div>

        {report.attachments.length > 0 && (
          <div className="flex flex-col gap-2.5 w-full border-t border-[#ECECEC] pt-5">
            <p className="text-[13px] font-semibold text-[#6B6A6A]">مرفقات</p>
            <div className="flex items-center gap-2 flex-wrap w-full">
              {report.attachments.map((file) => (
                <span
                  key={file}
                  className="h-9 flex items-center gap-2 px-3 rounded-full border border-[#E2E8F0] bg-white text-[12px] font-medium text-[#111111]"
                >
                  {file}
                  <Paperclip className="w-3.5 h-3.5" />
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-[#ECECEC] flex items-center gap-3 px-5 py-4 w-full">
        <button
          type="button"
          onClick={() => notImplemented('حذف الاعلان')}
          className="flex-1 h-11.5 flex items-center justify-center rounded-full border border-[#9C1E28] text-[#9C1E28] text-[14px] font-semibold cursor-pointer"
        >
          حذف الاعلان
        </button>
        <button
          type="button"
          disabled={report.status === 'مغلقة'}
          onClick={() => onCloseReport(report)}
          className="flex-1 h-11.5 flex items-center justify-center rounded-full border border-[#E2E8F0] text-[#111111] text-[14px] font-semibold cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          اغلاق البلاغ
        </button>
        <button
          type="button"
          onClick={() => onAssignReport(report)}
          className="flex-1 h-11.5 flex items-center justify-center rounded-full bg-primary text-white text-[14px] font-semibold cursor-pointer"
        >
          اسناد لمسؤل
        </button>
      </div>
    </div>
  )
}

export function ReportsList({
  reports,
  onSelect,
  onCloseReport,
  onAssignReport,
}: {
  reports: MockReport[]
  onSelect: (report: MockReport) => void
  onCloseReport: (report: MockReport) => void
  onAssignReport: (report: MockReport) => void
}) {
  const closedCount = reports.filter((r) => r.status === 'مغلقة').length
  const openCount = reports.filter((r) => r.status === 'مفتوحة').length

  return (
    <div
      className="flex flex-col gap-4 items-center w-full px-5 py-5 font-['Cairo']"
      dir="rtl"
    >
      <div className="border border-[#ECECEC] rounded-md flex items-stretch w-full">
        {[
          { label: 'بلاغات مغلقة', value: closedCount },
          { label: 'بلاغات مفتوحة', value: openCount },
          { label: 'إجمالي البلاغات', value: reports.length },
        ].map((stat, idx) => (
          <div
            key={stat.label}
            className={`flex-1 flex flex-col gap-2.5 px-5 py-2.5 ${
              idx > 0 ? 'border-r border-[#ECECEC]' : ''
            }`}
          >
            <p className="text-[13px] font-medium text-[#6B6A6A]">
              {stat.label}
            </p>
            <p className="text-[14px] font-bold text-[#111111]">{stat.value}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-3 w-full">
        {reports.map((report) => (
          <ReportRow
            key={report.id}
            report={report}
            onViewDetails={() => onSelect(report)}
            onCloseReport={onCloseReport}
            onAssignReport={onAssignReport}
          />
        ))}
      </div>
    </div>
  )
}
