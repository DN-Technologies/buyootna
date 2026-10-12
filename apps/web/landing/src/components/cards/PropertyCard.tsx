/* eslint-disable @next/next/no-img-element -- listing photos are uploaded by
   advertisers to storage hosts the image optimizer isn't configured for */
import Image from 'next/image'
import Link from 'next/link'

import InitialTile from '@/components/ui/InitialTile'
import { formatNumber, timeAgo } from '@/lib/format'
import { LOGIN_PATH } from '@/lib/siteLinks'
import type { Property } from '@/lib/types'

/** One ad: photo, category, price, area, location, income and advertiser. */
export default function PropertyCard({ property }: { property: Property }) {
  const photo = property.images?.[0]
  const hasIncome = !!property.propertyIncome && property.propertyIncome > 0

  return (
    <article className="flex h-full w-full flex-col overflow-hidden rounded-md border border-line bg-white shadow-[0_2px_2px_rgba(33,37,41,0.06),0_0_1px_rgba(33,37,41,0.08)]">
      <div className="relative h-40.75 w-full bg-tag">
        {photo && (
          <img
            src={photo}
            alt={`${property.categoryLabel} في ${property.location}`}
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-x-3 top-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Favourites need an account */}
            <Link href={LOGIN_PATH} aria-label="أضف إلى المفضلة">
              <Image
                src="/landing/card-heart.svg"
                alt=""
                width={24}
                height={24}
              />
            </Link>
          </div>
          {property.isFeatured && (
            <span className="flex h-5 items-center rounded-tl-[10px] rounded-tr-sm rounded-bl-[10px] bg-linear-to-l from-[#FF8D28] to-[#FACC15] px-2.5 text-xs text-ink">
              مميز
            </span>
          )}
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-4 p-3">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-[15px] font-semibold tracking-[0.3px] text-ink">
              {property.categoryLabel}
            </h3>
            <time
              dateTime={property.publishedAt ?? property.createdAt}
              className="shrink-0 text-[13px] font-medium text-muted"
            >
              {timeAgo(property.publishedAt ?? property.createdAt)}
            </time>
          </div>

          <p className="flex h-5.5 items-end gap-0.5 text-brand">
            {property.price !== null && property.price !== undefined ? (
              <>
                <span className="text-[22px] font-semibold leading-5.5">
                  {formatNumber(property.price)}
                </span>
                <span className="pb-0.5 text-sm font-semibold">د.ك</span>
              </>
            ) : (
              <span className="text-base font-semibold">السعر غير معلن</span>
            )}
          </p>

          <div className="flex items-center gap-6 text-sm font-semibold tracking-[0.28px] text-muted">
            <span className="flex min-w-0 items-center gap-1">
              <Image
                src="/landing/card-location.svg"
                alt=""
                width={16}
                height={16}
              />
              <span className="truncate">{property.location}</span>
            </span>
            {!!property.area && (
              <span className="flex shrink-0 items-center gap-1">
                <Image
                  src="/landing/card-area.svg"
                  alt=""
                  width={18}
                  height={18}
                />
                {formatNumber(property.area)} م2
              </span>
            )}
          </div>

          {hasIncome && (
            <div className="flex items-center justify-between rounded-md bg-surface p-2.5">
              <span className="text-sm font-medium text-ink">مدخول العقار</span>
              <span className="flex items-end gap-0.5 text-success">
                <span className="text-base font-bold leading-none">
                  {formatNumber(property.propertyIncome!)}
                </span>
                <span className="text-sm font-semibold leading-none">د.ك</span>
              </span>
            </div>
          )}
        </div>

        <div className="mt-auto flex items-center gap-3 border-t border-line pt-4">
          <InitialTile
            name={property.companyName}
            size={40}
            className="rounded"
          />
          <div className="flex min-w-0 flex-col gap-1 text-sm font-medium">
            <span className="text-muted">المعلن</span>
            <span className="truncate text-ink">{property.companyName}</span>
          </div>
        </div>
      </div>
    </article>
  )
}
