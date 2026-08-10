'use client'

import { useEffect } from 'react'
import {
  ExternalLink,
  Paperclip,
  X,
  Phone,
  MessageCircle,
  MessageSquare,
  Star,
} from 'lucide-react'
import type { UserRequestItem } from './UserRequestsTabContent'

export interface RequestDetailSheetProps {
  request: UserRequestItem
  onClose: () => void
}

const statusBadgeStyles: Record<UserRequestItem['status'], string> = {
  'تم الرد': 'bg-[#EBF3FF] text-[#2563EB]',
  'قيد الانتظار': 'bg-[#FEF6E6] text-[#D97706]',
  مقبولة: 'bg-[#ECFDF5] text-[#047857]',
  pending: 'bg-[#FEF6E6] text-[#D97706]',
  accepted: 'bg-[#ECFDF5] text-[#047857]',
  completed: 'bg-[#FEF3F2] text-[#9C1E28]',
  cancelled: 'bg-[#F1F5F9] text-[#64748B]',
  منتهي: 'bg-[#FEF3F2] text-[#9C1E28]',
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

  const isCompleted =
    request.status === 'completed' || request.status === 'منتهي'

  return (
    <div className="fixed inset-0 z-50 font-['Cairo'] flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Drawer Panel */}
      <div
        className="relative bg-white w-full max-w-lg h-full shadow-2xl z-10 flex flex-col justify-between overflow-y-auto text-right"
        dir="rtl"
      >
        {/* Top Header */}
        <div className="p-6 border-b border-[#ECECEC] flex flex-col gap-3 shrink-0">
          <div className="flex items-center justify-between w-full">
            <h2 className="text-[16px] font-bold text-[#111111]">
              تشطيب كامل لمحل تجاري • #{request.code}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="size-8 flex items-center justify-center rounded-full text-[#6B6A6A] hover:bg-[#F1F5F9] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex items-center justify-between w-full">
            <span className="text-[12px] font-medium text-[#6B6A6A]">
              نشر 15 يناير 2024
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium ${
                statusBadgeStyles[request.status] ||
                'bg-[#FEF6E6] text-[#D97706]'
              }`}
            >
              {request.status === 'pending'
                ? 'قيد الانتظار'
                : request.status === 'accepted'
                  ? 'مقبولة'
                  : request.status === 'completed'
                    ? 'منتهي'
                    : request.status}
            </span>
          </div>
        </div>

        {/* Drawer Body Content */}
        <div className="p-6 flex flex-col gap-6 flex-1 text-right">
          {/* Completion Info Box */}
          {isCompleted && (
            <div className="bg-[#F8FAFC] border-r-4 border-r-[#9C1E28] border-y border-l border-[#ECECEC] rounded-xl p-4 flex flex-col gap-2">
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#6B6A6A]">تاريخ الانتهاء</span>
                <span className="font-bold text-[#111111]">12 يوليو 2026</span>
              </div>
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#6B6A6A]">بواسطة</span>
                <span className="font-bold text-[#111111]">
                  شركة دار العقار الحديث
                </span>
              </div>
              <div className="flex flex-col gap-1 text-[13px] pt-1">
                <span className="text-[#6B6A6A]">السبب</span>
                <span className="font-medium text-[#111111]">
                  تم الاتفاق والتنفيذ خارج التطبيق
                </span>
              </div>
            </div>
          )}

          {/* Quick Specs List */}
          <div className="flex flex-col gap-3">
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#6B6A6A]">نوع الخدمة</span>
              <span className="font-bold text-[#111111]">تشطيب وتنفيد</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#6B6A6A]">نوع الطلب</span>
              <span className="font-bold text-[#111111]">
                {request.type === 'خاص' || request.type === 'private'
                  ? 'خاص'
                  : 'عام'}
              </span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#6B6A6A]">الميزانية</span>
              <span className="font-bold text-[#111111]">
                22,000 - 15,000 د.ك
              </span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#6B6A6A]">تاريخ النشر</span>
              <span className="font-bold text-[#111111]">15 يناير 2024</span>
            </div>
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#6B6A6A]">الموقع</span>
              <span className="font-bold text-[#111111]">
                شمال غرب صليبيخات
              </span>
            </div>
          </div>

          {/* Attached Images Strip */}
          <div className="flex flex-col gap-2 border-t border-[#ECECEC] pt-4">
            <span className="text-[13px] font-bold text-[#111111]">
              الصور المرفقة
            </span>
            <div className="grid grid-cols-4 gap-2">
              <div className="relative rounded-xl overflow-hidden aspect-square bg-[#E2E8F0] border border-[#ECECEC] flex items-center justify-center cursor-pointer">
                <div className="absolute inset-0 bg-black/50 text-white font-bold text-[16px] flex items-center justify-center">
                  +3
                </div>
              </div>
              <div className="rounded-xl overflow-hidden aspect-square bg-[#CBD5E1] border border-[#ECECEC] cursor-pointer" />
              <div className="rounded-xl overflow-hidden aspect-square bg-[#CBD5E1] border border-[#ECECEC] cursor-pointer" />
              <div className="rounded-xl overflow-hidden aspect-square bg-[#CBD5E1] border border-[#ECECEC] cursor-pointer" />
            </div>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-2 border-t border-[#ECECEC] pt-4">
            <span className="text-[13px] font-bold text-[#111111]">الوصف</span>
            <p className="text-[13px] text-[#6B6A6A] leading-relaxed">
              شقة فاخرة للبيع في قلب السالمية تتميز بتصميم معماري حديث وتشطيبات
              سوبر لوكس. الشقة تقع في الدور الـ 4 مما يوفر إطلالة بانورامية على
              الخليج العربي، موقع البرج حيوي جداً وقريب من المجمعات التجارية
              والخدمات الرئيسية.
            </p>
          </div>

          {/* Client Info Box with Contact Actions  */}
          <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-2xl p-4 flex items-center justify-between mt-auto">
            <div className="flex items-center gap-3">
              <div className="size-12 rounded-full bg-[#E2E8F0] flex items-center justify-center font-bold text-[16px] text-[#111111] shrink-0">
                ن
              </div>
              <div className="flex flex-col gap-0.5">
                <div className="flex items-center gap-2">
                  <span className="text-[14px] font-bold text-[#111111]">
                    نواف الجارحي
                  </span>
                  <span className="text-[12px] font-bold text-[#111111] flex items-center gap-0.5">
                    3.5{' '}
                    <Star className="w-3.5 h-3.5 fill-[#EAB308] text-[#EAB308]" />
                  </span>
                </div>
                <span className="text-[11px] text-[#6B6A6A]">
                  مضيف منذ 06/2026 • 5 عروض سابقة
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => alert('محادثة المشتري')}
                className="size-9 rounded-full border border-[#ECECEC] bg-white flex items-center justify-center text-primary hover:bg-slate-50 transition-colors cursor-pointer"
                title="محادثة"
              >
                <MessageSquare className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => alert('فتح واتساب')}
                className="size-9 rounded-full border border-[#ECECEC] bg-white flex items-center justify-center text-[#047857] hover:bg-slate-50 transition-colors cursor-pointer"
                title="واتساب"
              >
                <MessageCircle className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => alert('الاتصال بالمشتري')}
                className="size-9 rounded-full border border-[#ECECEC] bg-white flex items-center justify-center text-primary hover:bg-slate-50 transition-colors cursor-pointer"
                title="اتصال"
              >
                <Phone className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
