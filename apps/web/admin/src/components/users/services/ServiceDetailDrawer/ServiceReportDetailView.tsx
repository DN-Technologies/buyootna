'use client'

import { ExternalLink, FileText } from 'lucide-react'
import type { ReportItem } from './types'

interface ServiceReportDetailViewProps {
  report: ReportItem
  onAssign: () => void
  onCloseReport: () => void
  onDeleteService: () => void
}

export default function ServiceReportDetailView({
  report,
  onAssign,
  onCloseReport,
  onDeleteService,
}: ServiceReportDetailViewProps) {
  return (
    /* Report Sub-view (Figma Node 4043:148661) */
    <div className="flex flex-col gap-6 text-right">
      {/* Sub-view Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h4 className="font-bold text-[16px] text-[#111111]">
          بلاغ #{report.code} · {report.title}
        </h4>
        <div className="flex items-center gap-1.5">
          <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#047857] text-[12px] font-medium">
            مفتوح
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-[#FEF9C3] text-[#854D0E] text-[12px] font-medium">
            متوسط
          </span>
        </div>
      </div>

      {/* Submitter Box */}
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
                {report.reporterName}
              </span>
              <span className="text-[12px] font-medium text-[#6B6A6A]">
                {report.reporterEmail} · {report.reporterPhone}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => alert(`الانتقال إلى ملف ${report.reporterName}`)}
            className="text-[#6B6A6A] hover:text-primary p-1 cursor-pointer"
            title="عرض ملف المستخدم"
          >
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Reason */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[12px] font-medium text-[#6B6A6A]">
          سبب البلاغ
        </span>
        <span className="text-[14px] font-bold text-[#111111]">
          {report.reason}
        </span>
      </div>

      {/* Details */}
      <div className="flex flex-col gap-1.5">
        <span className="text-[12px] font-medium text-[#6B6A6A]">
          التفاصيل
        </span>
        <p className="text-[13px] font-medium text-[#111111] leading-relaxed bg-[#F8FAFC] p-3.5 rounded-xl border border-[#ECECEC]">
          {report.details}
        </p>
      </div>

      {/* Attachments */}
      {report.attachments.length > 0 && (
        <div className="flex flex-col gap-2">
          <span className="text-[12px] font-medium text-[#6B6A6A]">
            المرفقات
          </span>
          <div className="flex items-center gap-2 flex-wrap">
            {report.attachments.map((att, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => alert(`معاينة ${att.name}`)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#F8FAFC] border border-[#ECECEC] text-[13px] font-medium text-[#111111] hover:bg-[#F1F5F9] transition-colors cursor-pointer"
              >
                <FileText className="w-4 h-4 text-[#6B6A6A]" />
                <span>{att.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sub-view Action Buttons */}
      <div className="flex items-center gap-3 pt-4 border-t border-[#ECECEC]">
        <button
          type="button"
          onClick={onAssign}
          className="h-11 w-full px-4 bg-primary hover:bg-[#0F2238] text-white font-bold text-[14px] rounded-xl transition-colors cursor-pointer"
        >
          اسناد لمسؤول
        </button>
        <button
          type="button"
          onClick={onCloseReport}
          className="h-11 w-full px-4 bg-white border border-[#ECECEC] hover:bg-[#F8FAFC] text-[#111111] font-bold text-[14px] rounded-xl transition-colors cursor-pointer"
        >
          اغلاق البلاغ
        </button>
        <button
          type="button"
          onClick={onDeleteService}
          className="h-11 w-full px-4 bg-white border border-[#9C1E28] hover:bg-red-50 text-[#9C1E28] font-bold text-[14px] rounded-xl transition-colors cursor-pointer"
        >
          حذف الخدمة
        </button>
      </div>
    </div>
  )
}
