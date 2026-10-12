/* eslint-disable @next/next/no-img-element -- listing photos are uploaded by
   advertisers to storage hosts the image optimizer isn't configured for */
import { ClipboardList, Forward, Heart } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import AccountAction from '@/components/ui/AccountAction'
import InitialTile from '@/components/ui/InitialTile'
import ShareButton from '@/components/ui/ShareButton'
import { LISTING_TYPES } from '@/lib/categories'
import { formatNumber, timeAgo } from '@/lib/format'
import type { Property } from '@/lib/types'

interface PropertyCardProps {
  property: Property
  // 'compact' drops the photo, for the list view
  layout?: 'card' | 'compact'
}

const FEATURED_TAG =
  'flex h-5 shrink-0 items-center rounded-tl-[10px] rounded-tr-sm rounded-bl-[10px] bg-linear-to-l from-[#FF8D28] to-[#FACC15] px-2.5 text-xs text-ink'

/** Saving an ad needs an account; a visitor gets the sign-in dialog. */
function SaveButton({ className = '' }: { className?: string }) {
  return (
    <AccountAction
      aria-label="أضف إلى المفضلة"
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${className}`}
    >
      <Heart className="h-3.75 w-3.75 text-ink" strokeWidth={1.5} />
    </AccountAction>
  )
}

/**
 * One ad: what it is and for which kind of deal, price, place and size,
 * income (or an exchange ad's two years) and the advertiser. Its photo and
 * title open the ad's page.
 */
export default function PropertyCard({
  property,
  layout = 'card',
}: PropertyCardProps) {
  const compact = layout === 'compact'
  const photo = property.images?.[0]
  const hasIncome = !!property.propertyIncome && property.propertyIncome > 0
  const hasYears = !!property.requestYear || !!property.requiredYear
  // "عمارة للبيع": the category, then what the ad offers it for
  const dealLabel = LISTING_TYPES.find(
    (type) => type.id === property.listingType,
  )?.tab
  const title = dealLabel
    ? `${property.categoryLabel} ${dealLabel}`
    : property.categoryLabel
  const published = property.publishedAt ?? property.createdAt
  const href = `/properties/${property.id}`
  const share = (className: string) => (
    <ShareButton
      path={href}
      title={title}
      className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-lg ${className}`}
    >
      <Forward className="h-3.75 w-3.75 text-ink" strokeWidth={1.5} />
    </ShareButton>
  )

  return (
    <article className="flex h-full w-full flex-col overflow-hidden rounded-md border border-line bg-white shadow-[0_2px_2px_rgba(33,37,41,0.06),0_0_1px_rgba(33,37,41,0.08)]">
      {!compact && (
        <div className="relative h-40.75 w-full shrink-0 bg-tag">
          <Link href={href} aria-label={title} className="absolute inset-0">
            {photo && (
              <img
                src={photo}
                alt={`${title} في ${property.location}`}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover"
              />
            )}
          </Link>
          <div className="pointer-events-none absolute inset-x-3 top-2 flex items-center justify-between *:pointer-events-auto">
            <span className="flex items-center gap-2">
              <SaveButton className="bg-white/95" />
              {share('bg-white/95')}
            </span>
            {property.isFeatured && <span className={FEATURED_TAG}>مميز</span>}
          </div>
        </div>
      )}

      <div className="flex flex-1 flex-col gap-4 p-3">
        <div className="flex flex-col gap-2.5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-[15px] font-semibold tracking-[0.3px] text-ink">
              <Link href={href} className="transition hover:text-brand">
                {title}
              </Link>
            </h3>
            {compact ? (
              property.isFeatured && <span className={FEATURED_TAG}>مميز</span>
            ) : (
              <time
                dateTime={published}
                className="shrink-0 text-[13px] font-medium text-muted"
              >
                {timeAgo(published)}
              </time>
            )}
          </div>

          <p className="flex h-5.5 items-end gap-0.5 text-brand">
            {property.price !== null && property.price !== undefined ? (
              <>
                <span className="text-[22px] leading-5.5 font-semibold">
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

          {hasYears ? (
            // An exchange ad: the year of the owner's request, and the year wanted
            <div className="flex items-center justify-center gap-2 rounded-md bg-surface p-2.5 text-sm font-medium text-ink">
              {!!property.requestYear && (
                <span className="flex items-center gap-1">
                  <ClipboardList className="h-4 w-4" strokeWidth={1.5} />
                  طلب {property.requestYear}
                </span>
              )}
              {!!property.requestYear && !!property.requiredYear && (
                <span>مع</span>
              )}
              {!!property.requiredYear && (
                <span className="flex items-center gap-1">
                  <ClipboardList className="h-4 w-4" strokeWidth={1.5} />
                  {property.requiredYear}
                </span>
              )}
            </div>
          ) : (
            hasIncome && (
              <div className="flex items-center justify-between rounded-md bg-surface p-2.5">
                <span className="text-sm font-medium text-ink">
                  مدخول العقار
                </span>
                <span className="flex items-end gap-0.5 text-success">
                  <span className="text-base leading-none font-bold">
                    {formatNumber(property.propertyIncome!)}
                  </span>
                  <span className="text-sm leading-none font-semibold">
                    د.ك
                  </span>
                </span>
              </div>
            )
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

        {compact && (
          <div className="flex items-center gap-3 border-t border-line pt-4">
            <Link
              href={href}
              className="flex h-8 flex-1 items-center justify-center rounded-2xl bg-surface text-sm font-medium text-brand transition hover:bg-tag"
            >
              عرض تفاصيل
            </Link>
            {share('')}
            <SaveButton />
          </div>
        )}
      </div>
    </article>
  )
}
