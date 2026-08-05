'use client'

import {
  Calendar,
  Copy,
  Eye,
  EyeOff,
  ImageIcon,
  MapPin,
  RefreshCw,
  Ruler,
  Star,
  Trash2,
} from 'lucide-react'
import type { AdminUserProperty } from '@/lib/admin-users'

const typeLabels: Record<string, string> = {
  SALE: 'للبيع',
  RENT: 'للإيجار',
  EXCHANGE: 'للتبديل',
  AUCTION: 'مزاد',
  DEAL: 'صفقة',
}

const categoryLabels: Record<string, string> = {
  APARTMENT: 'شقة',
  VILLA: 'فيلا',
  LAND: 'أرض',
  COMMERCIAL: 'تجاري',
  OFFICE: 'مكتب',
  SHOP: 'محل',
  BUILDING: 'عمارة',
  FARM: 'مزرعة',
  CHALET: 'شاليه',
  WAREHOUSE: 'مستودع',
  INVESTMENT: 'استثماري',
}

function formatPrice(price: number | null) {
  if (price == null) return '—'
  return `${new Intl.NumberFormat('en-US').format(price)} د.ك`
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat('ar', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    calendar: 'gregory',
    numberingSystem: 'latn',
  }).format(new Date(date))
}

function getStatusBadge(property: AdminUserProperty) {
  if (property.isHidden) {
    return { label: 'مخفي', className: 'bg-[#F1F5F9] text-[#6B6A6A]' }
  }
  if (property.isFeatured) {
    return {
      label: 'مميز',
      className: 'bg-gradient-to-l from-[#FF8D28] to-[#FACC15] text-[#111111]',
    }
  }
  switch (property.status) {
    case 'ACTIVE':
      return {
        label: 'نشط',
        className:
          'bg-gradient-to-l from-[#AADB53] to-[#33D679] text-[#111111]',
      }
    case 'DRAFT':
      return { label: 'مسودة', className: 'bg-[#F1F5F9] text-[#334155]' }
    case 'REJECTED':
      return { label: 'مرفوض', className: 'bg-[#FEF3F2] text-[#9C1E28]' }
    case 'EXPIRED':
      return { label: 'منتهي', className: 'bg-[#FFFBEB] text-[#B45309]' }
    case 'CLOSED':
      return { label: 'مغلق', className: 'bg-[#F1F5F9] text-[#334155]' }
    default:
      return {
        label: property.status,
        className: 'bg-[#F1F5F9] text-[#334155]',
      }
  }
}

// حذف/عرض التفاصيل are the only actions with a plausible real backend
// target; نسخ/اعادة النشر/تمييز/اخفاء(toggle) have no API today, so every
// action here is a placeholder until that's built — matching the pattern
// already used elsewhere in this page (e.g. handleAddUser/handleExport).
function notImplemented(action: string) {
  alert(`"${action}" — لم يتم تفعيل هذا الإجراء بعد.`)
}

export default function UserAdCard({
  property,
}: {
  property: AdminUserProperty
}) {
  const badge = getStatusBadge(property)
  const typeLabel = typeLabels[property.type] || property.type
  const categoryLabel = categoryLabels[property.category] || property.category
  const code = `AD${String(property.referenceNumber).slice(-3).padStart(3, '0')}`
  const thumbnail = property.images?.[0]

  return (
    <div
      className="bg-white border border-[rgba(15,23,42,0.1)] rounded-2xl overflow-hidden w-full font-['Cairo']"
      dir="rtl"
    >
      <div className="flex gap-4 items-start p-3">
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <div className="flex items-start justify-between w-full gap-2">
            <span
              className={`h-5 flex items-center justify-center px-2 rounded-bl-[10px] rounded-tl-lg rounded-tr-[10px] text-[12px] shrink-0 ${badge.className}`}
            >
              {badge.label}
            </span>
            <p className="text-[14px] font-semibold text-[#111111] truncate">
              {categoryLabel} {typeLabel} · {code}
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap text-[12px] text-[#6B6A6A]">
            <span className="flex items-center gap-1">
              {property.location}
              <MapPin className="w-3.5 h-3.5" />
            </span>
            {property.areaSize != null && (
              <span className="flex items-center gap-1">
                {property.areaSize}م²
                <Ruler className="w-3.5 h-3.5" />
              </span>
            )}
            <span className="flex items-center gap-1">
              {property.images?.length || 0} صور
              <ImageIcon className="w-3.5 h-3.5" />
            </span>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <p className="text-[15px] font-black text-[#111111] shrink-0">
              {formatPrice(property.price)}
            </p>
            <div className="flex items-center gap-3 flex-wrap text-[12px] text-[#6B6A6A]">
              <span className="flex items-center gap-1">
                {property.views} مشاهدة
                <Eye className="w-3.5 h-3.5" />
              </span>
              <span className="flex items-center gap-1">
                نشر {formatDate(property.createdAt)}
                <Calendar className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>

        <div className="rounded-md overflow-hidden shrink-0 size-18.75 bg-[#F1F5F9]">
          {thumbnail && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={thumbnail}
              alt=""
              className="w-full h-full object-cover"
            />
          )}
        </div>
      </div>

      <div className="bg-[rgba(241,245,249,0.3)] border-t border-[rgba(15,23,42,0.1)] flex items-center justify-end gap-2 px-3 pt-2.5 pb-2">
        <div className="flex-1 flex items-center gap-1">
          <button
            type="button"
            onClick={() => notImplemented('حذف')}
            className="p-1.5 rounded-full text-[#9C1E28] hover:bg-[#FEF3F2] cursor-pointer"
            title="حذف"
          >
            <Trash2 className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => notImplemented('نسخ')}
            className="p-1.5 rounded-full text-[#111111] hover:bg-[#F1F5F9] cursor-pointer"
            title="نسخ"
          >
            <Copy className="w-4 h-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => notImplemented('عرض التفاصيل')}
          className="h-8 flex items-center justify-center px-4 rounded-[20px] border border-[#E2E8F0] bg-white text-[14px] font-semibold text-[#111111] cursor-pointer hover:bg-[#F8FAFC]"
        >
          عرض التفاصيل
        </button>

        {property.status === 'EXPIRED' || property.status === 'CLOSED' ? (
          <button
            type="button"
            onClick={() => notImplemented('اعادة النشر')}
            className="h-8 flex items-center gap-1 justify-center px-4 rounded-[20px] border border-[#E2E8F0] bg-white text-[14px] font-semibold text-[#111111] cursor-pointer hover:bg-[#F8FAFC]"
          >
            اعادة النشر
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              notImplemented(property.isHidden ? 'إظهار' : 'اخفاء')
            }
            className="h-8 flex items-center gap-1 justify-center px-4 rounded-[20px] border border-[#E2E8F0] bg-white text-[14px] font-semibold text-[#111111] cursor-pointer hover:bg-[#F8FAFC]"
          >
            {property.isHidden ? 'إظهار' : 'اخفاء'}
            <EyeOff className="w-3.5 h-3.5" />
          </button>
        )}

        {!property.isFeatured && (
          <button
            type="button"
            onClick={() => notImplemented('تمييز')}
            className="h-8 flex items-center gap-1 justify-center px-4 rounded-[20px] bg-linear-to-l from-[#FF8D28] to-[#FACC15] text-[14px] font-semibold text-[#111111] cursor-pointer"
          >
            تمييز
            <Star className="w-3.5 h-3.5" />
          </button>
        )}
      </div>
    </div>
  )
}
