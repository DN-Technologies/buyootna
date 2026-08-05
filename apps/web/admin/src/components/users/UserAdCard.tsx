'use client'

import { useState } from 'react'
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
import {
  categoryLabels,
  formatArabicDate,
  formatPrice,
  getAdCode,
  getAdLabel,
  getStatusBadge,
  typeLabels,
} from '@/lib/property-labels'
import ConfirmActionDialog, {
  ConfirmActionType,
} from './ConfirmActionDialog'
import FeatureAdDialog from './FeatureAdDialog'

// نسخ/إظهار (un-hiding) have no confirmation design and no backend API —
// left as lightweight placeholders. حذف/اخفاء/اعادة النشر/تمييز now go
// through their confirmation dialogs; the dialogs' own confirm buttons
// still end in the same "not implemented" notice since none of these
// mutate real data yet.
function notImplemented(action: string) {
  alert(`"${action}" — لم يتم تفعيل هذا الإجراء بعد.`)
}

export default function UserAdCard({
  property,
  onViewDetails,
}: {
  property: AdminUserProperty
  onViewDetails: (property: AdminUserProperty) => void
}) {
  const [confirmAction, setConfirmAction] = useState<ConfirmActionType | null>(
    null,
  )
  const [showFeatureDialog, setShowFeatureDialog] = useState(false)

  const badge = getStatusBadge(property)
  const typeLabel = typeLabels[property.type] || property.type
  const categoryLabel = categoryLabels[property.category] || property.category
  const code = getAdCode(property.referenceNumber)
  const thumbnail = property.images?.[0]
  const adLabel = getAdLabel(property)

  return (
    <div
      className="bg-white border border-[rgba(15,23,42,0.1)] rounded-2xl overflow-hidden w-full font-['Cairo']"
      dir="rtl"
    >
      <div className="flex gap-4 items-start p-3">
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
        <div className="flex-1 flex flex-col gap-2 min-w-0">
          <div className="flex items-start justify-between w-full gap-2">
            <p className="text-[14px] font-semibold text-[#111111] truncate">
              {categoryLabel} {typeLabel} · {code}
            </p>
            <span
              className={`h-5 flex items-center justify-center px-2 rounded-bl-[10px] rounded-tl-lg rounded-tr-[10px] text-[12px] shrink-0 ${badge.className}`}
            >
              {badge.label}
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap text-[12px] text-[#6B6A6A]">
            <span className="flex items-center gap-1">
              <ImageIcon className="w-3.5 h-3.5" />
              {property.images?.length || 0} صور
            </span>
            {property.areaSize != null && (
              <span className="flex items-center gap-1">
                <Ruler className="w-3.5 h-3.5" />
                {property.areaSize}م²
              </span>
            )}
            <span className="flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5" />
              {property.location}
            </span>
          </div>

          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="flex items-center gap-3 flex-wrap text-[12px] text-[#6B6A6A]">
              <span className="flex items-center gap-1">
                نشر {formatArabicDate(property.createdAt)}
                <Calendar className="w-3.5 h-3.5" />
              </span>
              <span className="flex items-center gap-1">
                {property.views} مشاهدة
                <Eye className="w-3.5 h-3.5" />
              </span>
            </div>
            <p className="text-[15px] font-black text-[#111111] shrink-0">
              {formatPrice(property.price)}
            </p>
          </div>
        </div>
      </div>

      <div className="bg-[rgba(241,245,249,0.3)] border-t border-[rgba(15,23,42,0.1)] flex items-center gap-2 px-3 pt-2.5 pb-2">
        {!property.isFeatured && (
          <button
            type="button"
            onClick={() => setShowFeatureDialog(true)}
            className="h-8 flex items-center gap-1 justify-center px-4 rounded-[20px] bg-linear-to-l from-[#FF8D28] to-[#FACC15] text-[14px] font-semibold text-[#111111] cursor-pointer"
          >
            <Star className="w-3.5 h-3.5" />
            تمييز
          </button>
        )}
        {property.status === 'EXPIRED' || property.status === 'CLOSED' ? (
          <button
            type="button"
            onClick={() => setConfirmAction('republish')}
            className="h-8 flex items-center gap-1 justify-center px-4 rounded-[20px] border border-[#E2E8F0] bg-white text-[14px] font-semibold text-[#111111] cursor-pointer hover:bg-[#F8FAFC]"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            اعادة النشر
          </button>
        ) : (
          <button
            type="button"
            onClick={() =>
              property.isHidden
                ? notImplemented('إظهار')
                : setConfirmAction('hide')
            }
            className="h-8 flex items-center gap-1 justify-center px-4 rounded-[20px] border border-[#E2E8F0] bg-white text-[14px] font-semibold text-[#111111] cursor-pointer hover:bg-[#F8FAFC]"
          >
            <EyeOff className="w-3.5 h-3.5" />
            {property.isHidden ? 'إظهار' : 'اخفاء'}
          </button>
        )}

        <button
          type="button"
          onClick={() => onViewDetails(property)}
          className="h-8 flex items-center justify-center px-4 rounded-[20px] border border-[#E2E8F0] bg-white text-[14px] font-semibold text-[#111111] cursor-pointer hover:bg-[#F8FAFC]"
        >
          عرض التفاصيل
        </button>
        <div className="flex items-center gap-1 mr-auto">
          <button
            type="button"
            onClick={() => notImplemented('نسخ')}
            className="p-1.5 rounded-full text-[#111111] hover:bg-[#F1F5F9] cursor-pointer"
            title="نسخ"
          >
            <Copy className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setConfirmAction('delete')}
            className="p-1.5 rounded-full text-[#9C1E28] hover:bg-[#FEF3F2] cursor-pointer"
            title="حذف"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {confirmAction && (
        <ConfirmActionDialog
          type={confirmAction}
          adLabel={adLabel}
          code={code}
          onClose={() => setConfirmAction(null)}
          onConfirm={() => {
            setConfirmAction(null)
            notImplemented(
              confirmAction === 'delete'
                ? 'حذف'
                : confirmAction === 'hide'
                  ? 'اخفاء'
                  : 'اعادة النشر',
            )
          }}
        />
      )}

      {showFeatureDialog && (
        <FeatureAdDialog
          adLabel={adLabel}
          code={code}
          onClose={() => setShowFeatureDialog(false)}
          onConfirm={() => {
            setShowFeatureDialog(false)
            notImplemented('تمييز')
          }}
        />
      )}
    </div>
  )
}
