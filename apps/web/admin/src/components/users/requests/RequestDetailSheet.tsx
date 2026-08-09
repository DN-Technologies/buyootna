'use client'

import { useEffect } from 'react'
import { ExternalLink, Paperclip, X } from 'lucide-react'
import type { UserRequestItem } from './UserRequestsTabContent'

export interface RequestDetailSheetProps {
  request: UserRequestItem
  onClose: () => void
}

const statusBadgeStyles: Record<UserRequestItem['status'], string> = {
  'تم الرد': 'bg-[#EBF3FF] text-[#2563EB]',
  'قيد الانتظار': 'bg-[#FEF6E6] text-[#D97706]',
  مقبولة: 'bg-[#EAF8F1] text-[#018B1B]',
}

export default function RequestDetailSheet({
  request,
  onClose,
}: RequestDetailSheetProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', onKeyDown)
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  // Contextual mock data matching Figma nodes 4043:133841, 4043:134134, and 4043:134751
  const companies =
    request.type === 'خاص'
      ? [{ name: 'شركة المستقبل للمقاولات والبناء' }]
      : request.offersCount && request.offersCount >= 3
        ? [
            { name: 'شركة المستقبل للمقاولات والبناء' },
            { name: 'شركة المنار' },
            { name: 'شركة دار العقار الحديث' },
          ]
        : request.offersCount && request.offersCount > 0
          ? [
              { name: 'شركة المستقبل للمقاولات والبناء' },
              { name: 'شركة دار العقار الحديث' },
            ]
          : []

  const attachments = ['تقرير_الفحص.pdf', 'صورة_الكهرباء.jpg']

  return (
    <div className="fixed inset-0 z-50 font-['Cairo']">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Drawer */}
      <div className="absolute inset-y-0 right-0 w-full max-w-lg bg-white shadow-2xl flex flex-col" dir="rtl">
        {/* Header */}
        <div className="border-b border-[#ECECEC] flex gap-4 items-start p-5 w-full">
          <div className="flex-1 flex flex-col gap-1.5 min-w-0 text-right">
            <p className="text-[16px] font-bold text-[#111111] truncate w-full">
              {request.title} · {request.code}
            </p>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[13px] text-[#6B6A6A]">15 يناير 2024</span>
              <span
                className={`h-5 flex items-center px-2 rounded-full text-[12px] font-medium ${
                  statusBadgeStyles[request.status]
                }`}
              >
                {request.status}
              </span>
              <span className="h-5 flex items-center px-2 rounded-full text-[12px] font-medium bg-[#F1F5F9] text-[#6B6A6A]">
                {request.type}
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-full text-[#6B6A6A] hover:bg-[#F1F5F9] shrink-0 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5 flex flex-col gap-6 text-right">
          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-y-4 gap-x-6 border-b border-[#ECECEC] pb-5">
            <div className="flex flex-col gap-1">
              <span className="text-[13px] font-medium text-[#6B6A6A]">
                مجال التخصص
              </span>
              <span className="text-[14px] font-semibold text-[#111111]">
                مقاولات
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[13px] font-medium text-[#6B6A6A]">
                نوع الخدمة
              </span>
              <span className="text-[14px] font-semibold text-[#111111]">
                فحص هندسي
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[13px] font-medium text-[#6B6A6A]">
                نطاق السعر
              </span>
              <span className="text-[14px] font-semibold text-[#111111]">
                850,000 د.ك - 850,000 د.ك
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-[13px] font-medium text-[#6B6A6A]">
                الموقع
              </span>
              <span className="text-[14px] font-semibold text-[#111111]">
                السالمية، شارع 2، بناية 10، شقة 4
              </span>
            </div>
            {request.type === 'عام' && (
              <div className="flex flex-col gap-1">
                <span className="text-[13px] font-medium text-[#6B6A6A]">
                  عدد العروض
                </span>
                <span className="text-[14px] font-semibold text-[#111111]">
                  {request.offersCount != null ? request.offersCount : '—'}
                </span>
              </div>
            )}
            <div className="flex flex-col gap-1">
              <span className="text-[13px] font-medium text-[#6B6A6A]">
                آخر تحديث
              </span>
              <span className="text-[14px] font-semibold text-[#111111]">
                نشر 15 يناير 2024
              </span>
            </div>
          </div>

          {/* Companies Section */}
          {companies.length > 0 && (
            <div className="flex flex-col gap-2.5 border-b border-[#ECECEC] pb-5">
              <span className="text-[13px] font-medium text-[#6B6A6A]">
                {companies.length === 1 ? 'الشركة' : 'الشركات'}
              </span>
              <div className="flex flex-col gap-2">
                {companies.map((comp, idx) => (
                  <div
                    key={idx}
                    className="flex items-center gap-2 text-[14px] font-semibold text-[#111111]"
                  >
                    <ExternalLink className="w-4 h-4 text-[#6B6A6A] shrink-0" />
                    <span>{comp.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description Section */}
          <div className="flex flex-col gap-2 border-b border-[#ECECEC] pb-5">
            <span className="text-[13px] font-medium text-[#6B6A6A]">
              الوصف
            </span>
            <p className="text-[14px] font-normal text-[#111111] leading-relaxed">
              شقة فاخرة للبيع في قلب السالمية، تتميز بتصميم معماري حديث وتشطيبات سوبر
              لوكس. الشقة تقع في الدور الـ 4 مما يوفر إطلالة بانورامية على الخليج العربي،
              موقع البرج حيوي جداً وقريب من المجمعات التجارية والخدمات الرئيسية.
            </p>
          </div>

          {/* Attachments Section */}
          <div className="flex flex-col gap-2.5">
            <span className="text-[13px] font-medium text-[#6B6A6A]">
              مرفقات
            </span>
            <div className="flex items-center gap-2 flex-wrap">
              {attachments.map((file) => (
                <div
                  key={file}
                  className="h-9 px-3.5 rounded-lg border border-[#E2E8F0] bg-white flex items-center gap-2 text-[13px] font-medium text-[#111111]"
                >
                  <Paperclip className="w-3.5 h-3.5 text-[#6B6A6A]" />
                  <span>{file}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
