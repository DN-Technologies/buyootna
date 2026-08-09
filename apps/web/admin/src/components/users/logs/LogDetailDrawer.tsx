'use client'

import { useEffect } from 'react'
import { Bath, Bed, Building, X } from 'lucide-react'
import { UserLogRecord } from './UserLogsTabContent'

export interface LogDetailDrawerProps {
  open: boolean
  onClose: () => void
  log: UserLogRecord | null
  onOpenRepublishModal?: () => void
}

export default function LogDetailDrawer({
  open,
  onClose,
  log,
  onOpenRepublishModal,
}: LogDetailDrawerProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', onKeyDown)
    }
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open || !log) return null

  const isAdOperation =
    log.actionTitle.includes('اعلان') || log.actionTitle.includes('إعلان')
  const isHideAd = log.actionTitle.includes('اخفاء')

  return (
    <div className="fixed inset-0 z-50 font-['Cairo'] flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      {/* Drawer Container */}
      <div
        className="relative bg-white w-full max-w-lg h-full shadow-2xl flex flex-col z-10 text-right overflow-y-auto"
        dir="rtl"
      >
        {/* Header */}
        <div className="p-5 border-b border-[#ECECEC] flex items-center justify-between gap-4 sticky top-0 bg-white z-10">
          <div className="flex flex-col text-right">
            <h2 className="text-[16px] font-bold text-[#111111]">
              عملية رقم # {log.code} · {log.actionTitle}
            </h2>
            <span className="text-[12px] font-medium text-[#6B6A6A]">
              12 يوليو 09:30 ص
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="size-8 flex items-center justify-center rounded-lg hover:bg-[#F8FAFC] text-[#6B6A6A] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 flex flex-col gap-6 flex-1">
          {/* Operation Summary Box */}
          <div
            className={`bg-white border border-[#ECECEC] rounded-2xl p-4 flex flex-col gap-3 relative text-right border-r-4 ${
              log.actionTitle.includes('حذف')
                ? 'border-r-[#991B1B]'
                : 'border-r-primary'
            }`}
          >
            {isAdOperation ? (
              <>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-medium text-[#6B6A6A]">
                    نوع العملية
                  </span>
                  <span className="font-bold text-[#111111]">
                    {log.actionTitle.includes('حذف') ? 'حذف' : 'اخفاء'}
                  </span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-medium text-[#6B6A6A]">بواسطة</span>
                  <span className="font-bold text-[#111111]">
                    أحمد سالم (مشرف)
                  </span>
                </div>
                <div className="flex flex-col gap-1 text-[13px]">
                  <span className="font-medium text-[#6B6A6A]">السبب</span>
                  <p className="font-bold text-[#111111] leading-relaxed">
                    تم {log.actionTitle.includes('حذف') ? 'حذف' : 'اخفاء'}{' '}
                    الاعلان بسبب المعلومات المضللة التي نشرها المالك.
                  </p>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-medium text-[#6B6A6A]">
                    نوع العملية
                  </span>
                  <span className="font-bold text-[#111111]">شراء باقة</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-medium text-[#6B6A6A]">بواسطة</span>
                  <span className="font-bold text-[#111111]">المستخدم</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-medium text-[#6B6A6A]">المبلغ</span>
                  <span className="font-bold text-[#111111]">100 د.ك</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-medium text-[#6B6A6A]">الخصم</span>
                  <span className="font-bold text-[#111111]">—</span>
                </div>
                <div className="flex items-center justify-between text-[13px]">
                  <span className="font-medium text-[#6B6A6A]">الباقة</span>
                  <span className="font-bold text-[#111111]">الفضية</span>
                </div>
              </>
            )}
          </div>

          {/* Property Details (for Ad Operations) */}
          {isAdOperation && (
            <div className="flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <span className="text-[12px] font-medium text-[#6B6A6A]">
                  الاعلان
                </span>
                <h3 className="text-[16px] font-bold text-[#111111]">
                  شقة للبيع بالسالمية
                </h3>
              </div>

              {/* Photo Gallery Thumbnails */}
              <div className="flex items-center gap-2">
                <div className="size-20 rounded-xl bg-slate-200 overflow-hidden shrink-0">
                  <div className="w-full h-full bg-linear-to-br from-slate-300 to-slate-400 flex items-center justify-center text-[#6B6A6A]">
                    <Building className="w-6 h-6" />
                  </div>
                </div>
                <div className="size-20 rounded-xl bg-slate-200 overflow-hidden shrink-0">
                  <div className="w-full h-full bg-linear-to-br from-slate-300 to-slate-400 flex items-center justify-center text-[#6B6A6A]">
                    <Building className="w-6 h-6" />
                  </div>
                </div>
                <div className="size-20 rounded-xl bg-slate-200 overflow-hidden shrink-0">
                  <div className="w-full h-full bg-linear-to-br from-slate-300 to-slate-400 flex items-center justify-center text-[#6B6A6A]">
                    <Building className="w-6 h-6" />
                  </div>
                </div>
              </div>

              {/* Price & Stats Row */}
              <div className="grid grid-cols-4 gap-2 bg-[#F8FAFC] p-3 rounded-xl text-center text-[12px]">
                <div className="flex flex-col gap-0.5">
                  <span className="text-[#6B6A6A]">السعر</span>
                  <span className="font-bold text-[#059669]">850,000 د.ك</span>
                </div>
                <div className="flex flex-col gap-0.5 border-r border-[#ECECEC]">
                  <span className="text-[#6B6A6A]">المشاهدات</span>
                  <span className="font-bold text-[#111111]">80</span>
                </div>
                <div className="flex flex-col gap-0.5 border-r border-[#ECECEC]">
                  <span className="text-[#6B6A6A]">التواصل</span>
                  <span className="font-bold text-[#111111]">80</span>
                </div>
                <div className="flex flex-col gap-0.5 border-r border-[#ECECEC]">
                  <span className="text-[#6B6A6A]">مرات الحفظ</span>
                  <span className="font-bold text-[#111111]">11</span>
                </div>
              </div>

              {/* Specs Box (Figma Node 4043:131986) */}
              <div className="bg-[#F8FAFC] rounded-2xl p-4 flex flex-col gap-4 text-right">
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-medium text-[#6B6A6A]">
                      نوع الإعلان
                    </span>
                    <span className="text-[14px] font-bold text-[#111111]">
                      بيع
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-medium text-[#6B6A6A]">
                      التصنيف
                    </span>
                    <span className="text-[14px] font-bold text-[#111111]">
                      شقة
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-medium text-[#6B6A6A]">
                      المساحة
                    </span>
                    <span className="text-[14px] font-bold text-[#111111]">
                      200 م2
                    </span>
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-[12px] font-medium text-[#6B6A6A]">
                      الموقع
                    </span>
                    <span className="text-[14px] font-bold text-[#111111] leading-relaxed">
                      السالمية، شارع 2، بناية 10، شقة 4
                    </span>
                  </div>
                </div>

                <div className="flex flex-col gap-1 pt-1 border-t border-[#ECECEC]">
                  <span className="text-[12px] font-medium text-[#6B6A6A]">
                    المزايا
                  </span>
                  <div className="flex items-center gap-4 text-[14px] font-bold text-[#111111]">
                    <span className="flex items-center gap-1.5">
                      <Building className="w-4 h-4 text-primary" />4 دور
                    </span>
                    <span className="h-4 border-r border-[#ECECEC]" />
                    <span className="flex items-center gap-1.5">
                      <Bed className="w-4 h-4 text-primary" />3 غرف
                    </span>
                    <span className="h-4 border-r border-[#ECECEC]" />
                    <span className="flex items-center gap-1.5">
                      <Bath className="w-4 h-4 text-primary" />2 حمام
                    </span>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="flex flex-col gap-1 pt-1">
                <span className="text-[12px] font-medium text-[#6B6A6A]">
                  الوصف
                </span>
                <p className="text-[13px] font-medium text-[#111111] leading-relaxed bg-[#F8FAFC] p-4 rounded-2xl">
                  شقة فاخرة للبيع في قلب السالمية، تتميز بتصميم معماري حديث
                  وتشطيبات سوبر لوكس. الشقة تقع في الدور الـ 4 مما يوفر إطلالة
                  بانورامية على الخليج العربي. موقع البرج حيوي جداً وقريب من
                  المجمعات التجارية والخدمات الرئيسية.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Button for Hide Ad operation (Node 4043:132406) */}
        {isHideAd && (
          <div className="p-5 border-t border-[#ECECEC] bg-white sticky bottom-0 z-10">
            <button
              type="button"
              onClick={onOpenRepublishModal}
              className="w-full h-11 bg-primary hover:bg-[#0F2238] text-white font-bold text-[14px] rounded-xl transition-colors cursor-pointer"
            >
              اعادة النشر
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
