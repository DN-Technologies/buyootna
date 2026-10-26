'use client'

import { useEffect } from 'react'
import {
  X,
  Phone,
  MessageCircle,
  Star,
} from 'lucide-react'
import type { UserRequestItem } from './UserRequestsTabContent'
import { STATUS_LABELS, STATUS_STYLES } from './requests.types'

export interface RequestDetailSheetProps {
  request: UserRequestItem
  onClose: () => void
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

  const client = request.client
  const images = request.images || []
  const extraImagesCount = Math.max(0, images.length - 4)

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
              {request.title} • #{request.code}
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
              نشر {request.date}
            </span>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[12px] font-medium ${
                STATUS_STYLES[request.status]
              }`}
            >
              {STATUS_LABELS[request.status]}
            </span>
          </div>
        </div>

        {/* Drawer Body Content */}
        <div className="p-6 flex flex-col gap-6 flex-1 text-right">
          {/* Quick Specs List */}
          <div className="flex flex-col gap-3">
            {request.serviceType && (
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#6B6A6A]">نوع الخدمة</span>
                <span className="font-bold text-[#111111]">
                  {request.serviceType}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#6B6A6A]">نوع الطلب</span>
              <span className="font-bold text-[#111111]">
                {request.type === 'private' ? 'خاص' : 'عام'}
              </span>
            </div>
            {request.priceRange && (
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#6B6A6A]">الميزانية</span>
                <span className="font-bold text-[#111111]">
                  {request.priceRange}
                </span>
              </div>
            )}
            <div className="flex items-center justify-between text-[13px]">
              <span className="text-[#6B6A6A]">تاريخ النشر</span>
              <span className="font-bold text-[#111111]">{request.date}</span>
            </div>
            {request.location && (
              <div className="flex items-center justify-between text-[13px]">
                <span className="text-[#6B6A6A]">الموقع</span>
                <span className="font-bold text-[#111111]">
                  {request.location}
                </span>
              </div>
            )}
          </div>

          {/* Attached Images Strip */}
          {images.length > 0 && (
            <div className="flex flex-col gap-2 border-t border-[#ECECEC] pt-4">
              <span className="text-[13px] font-bold text-[#111111]">
                الصور المرفقة
              </span>
              <div className="grid grid-cols-4 gap-2">
                {images.slice(0, 4).map((src, i) => (
                  <div
                    key={src}
                    className="relative rounded-xl overflow-hidden aspect-square bg-[#CBD5E1] border border-[#ECECEC] cursor-pointer"
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={src}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                    {i === 3 && extraImagesCount > 0 && (
                      <div className="absolute inset-0 bg-black/50 text-white font-bold text-[16px] flex items-center justify-center">
                        +{extraImagesCount}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          {request.description && (
            <div className="flex flex-col gap-2 border-t border-[#ECECEC] pt-4">
              <span className="text-[13px] font-bold text-[#111111]">
                الوصف
              </span>
              <p className="text-[13px] text-[#6B6A6A] leading-relaxed">
                {request.description}
              </p>
            </div>
          )}

          {/* Client Info Box with Contact Actions  */}
          {client && (
            <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-2xl p-4 flex items-center justify-between mt-auto">
              <div className="flex items-center gap-3">
                <div className="size-12 rounded-full bg-[#E2E8F0] flex items-center justify-center font-bold text-[16px] text-[#111111] shrink-0 overflow-hidden">
                  {client.avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={client.avatarUrl}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    client.name.charAt(0)
                  )}
                </div>
                <div className="flex flex-col gap-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-[14px] font-bold text-[#111111]">
                      {client.name}
                    </span>
                    {client.rating != null && (
                      <span className="text-[12px] font-bold text-[#111111] flex items-center gap-0.5">
                        {client.rating}{' '}
                        <Star className="w-3.5 h-3.5 fill-[#EAB308] text-[#EAB308]" />
                      </span>
                    )}
                  </div>
                  <span className="text-[11px] text-[#6B6A6A]">
                    {client.joinedDateLabel
                      ? `مضيف منذ ${client.joinedDateLabel}`
                      : ''}
                    {client.previousOffers
                      ? ` • ${client.previousOffers} عروض سابقة`
                      : ''}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {client.whatsapp && (
                  <a
                    href={`https://wa.me/${client.whatsapp.replace(/[^\d]/g, '')}`}
                    target="_blank"
                    rel="noreferrer"
                    className="size-9 rounded-full border border-[#ECECEC] bg-white flex items-center justify-center text-[#047857] hover:bg-slate-50 transition-colors cursor-pointer"
                    title="واتساب"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                )}
                {client.phone && (
                  <a
                    href={`tel:${client.phone}`}
                    className="size-9 rounded-full border border-[#ECECEC] bg-white flex items-center justify-center text-primary hover:bg-slate-50 transition-colors cursor-pointer"
                    title="اتصال"
                  >
                    <Phone className="w-4 h-4" />
                  </a>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
