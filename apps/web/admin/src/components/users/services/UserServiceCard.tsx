'use client'

import { useState, useRef, useEffect } from 'react'
import { MoreVertical, Eye, EyeOff, Trash2 } from 'lucide-react'

export interface ServiceItem {
  id: string
  title: string
  description: string
  status: 'active' | 'hidden' | 'deleted'
  category: string
  ordersCount: number
  reportsCount: number
}

export interface UserServiceCardProps {
  service: ServiceItem
  onViewDetails?: (service: ServiceItem) => void
  onToggleHide?: (service: ServiceItem) => void
  onDelete?: (service: ServiceItem) => void
}

export default function UserServiceCard({
  service,
  onViewDetails,
  onToggleHide,
  onDelete,
}: UserServiceCardProps) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const isDeleted = service.status === 'deleted'
  const isHidden = service.status === 'hidden'

  const statusBadge =
    service.status === 'active' ? (
      <span className="px-2.5 py-0.5 rounded-full bg-[#ECFDF5] text-[#047857] text-[12px] font-medium">
        نشطة
      </span>
    ) : isHidden ? (
      <span className="px-2.5 py-0.5 rounded-full bg-[#F1F5F9] text-[#64748B] text-[12px] font-medium">
        مخفية
      </span>
    ) : (
      <span className="px-2.5 py-0.5 rounded-full bg-[#FEF3F2] text-[#9C1E28] text-[12px] font-medium">
        محذوفة
      </span>
    )

  return (
    <div
      className="bg-white border border-[#ECECEC] rounded-lg p-5 flex flex-col gap-4 font-['Cairo'] text-right relative shadow-2xs"
      dir="rtl"
    >
      {/* Header Row: Title, Badge & 3-Dots Menu */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-bold text-[18px] text-[#111111] leading-tight">
              {service.title}
            </h4>
            {statusBadge}
          </div>
          <p className="text-[13px] text-[#6B6A6A] font-normal leading-relaxed line-clamp-2">
            {service.description}
          </p>
        </div>

        {/* 3-Dots Action Dropdown */}
        <div className="relative shrink-0" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            className="p-1.5 text-[#6B6A6A] hover:text-[#111111] rounded-md hover:bg-[#F1F5F9] transition-colors cursor-pointer"
            title="الإجراءات"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {menuOpen && (
            <div className="absolute left-0 mt-1 w-40 bg-white border border-[#ECECEC] rounded-lg shadow-lg py-1 z-30 flex flex-col text-right">
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  onViewDetails?.(service)
                }}
                className="flex items-center justify-end gap-2 px-3 py-2 text-[13px] text-[#111111] hover:bg-slate-50 font-medium"
              >
                <span>عرض التفاصيل</span>
                <Eye className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  onToggleHide?.(service)
                }}
                className="flex items-center justify-end gap-2 px-3 py-2 text-[13px] text-[#111111] hover:bg-slate-50 font-medium"
              >
                <span>{isHidden ? 'إعادة النشر' : 'اخفاء'}</span>
                <EyeOff className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false)
                  onDelete?.(service)
                }}
                className="flex items-center justify-end gap-2 px-3 py-2 text-[13px] text-[#9C1E28] hover:bg-red-50 font-medium"
              >
                <span>حذف الخدمة</span>
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Metric Stats Strip */}
      <div className="bg-[#F8FAFC] rounded-lg px-4 py-3 flex items-center justify-between text-[13px] text-[#6B6A6A]">
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[12px] font-normal text-[#6B6A6A]">
            التصنيف
          </span>
          <span className="font-semibold text-[#111111]">
            {service.category}
          </span>
        </div>
        <div className="w-px h-6 bg-[#ECECEC]" />
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[12px] font-normal text-[#6B6A6A]">
            مرات الطلب
          </span>
          <span className="font-semibold text-[#111111]">
            {service.ordersCount}
          </span>
        </div>
        <div className="w-px h-6 bg-[#ECECEC]" />
        <div className="flex flex-col items-center gap-0.5">
          <span className="text-[12px] font-normal text-[#6B6A6A]">
            البلاغات
          </span>
          <span
            className={`font-semibold ${
              service.reportsCount > 0 ? 'text-[#9C1E28]' : 'text-[#111111]'
            }`}
          >
            {service.reportsCount}
          </span>
        </div>
      </div>

      {/* Bottom Action Buttons Row */}
      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => onViewDetails?.(service)}
          className="flex-1 h-9 rounded-lg bg-primary hover:bg-[#0f243a] text-white text-[13px] font-bold transition-colors cursor-pointer"
        >
          عرض التفاصيل
        </button>

        <button
          type="button"
          disabled={isDeleted}
          onClick={() => onToggleHide?.(service)}
          className={`flex-1 h-9 rounded-lg border border-[#ECECEC] text-[13px] font-bold transition-colors ${
            isDeleted
              ? 'bg-slate-50 text-[#A0A0A0] cursor-not-allowed border-transparent'
              : 'bg-white text-[#111111] hover:bg-slate-50 cursor-pointer'
          }`}
        >
          {isHidden ? 'اعادة النشر' : 'اخفاء'}
        </button>

        <button
          type="button"
          disabled={isDeleted}
          onClick={() => onDelete?.(service)}
          className={`flex-1 h-9 rounded-lg border text-[13px] font-bold transition-colors ${
            isDeleted
              ? 'border-[#ECECEC] bg-slate-50 text-[#A0A0A0] cursor-not-allowed'
              : 'border-[#9C1E28] bg-white text-[#9C1E28] hover:bg-red-50 cursor-pointer'
          }`}
        >
          حذف
        </button>
      </div>
    </div>
  )
}
