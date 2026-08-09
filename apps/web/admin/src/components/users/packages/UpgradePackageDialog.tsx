'use client'

import { useEffect } from 'react'
import { CheckCircle2, X } from 'lucide-react'

export interface UpgradePackageDialogProps {
  open: boolean
  onClose: () => void
}

export default function UpgradePackageDialog({
  open,
  onClose,
}: UpgradePackageDialogProps) {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    if (open) {
      document.addEventListener('keydown', onKeyDown)
    }
    return () => document.removeEventListener('keydown', onKeyDown)
  }, [open, onClose])

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 font-['Cairo'] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />

      {/* Modal Dialog */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto p-6 md:p-8 flex flex-col gap-6 text-right z-10"
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between w-full border-b border-[#ECECEC] pb-4">
          <h2 className="text-[20px] font-bold text-[#111111] w-full text-center">
            باقات الإعلانات المتاحة
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="absolute left-6 top-6 size-8 flex items-center justify-center rounded-full text-[#6B6A6A] hover:bg-[#F1F5F9] cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 3 Tier Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 w-full">
          {/* Card 1: Normal */}
          <div className="bg-white border border-[#ECECEC] rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm">
            <div>
              {/* Header Banner */}
              <div className="bg-[#F8FAFC] p-6 text-right flex flex-col gap-1 border-b border-[#ECECEC]">
                <span className="text-[28px] font-bold text-[#111111] leading-tight">
                  0 د.ك
                </span>
                <span className="text-[14px] font-medium text-[#6B6A6A]">
                  الباقة العادية
                </span>
              </div>

              {/* Body Content */}
              <div className="p-5 flex flex-col gap-4 text-right">
                <h3 className="text-[16px] font-bold text-[#111111]">
                  باقة الإعلانات العادية
                </h3>
                <ul className="flex flex-col gap-2.5 text-[13px] font-medium text-[#111111]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#018B1B] shrink-0" />
                    <span>اعلان واحد نشط.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#018B1B] shrink-0" />
                    <span>مدة النشر 10 ايام.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#018B1B] shrink-0" />
                    <span>حتى 5 صورة للعقار.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#018B1B] shrink-0" />
                    <span>ظهور في نتائج البحث.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#018B1B] shrink-0" />
                    <span>تواصل مباشر مع المهتمين.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-5 pt-0">
              <button
                type="button"
                onClick={() => {
                  alert('تم اختيار "شراء الباقة العادية"')
                  onClose()
                }}
                className="w-full h-11 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#111111] font-bold text-[14px] rounded-xl border border-[#E2E8F0] transition-colors cursor-pointer"
              >
                شراء الباقة
              </button>
            </div>
          </div>

          {/* Card 2: Silver */}
          <div className="bg-white border border-[#ECECEC] rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm">
            <div>
              {/* Header Banner */}
              <div className="bg-[#F8FAFC] p-6 text-right flex flex-col gap-1 border-b border-[#ECECEC]">
                <span className="text-[28px] font-bold text-[#111111] leading-tight">
                  5 د.ك
                </span>
                <span className="text-[14px] font-medium text-[#6B6A6A]">
                  الباقة الفضية
                </span>
              </div>

              {/* Body Content */}
              <div className="p-5 flex flex-col gap-4 text-right">
                <h3 className="text-[16px] font-bold text-[#111111]">
                  باقة الإعلانات الفضية
                </h3>
                <ul className="flex flex-col gap-2.5 text-[13px] font-medium text-[#111111]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#018B1B] shrink-0" />
                    <span>اعلان واحد نشط.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#018B1B] shrink-0" />
                    <span>مدة النشر 45 يوم.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#018B1B] shrink-0" />
                    <span>حتى 10 صورة للعقار.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#018B1B] shrink-0" />
                    <span>تثبيت 5 ايام في نتائج البحث.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#018B1B] shrink-0" />
                    <span>ظهور في نتائج البحث المميزة.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#018B1B] shrink-0" />
                    <span>تواصل مباشر مع المهتمين.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-5 pt-0">
              <button
                type="button"
                onClick={() => {
                  alert('تم اختيار "شراء الباقة الفضية"')
                  onClose()
                }}
                className="w-full h-11 bg-[#F8FAFC] hover:bg-[#F1F5F9] text-[#111111] font-bold text-[14px] rounded-xl border border-[#E2E8F0] transition-colors cursor-pointer"
              >
                شراء الباقة
              </button>
            </div>
          </div>

          {/* Card 3: Gold */}
          <div className="bg-white border border-[#ECECEC] rounded-2xl overflow-hidden flex flex-col justify-between shadow-sm">
            <div>
              {/* Header Banner */}
              <div className="bg-linear-to-l from-[#FFB81C] to-[#FF9900] p-6 text-white text-right flex flex-col gap-1">
                <span className="text-[28px] font-bold leading-tight">
                  20 د.ك
                </span>
                <span className="text-[14px] font-medium opacity-90">
                  الباقة الذهبية
                </span>
              </div>

              {/* Body Content */}
              <div className="p-5 flex flex-col gap-4 text-right">
                <h3 className="text-[16px] font-bold text-[#111111]">
                  باقة الإعلانات الذهبية
                </h3>
                <ul className="flex flex-col gap-2.5 text-[13px] font-medium text-[#111111]">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#018B1B] shrink-0" />
                    <span>4 اعلانات نشطة في نفس الوقت.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#018B1B] shrink-0" />
                    <span>مدة النشر 60 يوم.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#018B1B] shrink-0" />
                    <span>حتى 15 صورة للعقار.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#018B1B] shrink-0" />
                    <span>تثبيت 7 ايام في نتائج البحث.</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#018B1B] shrink-0" />
                    <span>اولولية الظهور في البحث الجغرافي.</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-5 pt-0">
              <button
                type="button"
                onClick={() => {
                  alert('تم اختيار "شراء الباقة الذهبية"')
                  onClose()
                }}
                className="w-full h-11 bg-primary hover:bg-[#0F2238] text-white font-bold text-[14px] rounded-xl transition-colors cursor-pointer"
              >
                شراء الباقة
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
