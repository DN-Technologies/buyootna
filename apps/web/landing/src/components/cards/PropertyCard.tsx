/* eslint-disable @next/next/no-img-element -- listing photos are uploaded by
   advertisers to storage hosts the image optimizer isn't configured for */
import { Heart } from 'lucide-react'
import Image from 'next/image'

import AccountAction from '@/components/ui/AccountAction'
import InitialTile from '@/components/ui/InitialTile'
import { formatNumber, timeAgo } from '@/lib/format'
import type { Property } from '@/lib/types'

interface PropertyCardProps {
  property: Property
  // 'row' lays the photo beside the details, for the list view
  layout?: 'card' | 'row'
}

/** One ad: photo, category, price, area, location, income and advertiser. */
export default function PropertyCard({
  property,
  layout = 'card',
}: PropertyCardProps) {
  const row = layout === 'row'
  const photo = property.images?.[0]
  const hasIncome = !!property.propertyIncome && property.propertyIncome > 0

  return (
    <article
      className={`flex h-full w-full flex-col overflow-hidden ${row ? 'sm:flex-row' : ''} rounded-md border border-line bg-white shadow-[0_2px_2px_rgba(33,37,41,0.06),0_0_1px_rgba(33,37,41,0.08)]`}
    >
      <div
        className={`relative h-40.75 w-full shrink-0 bg-tag ${row ? 'sm:h-auto sm:min-h-44 sm:w-65' : ''}`}
      >
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
            <AccountAction
              aria-label="أضف إلى المفضلة"
              className="flex h-6 w-6 items-center justify-center rounded-lg bg-white/95"
            >
              <Heart className="h-3.75 w-3.75 text-ink" strokeWidth={1.5} />
            </AccountAction>
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
          <div className="flex min-w-0 flex-1 flex-col gap-1 text-sm font-medium">
            <span className="text-muted">المعلن</span>
            <span className="truncate text-ink">{property.companyName}</span>
          </div>
          {/* Chatting with the advertiser needs an account */}
          <AccountAction
            aria-label="محادثة المعلن"
            className="flex h-8.5 w-12 shrink-0 items-center justify-center rounded-[17.5px] border-[0.727px] border-brand transition hover:bg-surface"
          >
            <Image
              src="/landing/card-chat.svg"
              alt=""
              width={17.5}
              height={17.5}
            />
          </AccountAction>
        </div>
      </div>
    </article>
  )
}
