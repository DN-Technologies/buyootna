'use client'

import React from 'react'
import { CloseIcon, FileArrowUpIcon } from '@/components/icons/AdminIcons'
import { AdminDashboardPendingVerification } from '@/lib/admin-dashboard'

export interface ReviewVerificationDrawerProps {
  isOpen: boolean
  onClose: () => void
  request: AdminDashboardPendingVerification | null
  onApprove: (request: AdminDashboardPendingVerification) => void
  onRequestEdit?: (request: AdminDashboardPendingVerification) => void
  onReject?: (request: AdminDashboardPendingVerification) => void
}

const TYPE_BADGE_STYLES: Record<string, { bg: string; color: string }> = {
  شركة: { bg: 'bg-[#fffaeb]', color: 'text-[#93370d]' },
  'مكتب عقاري': { bg: 'bg-[#f2f4f7]', color: 'text-[#344054]' },
}

export default function ReviewVerificationDrawer({
  isOpen,
  onClose,
  request,
  onApprove,
  onRequestEdit,
  onReject,
}: ReviewVerificationDrawerProps) {
  if (!isOpen || !request) return null

  const isOffice = request.type === 'مكتب عقاري'
  const badgeStyle =
    TYPE_BADGE_STYLES[request.type] ?? TYPE_BADGE_STYLES['مكتب عقاري']

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none" dir="rtl">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container */}
      <div className="fixed inset-y-0 right-0 max-w-full flex">
        <div
          className="w-125 max-w-[100vw] bg-white shadow-2xl flex flex-col justify-between z-10 animate-in slide-in-from-right duration-300"
          data-node-id="2734:152868"
          data-name="add user default"
        >
          {/* Top Section */}
          <div className="flex flex-col flex-1 overflow-y-auto">
            {/* Drawer Header */}
            <div className="px-6 py-5 border-b border-[#ECECEC] flex items-center justify-between">
              <div className="flex flex-col gap-1 text-right">
                <h2 className="font-['Cairo'] font-bold text-[18px] text-[#111111] leading-tight">
                  مراجعة طلب التوثيق
                </h2>
                <div className="flex items-center gap-2 mt-0.5">
                  <span className="font-['Cairo'] font-medium text-[12px] text-[#6b6a6a]">
                    {request.name} · منذ ساعة
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-['Cairo'] font-semibold ${badgeStyle.bg} ${badgeStyle.color}`}
                  >
                    {request.type}
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full flex items-center justify-center text-[#6B6A6A] hover:text-[#111111] hover:bg-[#F9FAFB] transition cursor-pointer"
              >
                <CloseIcon className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content Fields */}
            <div className="px-6 py-6 flex flex-col gap-5">
              {/* License Number */}
              <div className="flex flex-col gap-1.5 text-right">
                <span className="font-['Cairo'] font-medium text-[12px] text-[#6b6a6a]">
                  رقم الرخصة
                </span>
                <span className="font-['Cairo'] font-bold text-[15px] text-[#111111]">
                  74978930863
                </span>
              </div>

              <div className="h-px bg-[#ECECEC] w-full" />

              {/* License Activity */}
              <div className="flex flex-col gap-1.5 text-right">
                <span className="font-['Cairo'] font-medium text-[12px] text-[#6b6a6a]">
                  نشاط الرخصة
                </span>
                <span className="font-['Cairo'] font-bold text-[15px] text-[#111111]">
                  {isOffice ? 'تنفيذ وتشطيب' : 'ــــــــ'}
                </span>
              </div>

              <div className="h-px bg-[#ECECEC] w-full" />

              {/* License Expiry Date */}
              <div className="flex flex-col gap-1.5 text-right">
                <span className="font-['Cairo'] font-medium text-[12px] text-[#6b6a6a]">
                  تاريخ انتهاء الرخصة
                </span>
                <span className="font-['Cairo'] font-bold text-[15px] text-[#111111]">
                  17 مارس 2028
                </span>
              </div>

              <div className="h-px bg-[#ECECEC] w-full" />

              {/* License Image / Upload Dropzone */}
              <div className="flex flex-col gap-2 text-right">
                <span className="font-['Cairo'] font-medium text-[12px] text-[#6b6a6a]">
                  صورة الرخصة
                </span>
                <div className="border-2 border-dashed border-[#D0D5DD] bg-[#F9FAFB]/60 hover:bg-[#F9FAFB] rounded-xl p-6 flex flex-col items-center justify-center gap-2 text-center transition cursor-pointer group">
                  <div className="w-10 h-10 rounded-full bg-white shadow-xs flex items-center justify-center text-primary group-hover:scale-105 transition">
                    <FileArrowUpIcon className="w-5 h-5" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="font-['Cairo'] font-bold text-[14px] text-primary group-hover:underline">
                      اضغط هنا لرفع صورة
                    </span>
                    <span className="font-['Cairo'] font-normal text-[11px] text-[#6b6a6a]">
                      الصيغ المدعومة: SVG, JPG, PNG (بحد أقصى 10 ميجا لكل ملف)
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Sticky Bottom Actions */}
          <div
            className="border-t border-[#ECECEC] px-5 py-4 flex items-center gap-3 bg-white"
            data-node-id="2734:152891"
          >
            {/* Primary Action: اعتماد التوثيق */}
            <button
              type="button"
              onClick={() => onApprove(request)}
              className="flex-1 h-11.5 bg-primary hover:bg-primary/90 text-white rounded-3xl font-['Cairo'] font-semibold text-[14px] flex items-center justify-center transition cursor-pointer"
            >
              اعتماد التوثيق
            </button>

            {/* Secondary Action: طلب تعديل */}
            <button
              type="button"
              onClick={() => onRequestEdit?.(request)}
              className="flex-1 h-11.5 bg-white border border-[#E2E8F0] hover:bg-[#F9FAFB] text-[#111111] rounded-3xl font-['Cairo'] font-semibold text-[14px] flex items-center justify-center transition cursor-pointer"
            >
              طلب تعديل
            </button>

            {/* Danger Action: رفض الطلب */}
            <button
              type="button"
              onClick={() => onReject?.(request)}
              className="flex-1 h-11.5 bg-white border border-[#9C1E28] hover:bg-red-50/50 text-[#9C1E28] rounded-3xl font-['Cairo'] font-semibold text-[14px] flex items-center justify-center transition cursor-pointer"
            >
              رفض الطلب
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
