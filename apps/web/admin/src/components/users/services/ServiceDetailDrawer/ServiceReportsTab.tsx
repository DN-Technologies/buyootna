'use client'

import { RefObject } from 'react'
import {
  AlertTriangle,
  CheckCircle,
  FileText,
  MoreVertical,
  UserCheck,
} from 'lucide-react'
import type { ReportItem } from './types'

interface ServiceReportsTabProps {
  reports: ReportItem[]
  activeMenuId: string | null
  menuRef: RefObject<HTMLDivElement | null>
  onToggleMenu: (id: string | null) => void
  onSelectReport: (report: ReportItem) => void
  onAssign: () => void
  onCloseReport: () => void
}

export default function ServiceReportsTab({
  reports,
  activeMenuId,
  menuRef,
  onToggleMenu,
  onSelectReport,
  onAssign,
  onCloseReport,
}: ServiceReportsTabProps) {
  if (reports.length === 0) {
    /* Empty Reports Graphic (Figma Node 4043:148323) */
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 gap-3 my-auto">
        <div className="size-16 rounded-2xl bg-[#F8FAFC] border border-[#ECECEC] flex items-center justify-center text-[#111111]">
          <AlertTriangle className="w-8 h-8 stroke-[1.5]" />
        </div>
        <h4 className="font-bold text-[18px] text-[#111111] mt-2">
          لا توجد أي بلاغات للخدمة
        </h4>
      </div>
    )
  }

  const openReportsCount = reports.filter((r) => r.status === 'open').length
  const closedReportsCount = reports.filter((r) => r.status === 'closed').length

  return (
    /* Reports Tab (Figma Node 4043:148323) */
    <div className="flex flex-col gap-5">
      {/* Summary Strip */}
      <div className="grid grid-cols-3 gap-3 text-center">
        <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-xl p-3 flex flex-col gap-1">
          <span className="text-[12px] text-[#6B6A6A]">إجمالي البلاغات</span>
          <span className="font-bold text-[16px] text-[#111111]">
            {reports.length}
          </span>
        </div>
        <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-xl p-3 flex flex-col gap-1">
          <span className="text-[12px] text-[#6B6A6A]">بلاغات مفتوحة</span>
          <span className="font-bold text-[16px] text-[#047857]">
            {openReportsCount}
          </span>
        </div>
        <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-xl p-3 flex flex-col gap-1">
          <span className="text-[12px] text-[#6B6A6A]">بلاغات مغلقة</span>
          <span className="font-bold text-[16px] text-[#6B6A6A]">
            {closedReportsCount}
          </span>
        </div>
      </div>

      {/* Reports Cards List */}
      <div className="space-y-3">
        {reports.map((rep) => {
          const isMenuOpen = activeMenuId === rep.id

          return (
            <div
              key={rep.id}
              className="bg-white border border-[#ECECEC] rounded-xl p-4 flex items-center justify-between text-right relative shadow-xs"
            >
              <div className="flex flex-col gap-1">
                <h5 className="font-bold text-[14px] text-[#111111]">
                  {rep.title} · #{rep.code}
                </h5>
                <p className="text-[12px] text-[#6B6A6A]">
                  {rep.reporterName} · {rep.timeAgo}
                </p>
                <div className="flex items-center gap-2 pt-1">
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium ${
                      rep.status === 'open'
                        ? 'bg-[#ECFDF5] text-[#047857]'
                        : 'bg-[#F8FAFC] text-[#6B6A6A]'
                    }`}
                  >
                    {rep.status === 'open' ? 'مفتوحة' : 'مغلقة'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#FEF9C3] text-[#854D0E] text-[11px] font-medium">
                    {rep.priority === 'medium' ? 'متوسط' : 'منخفضة'}
                  </span>
                </div>
              </div>

              {/* Report Card Popover Options */}
              <div className="relative" ref={menuRef}>
                <button
                  type="button"
                  onClick={() => onToggleMenu(isMenuOpen ? null : rep.id)}
                  className="p-1.5 text-[#6B6A6A] hover:text-[#111111] rounded-md hover:bg-slate-100 cursor-pointer"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {isMenuOpen && (
                  <div className="absolute left-0 mt-1 w-44 bg-white border border-[#ECECEC] rounded-xl shadow-lg py-1 z-30 text-right">
                    <button
                      type="button"
                      onClick={() => {
                        onToggleMenu(null)
                        onSelectReport(rep)
                      }}
                      className="w-full px-3 py-2 text-[13px] text-[#111111] hover:bg-slate-50 flex items-center justify-end gap-2 font-medium"
                    >
                      <span>عرض التفاصيل</span>
                      <FileText className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onToggleMenu(null)
                        onAssign()
                      }}
                      className="w-full px-3 py-2 text-[13px] text-[#111111] hover:bg-slate-50 flex items-center justify-end gap-2 font-medium"
                    >
                      <span>اسناد لمسؤول</span>
                      <UserCheck className="w-4 h-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onToggleMenu(null)
                        onCloseReport()
                      }}
                      className="w-full px-3 py-2 text-[13px] text-[#111111] hover:bg-slate-50 flex items-center justify-end gap-2 font-medium"
                    >
                      <span>إغلاق البلاغ</span>
                      <CheckCircle className="w-4 h-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
