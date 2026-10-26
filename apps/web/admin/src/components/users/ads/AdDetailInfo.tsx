'use client'

import { BedDouble, Bath, Building2 } from 'lucide-react'
import type { AdminUserProperty } from '@/lib/admin-users'
import { categoryLabels, formatPrice, typeLabels } from '@/lib/property-labels'

// مرات الحفظ: favorites of the ad; التواصل: chats opened about it
function AdDetailStats({ property }: { property: AdminUserProperty }) {
  const stats = [
    {
      label: 'السعر',
      value: formatPrice(property.price),
      valueClassName: 'text-[#15A72B]',
    },
    { label: 'المشاهدات', value: String(property.views) },
    {
      label: 'التواصل',
      value:
        property.contactsCount != null ? String(property.contactsCount) : '—',
    },
    {
      label: 'مرات الحفظ',
      value: property.savesCount != null ? String(property.savesCount) : '—',
    },
  ]

  return (
    <div className="border-y border-[#ECECEC] flex items-stretch w-full">
      {stats.map((stat, idx) => (
        <div
          key={stat.label}
          className={`flex-1 flex flex-col gap-2.5 px-5 py-2.5 ${
            idx > 0 ? 'border-r border-[#ECECEC]' : ''
          }`}
        >
          <p className="text-[13px] font-medium text-[#6B6A6A]">{stat.label}</p>
          <p
            className={`text-[14px] font-bold ${stat.valueClassName || 'text-[#111111]'}`}
          >
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex-1 flex flex-col gap-2.5 min-w-0">
      <p className="text-[13px] font-semibold text-[#6B6A6A] tracking-[0.26px]">
        {label}
      </p>
      <p className="text-[14px] font-medium text-[#111111] truncate max-w-full">
        {value}
      </p>
    </div>
  )
}

function featureList(features: unknown): string[] {
  if (!Array.isArray(features)) return []
  return features.filter((f): f is string => typeof f === 'string')
}

export default function AdDetailInfo({
  property,
}: {
  property: AdminUserProperty
}) {
  const typeLabel = typeLabels[property.type] || property.type
  const categoryLabel = categoryLabels[property.category] || property.category

  return (
    <div
      className="flex flex-col gap-4 items-center w-full font-['Cairo']"
      dir="rtl"
    >
      {property.images?.length > 0 && (
        <div className="flex gap-3.5 items-center w-full pt-3 pr-3">
          {property.images.slice(0, 3).map((src, idx) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              key={idx}
              src={src}
              alt=""
              className="rounded-md shrink-0 size-20.5 object-cover"
            />
          ))}
        </div>
      )}

      <AdDetailStats property={property} />

      <div className="bg-[rgba(241,245,249,0.3)] rounded-md flex flex-col gap-5 p-3.5 w-full mx-5">
        <div className="flex items-center justify-between w-full gap-4">
          <InfoRow label="التصنيف" value={categoryLabel} />
          <InfoRow label="نوع الإعلان" value={typeLabel} />
        </div>
        <div className="flex items-center justify-between w-full gap-4">
          <InfoRow label="الموقع" value={property.location} />
          {property.areaSize != null && (
            <InfoRow label="المساحة" value={`${property.areaSize} م2`} />
          )}
        </div>

        {property.type === 'EXCHANGE' ? (
          <>
            {(property.requiredYear || property.requestYear) && (
              <div className="flex flex-col gap-2.5 w-full">
                <p className="text-[13px] font-semibold text-[#6B6A6A] tracking-[0.26px]">
                  المطلوب
                </p>
                <div className="flex items-center gap-4 text-[14px] font-medium text-[#111111]">
                  {property.requiredYear && (
                    <span>السنة المطلوبة {property.requiredYear}</span>
                  )}
                  {property.requestYear && (
                    <span>سنة الطلب {property.requestYear}</span>
                  )}
                </div>
              </div>
            )}
            {featureList(property.features).length > 0 && (
              <div className="flex flex-col gap-2.5 w-full">
                <p className="text-[13px] font-semibold text-[#6B6A6A] tracking-[0.26px]">
                  المزايا
                </p>
                <div className="flex items-center gap-2 flex-wrap">
                  {featureList(property.features).map((feature) => (
                    <span
                      key={feature}
                      className="h-5 flex items-center px-2 rounded-full bg-white border border-[#ECECEC] text-[12px] text-[#111111]"
                    >
                      {feature}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </>
        ) : (
          (property.beds != null ||
            property.baths != null ||
            property.floors != null) && (
            <div className="flex flex-col gap-2.5 w-full">
              <p className="text-[13px] font-semibold text-[#6B6A6A] tracking-[0.26px]">
                المزايا
              </p>
              <div className="flex items-center gap-4 text-[14px] font-medium text-[#111111]">
                {property.floors != null && (
                  <span className="flex items-center gap-1.5">
                    <Building2 className="w-4 h-4" />
                    {property.floors} دور
                  </span>
                )}
                {property.beds != null && (
                  <span className="flex items-center gap-1.5">
                    <BedDouble className="w-4 h-4" />
                    {property.beds} غرف
                  </span>
                )}
                {property.baths != null && (
                  <span className="flex items-center gap-1.5">
                    <Bath className="w-4 h-4" />
                    {property.baths} حمام
                  </span>
                )}
              </div>
            </div>
          )
        )}
      </div>

      {property.type === 'RENT' &&
        (property.additionalExpenses || property.rentConditions) && (
          <div className="flex flex-col gap-4 w-full px-5">
            {property.additionalExpenses && (
              <div className="bg-[rgba(241,245,249,0.3)] rounded-md flex flex-col gap-2.5 p-3.5 w-full">
                <p className="text-[13px] font-semibold text-[#6B6A6A] tracking-[0.26px]">
                  المصاريف الإضافية
                </p>
                <p className="text-[14px] font-medium text-[#111111] text-right">
                  {property.additionalExpenses}
                </p>
              </div>
            )}
            {property.rentConditions && (
              <div className="bg-[rgba(241,245,249,0.3)] rounded-md flex flex-col gap-2.5 p-3.5 w-full">
                <p className="text-[13px] font-semibold text-[#6B6A6A] tracking-[0.26px]">
                  شروط الايجار
                </p>
                <p className="text-[14px] font-medium text-[#111111] text-right">
                  {property.rentConditions}
                </p>
              </div>
            )}
          </div>
        )}

      {property.description && (
        <div className="bg-[rgba(241,245,249,0.3)] rounded-md flex flex-col gap-2.5 p-3.5 w-full mx-5">
          <p className="text-[13px] font-semibold text-[#6B6A6A] tracking-[0.26px]">
            الوصف
          </p>
          <p className="text-[14px] font-medium text-[#111111] text-right">
            {property.description}
          </p>
        </div>
      )}
    </div>
  )
}
