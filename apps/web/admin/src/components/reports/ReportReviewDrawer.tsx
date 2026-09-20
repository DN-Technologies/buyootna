'use client'

import React from 'react'
import Image from 'next/image'
import {
  CloseIcon,
  CheckBigIcon,
} from '@/components/icons/AdminIcons'
import {
  ExternalLink,
  Phone,
  Mail,
  Building,
  MapPin,
  Maximize2,
  FileText,
  Paperclip,
} from 'lucide-react'
import { ReportItem, ReportPriority } from './types'

interface ReportReviewDrawerProps {
  report: ReportItem | null
  isOpen: boolean
  onClose: () => void
  onResolve: (id: string) => void
  onDismiss?: (id: string) => void
}

const PRIORITY_BADGE_CONFIG: Record<
  ReportPriority,
  { dot: string; text: string; label: string }
> = {
  عاجل: {
    dot: 'bg-[#BA0003]',
    text: 'text-[#9C1E28]',
    label: 'عاجل',
  },
  متوسط: {
    dot: 'bg-[#B97500]',
    text: 'text-[#B97500]',
    label: 'متوسط',
  },
  منخفضة: {
    dot: 'bg-[#344054]',
    text: 'text-[#344054]',
    label: 'منخفض',
  },
}

export function ReportReviewDrawer({
  report,
  isOpen,
  onClose,
  onResolve,
}: ReportReviewDrawerProps) {
  if (!isOpen || !report) return null

  const isResolved = report.status === 'تم حلها'
  const priorityInfo =
    PRIORITY_BADGE_CONFIG[report.priority] ?? PRIORITY_BADGE_CONFIG['متوسط']

  return (
    <div className="fixed inset-0 z-50 overflow-hidden select-none" dir="rtl">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/30 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      {/* Drawer Container (Sliding from Right matching Node 4938:6257) */}
      <div className="fixed inset-y-0 right-0 max-w-full flex pr-0">
        <div
          className="w-screen max-w-[500px] bg-white shadow-2xl flex flex-col justify-between border-l border-[#ECECEC] animate-in slide-in-from-right duration-200 relative"
          data-node-id="4938:6770"
          data-name="add user default"
        >
          {/* Header */}
          <div className="bg-white border-b border-[#ECECEC] p-5 flex items-start justify-between">
            <button
              type="button"
              onClick={onClose}
              className="size-8 flex items-center justify-center rounded-lg text-[#111111] hover:bg-[#F2F4F7] transition cursor-pointer"
            >
              <CloseIcon className="w-5 h-5" color="currentColor" />
            </button>

            <div className="flex flex-col items-end gap-1">
              <h2 className="font-['Cairo'] font-bold text-[16px] text-[#111111] text-right">
                <span>تفاصيل بلاغ رقم # {report.reportNumber}</span>
                <span className="font-normal text-[#6B6A6A]"> · </span>
                <span>{report.reason}</span>
              </h2>

              <div className="flex items-center gap-2">
                <div
                  className={`h-5 px-1.5 rounded-tl-[10px] rounded-bl-[10px] rounded-tr-[8px] flex items-center justify-center text-[12px] font-['Cairo'] font-medium ${
                    isResolved
                      ? 'bg-[rgba(18,194,129,0.1)] text-[#018B1B]'
                      : 'bg-[rgba(245,184,70,0.1)] text-[#DB9718]'
                  }`}
                >
                  {report.status}
                </div>
                <span className="text-[14px] text-[#6B6A6A] font-['Cairo']">
                  {report.createdAt}
                </span>
              </div>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex-1 overflow-y-auto px-5 py-6 space-y-6 text-right">
            {/* Submitter Card (مقدم البلاغ) */}
            <div className="bg-[#F9FAFE] p-4 rounded-lg flex flex-col gap-3">
              <span className="font-['Cairo'] font-semibold text-[13px] text-[#111111]">
                مقدم البلاغ
              </span>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="text-[#6B6A6A] hover:text-[#111111] transition cursor-pointer p-1"
                  title="عرض الحساب"
                >
                  <ExternalLink className="w-5 h-5" />
                </button>

                <div className="flex items-center gap-2.5">
                  <div className="flex flex-col items-end">
                    <span className="font-['Cairo'] font-medium text-[16px] text-[#111111]">
                      {report.submittedBy.name}
                    </span>

                    <div className="flex items-center gap-2 text-[14px] text-[#6B6A6A] font-['Cairo']">
                      {report.submittedBy.phone && (
                        <div className="flex items-center gap-1">
                          <span dir="ltr">{report.submittedBy.phone}</span>
                          <Phone className="w-3.5 h-3.5 text-[#6B6A6A]" />
                        </div>
                      )}

                      {report.submittedBy.phone && (
                        <span className="font-bold text-[#6B6A6A]">·</span>
                      )}

                      <div className="flex items-center gap-1">
                        <span className="truncate max-w-[150px]">
                          {report.submittedBy.email}
                        </span>
                        <Mail className="w-3.5 h-3.5 text-[#6B6A6A]" />
                      </div>
                    </div>
                  </div>

                  {/* Submitter Avatar */}
                  <div className="size-10 rounded-full bg-[#BEEFB9] flex items-center justify-center text-[#0F1828] font-['Cairo'] font-medium text-[15px] shrink-0">
                    {report.submittedBy.name.charAt(0)}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-b border-[#ECECEC]" />

            {/* 2x2 Information Grid */}
            <div className="space-y-4">
              <div className="flex items-center justify-between text-right">
                <div className="flex-1 flex flex-col items-end gap-1">
                  <span className="font-['Cairo'] font-semibold text-[13px] text-[#6B6A6A]">
                    ضد
                  </span>
                  <span className="font-['Cairo'] font-medium text-[14px] text-[#111111]">
                    {report.targetTitle || report.against.name}
                  </span>
                </div>

                <div className="flex-1 flex flex-col items-end gap-1">
                  <span className="font-['Cairo'] font-semibold text-[13px] text-[#6B6A6A]">
                    نوع البلاغ
                  </span>
                  <span className="font-['Cairo'] font-medium text-[14px] text-[#111111]">
                    {report.reportCategory || 'بيع'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-right">
                <div className="flex-1 flex flex-col items-end gap-1">
                  <span className="font-['Cairo'] font-semibold text-[13px] text-[#6B6A6A]">
                    الخطورة
                  </span>
                  <div className="flex items-center gap-1.5 font-['Cairo'] font-medium text-[14px]">
                    <span className={priorityInfo.text}>{priorityInfo.label}</span>
                    <span className={`size-2 rounded-full ${priorityInfo.dot}`} />
                  </div>
                </div>

                <div className="flex-1 flex flex-col items-end gap-1">
                  <span className="font-['Cairo'] font-semibold text-[13px] text-[#6B6A6A]">
                    تاريخ الارسال
                  </span>
                  <span className="font-['Cairo'] font-medium text-[14px] text-[#111111]">
                    {report.targetArea || report.createdAt}
                  </span>
                </div>
              </div>
            </div>

            <div className="border-b border-[#ECECEC]" />

            {/* Reported Entity Ad Card (الجهة المُبلغ عنها) */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  className="font-['Cairo'] font-bold text-[14px] text-[#15304D] hover:underline cursor-pointer"
                >
                  عرض الاعلان
                </button>
                <span className="font-['Cairo'] font-medium text-[14px] text-[#6B6A6A]">
                  الجهة المُبلغ عنها
                </span>
              </div>

              {/* Property Card */}
              <div className="rounded-md border border-[#ECECEC] overflow-hidden bg-white shadow-xs">
                {/* Property Image */}
                <div className="h-[160px] w-full relative bg-[#F2F4F7]">
                  <Image
                    src={
                      report.targetImage ||
                      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=80'
                    }
                    alt={report.targetTitle || 'العقار'}
                    fill
                    sizes="(max-width: 500px) 100vw, 500px"
                    className="object-cover"
                    unoptimized
                  />
                </div>

                {/* Property Details Bar */}
                <div className="p-3 bg-[#FEFEFE] space-y-2">
                  <div className="flex items-baseline justify-end gap-1 text-[#15304D]">
                    <span className="font-['Cairo'] font-semibold text-[12px]">
                      {report.targetCurrency || 'د.ك'}
                    </span>
                    <span className="font-['Cairo'] font-semibold text-[22px] leading-none">
                      {report.targetPrice || '150,000'}
                    </span>
                  </div>

                  <div className="flex items-center justify-end gap-3 text-[14px] text-[#111111] font-['Cairo']">
                    {/* Area */}
                    <div className="flex items-center gap-1">
                      <span>{report.targetArea || '200 م2'}</span>
                      <Maximize2 className="w-3.5 h-3.5 text-[#6B6A6A]" />
                    </div>

                    {/* Location */}
                    <div className="flex items-center gap-1">
                      <span>{report.targetLocation || 'شمال غرب صليبيخات'}</span>
                      <MapPin className="w-3.5 h-3.5 text-[#6B6A6A]" />
                    </div>

                    {/* Type Badge */}
                    <div className="bg-[#F5F7F9] px-2 py-1 rounded flex items-center gap-1 text-[13px] font-semibold">
                      <span>{report.targetPropertyType || 'عمارة'}</span>
                      <Building className="w-3.5 h-3.5 text-[#111111]" />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="border-b border-[#ECECEC]" />

            {/* Report Reason */}
            <div className="space-y-2">
              <span className="font-['Cairo'] font-medium text-[14px] text-[#6B6A6A] block">
                سبب البلاغ
              </span>
              <p className="font-['Cairo'] font-medium text-[14px] text-[#111111]">
                {report.reason}
              </p>
            </div>

            <div className="border-b border-[#ECECEC]" />

            {/* Full Details */}
            <div className="space-y-2">
              <span className="font-['Cairo'] font-medium text-[14px] text-[#6B6A6A] block">
                التفاصيل
              </span>
              <p className="font-['Cairo'] font-medium text-[14px] text-[#111111] leading-relaxed whitespace-pre-wrap">
                {report.description ||
                  'أرغب بالبدل في منطقة "خيران السكنية" أو "المنطقة العاشرة" • يفضل زاوية أو شارع واحد • مستعد للتفاوض مع المواقع المميزة في خيران الأرض في موقع مميز جداً بضاحية N5، قريبة من مجمع الخدمات والمسجد. مدخل ومخرج سهل جداً من الطريق الرئيسي.'}
              </p>
            </div>

            <div className="border-b border-[#ECECEC]" />

            {/* Attachments (مرفقات) */}
            <div className="space-y-2">
              <span className="font-['Cairo'] font-medium text-[14px] text-[#6B6A6A] block">
                مرفقات
              </span>

              <div className="flex items-center gap-2 flex-wrap">
                {(report.attachments || [
                  { name: 'صورة_الكهرباء.jpg', type: 'image' },
                  { name: 'تقرير_الفحص.pdf', type: 'pdf' },
                ]).map((att, idx) => (
                  <div
                    key={idx}
                    className="bg-white border border-[#E2E8F0] rounded-[12px] px-3 py-1.5 flex items-center gap-2 hover:bg-[#F8FAFC] transition cursor-pointer text-[12px] font-['Cairo'] font-medium text-[#111111]"
                  >
                    <span>{att.name}</span>
                    {att.type === 'pdf' ? (
                      <FileText className="w-3.5 h-3.5 text-[#6B6A6A]" />
                    ) : (
                      <Paperclip className="w-3.5 h-3.5 text-[#6B6A6A]" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-white border-t border-[#ECECEC] px-5 py-4 flex items-center gap-3">
            {isResolved ? (
              /* Figma Node 4940:87126: Single full-width Close button */
              <button
                type="button"
                onClick={onClose}
                className="w-full h-[46px] rounded-[24px] bg-white border border-[#E2E8F0] text-[#111111] font-['Cairo'] font-semibold text-[14px] hover:bg-[#F8FAFC] transition cursor-pointer"
                data-node-id="4940:87580"
              >
                اغلاق
              </button>
            ) : (
              /* Figma Node 4938:6257: Close + Resolve buttons */
              <>
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 h-[46px] rounded-[24px] bg-white border border-[#E2E8F0] text-[#111111] font-['Cairo'] font-semibold text-[14px] hover:bg-[#F8FAFC] transition cursor-pointer"
                  data-node-id="4938:6797"
                >
                  اغلاق
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onResolve(report.id)
                    onClose()
                  }}
                  className="flex-1 h-[48px] rounded-[24px] bg-[#15304D] text-white font-['Cairo'] font-semibold text-[14px] hover:bg-[#1c3f64] transition cursor-pointer shadow-xs flex items-center justify-center gap-2"
                  data-node-id="4938:6798"
                >
                  <span>وضع علامة تم الحل</span>
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
