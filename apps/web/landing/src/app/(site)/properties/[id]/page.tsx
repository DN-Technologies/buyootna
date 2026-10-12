import type { Metadata } from 'next'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import type { ReactNode } from 'react'

import PageHeader from '@/components/layout/PageHeader'
import AdvertiserCard, {
  StartChatButton,
} from '@/components/property/AdvertiserCard'
import PropertyActions from '@/components/property/PropertyActions'
import PropertyGallery from '@/components/property/PropertyGallery'
import StickySummary from '@/components/property/StickySummary'
import ViewCounter from '@/components/property/ViewCounter'
import {
  CATEGORY_LABELS,
  categoryCounts,
  LISTING_TYPES,
} from '@/lib/categories'
import { getProperty } from '@/lib/data'
import { formatNumber, timeAgo } from '@/lib/format'
import { AREAS } from '@/lib/locations'
import type { PropertyDetails } from '@/lib/types'

interface PageProps {
  params: Promise<{ id: string }>
}

/** "شقة للايجار بالسالمية": category, deal and, when known, the area. */
function titleOf(property: PropertyDetails): string {
  const category = CATEGORY_LABELS[property.category] ?? 'عقار'
  const deal =
    LISTING_TYPES.find((type) => type.id === property.type)?.tab ?? ''
  const area = (AREAS[property.governorateId ?? ''] ?? []).find(
    (item) => item.id === property.areaId,
  )?.label
  return [category, deal, area ? `ب${area}` : ''].filter(Boolean).join(' ')
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const property = await getProperty((await params).id)
  if (!property) return { title: 'الإعلان غير موجود — بيوتنا' }
  return {
    title: `${titleOf(property)} — بيوتنا`,
    description: property.description?.slice(0, 160),
    openGraph: { images: property.images.slice(0, 1) },
  }
}

/** A titled block of the details card, with the rule above it. */
function Block({ title, children }: { title?: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-4 border-t-[0.8px] border-line pt-6 first:border-t-0 first:pt-0">
      {title && (
        <h3 className="text-base font-semibold tracking-[0.32px] text-muted">
          {title}
        </h3>
      )}
      {children}
    </section>
  )
}

/** Free text an advertiser typed, keeping their line breaks. */
function Lines({ text }: { text: string }) {
  return (
    <p className="text-base leading-normal font-medium tracking-[-0.408px] whitespace-pre-line text-ink">
      {text}
    </p>
  )
}

/** Icon-and-text facts in a row, a thin rule between each. */
function Facts({ items }: { items: { icon: string; text: string }[] }) {
  return (
    <div className="flex flex-wrap items-center gap-x-4.5 gap-y-2 text-[15px] font-medium tracking-[-0.408px] text-ink">
      {items.map((item, index) => (
        <span
          key={item.text}
          className={`flex items-center gap-2 ${
            index > 0 ? 'border-r border-line pr-4.5' : ''
          }`}
        >
          <Image
            src={item.icon}
            alt=""
            width={18}
            height={18}
            // The bed and bath icons are stored upside down in the design file
            className={/bed|bath/.test(item.icon) ? '-scale-y-100' : undefined}
          />
          {item.text}
        </span>
      ))}
    </div>
  )
}

export default async function PropertyPage({ params }: PageProps) {
  const { id } = await params
  const property = await getProperty(id)
  if (!property) notFound()

  const title = titleOf(property)
  const path = `/properties/${property.id}`
  const published = timeAgo(property.publishedAt ?? property.createdAt)
  const counts = categoryCounts(property.category)
  const features = (property.features ?? [])
    .map((feature) => (typeof feature === 'string' ? feature : feature?.label))
    .filter((label): label is string => !!label)
  const hasIncome = !!property.propertyIncome && property.propertyIncome > 0
  const hasPlace = property.latitude !== null && property.longitude !== null

  const years = [
    property.requestYear && {
      icon: '/landing/detail-year.svg',
      text: `سنة الطلب ${property.requestYear}`,
    },
    property.requiredYear && {
      icon: '/landing/detail-year.svg',
      text: `السنة المطلوبة ${property.requiredYear}`,
    },
  ].filter((item): item is { icon: string; text: string } => !!item)
  const rooms = [
    counts.floors &&
      property.floors && {
        icon: '/landing/detail-floors.svg',
        text: `${property.floors} دور`,
      },
    counts.rooms &&
      property.beds && {
        icon: '/landing/detail-bed.svg',
        text: `${property.beds} غرف`,
      },
    counts.baths &&
      property.baths && {
        icon: '/landing/detail-bath.svg',
        text: `${property.baths} حمام`,
      },
  ].filter((item): item is { icon: string; text: string } => !!item)

  // Title, price and the line of facts under them; `compact` is the copy
  // that stays at the top of the window
  const summary = (compact: boolean) => (
    <div className={`flex min-w-0 flex-col ${compact ? 'gap-2' : 'gap-4.5'}`}>
      <div className={`flex flex-col ${compact ? 'gap-1' : 'gap-3'}`}>
        {compact ? (
          <p className="truncate text-lg font-semibold tracking-[0.36px] text-ink">
            {title}
          </p>
        ) : (
          <h1 className="text-2xl leading-normal font-semibold tracking-[0.48px] text-ink">
            {title}
          </h1>
        )}
        <p className="flex items-end gap-0.5 text-brand">
          {property.price !== null ? (
            <>
              <span
                className={`leading-none font-semibold ${compact ? 'text-2xl' : 'text-[32px]'}`}
              >
                {formatNumber(property.price)}
              </span>
              <span className="text-xl leading-none font-semibold tracking-[0.4px]">
                د.ك
              </span>
              {property.type === 'RENT' && (
                <span className="pr-1 text-lg leading-none font-medium text-muted">
                  / شهرياً
                </span>
              )}
            </>
          ) : (
            <span className="text-xl font-semibold">السعر غير معلن</span>
          )}
        </p>
      </div>
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-base font-semibold tracking-[0.32px] text-muted">
        <span className="flex min-w-0 items-center gap-1">
          <Image
            src="/landing/card-location.svg"
            alt=""
            width={20}
            height={20}
          />
          <span className="truncate">{property.location}</span>
        </span>
        {!!property.areaSize && (
          <span className="flex items-center gap-1 border-r border-line pr-3">
            <Image src="/landing/card-area.svg" alt="" width={20} height={20} />
            {formatNumber(property.areaSize)} م2
          </span>
        )}
        {hasIncome && (
          <span className="flex items-center gap-1.5 border-r border-line pr-3">
            مدخول العقار
            <span className="font-bold text-success">
              {formatNumber(property.propertyIncome!)} د.ك
            </span>
          </span>
        )}
      </div>
    </div>
  )

  return (
    <>
      <PageHeader
        crumb={title}
        trail={[{ label: 'العقارات', href: '/properties' }]}
      />
      <ViewCounter id={property.id} />

      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-5 pb-24">
        <StickySummary
          summary={
            <div className="flex items-start justify-between gap-4">
              <div className="flex min-w-0 flex-1 flex-col gap-3">
                {summary(true)}
                <StartChatButton className="w-full sm:w-74" />
              </div>
              <div className="hidden md:block">
                <PropertyActions path={path} title={title} />
              </div>
            </div>
          }
        >
          <div className="flex items-start justify-between gap-4">
            {summary(false)}
            <PropertyActions path={path} title={title} />
          </div>
        </StickySummary>

        <div className="flex flex-col gap-5 lg:flex-row lg:items-start">
          <div className="flex min-w-0 flex-1 flex-col gap-6">
            <PropertyGallery
              images={property.images ?? []}
              alt={title}
              isFeatured={property.isFeatured}
              published={published}
              views={property.views}
            />

            <div className="flex flex-col gap-2">
              <h2 className="flex h-10 items-center text-lg font-bold text-ink">
                تفاصيل العقار
              </h2>
              <div className="flex flex-col gap-6 rounded-lg border border-line bg-white p-5">
                {years.length > 0 && (
                  <Block>
                    <Facts items={years} />
                  </Block>
                )}
                {rooms.length > 0 && (
                  <Block>
                    <Facts items={rooms} />
                  </Block>
                )}
                {features.length > 0 && (
                  <Block title="مزايا العقار">
                    <div className="flex flex-wrap gap-2">
                      {features.map((feature) => (
                        <span
                          key={feature}
                          className="flex h-7 items-center rounded-2xl border border-line bg-tag px-3 text-[15px] font-medium tracking-[-0.408px] text-ink"
                        >
                          {feature}
                        </span>
                      ))}
                    </div>
                  </Block>
                )}
                {property.rentConditions && (
                  <Block title="شروط الايجار">
                    <Lines text={property.rentConditions} />
                  </Block>
                )}
                {property.additionalExpenses && (
                  <Block title="المصاريف الإضافية">
                    <Lines text={property.additionalExpenses} />
                  </Block>
                )}
                {property.allocationStatus && (
                  <Block title="حالة التخصيص">
                    <Lines text={property.allocationStatus} />
                  </Block>
                )}
                {property.description && (
                  <Block title="الوصف">
                    <Lines text={property.description} />
                  </Block>
                )}

                {hasPlace && (
                  <div className="relative h-52.25 w-full overflow-hidden rounded-md border-[0.67px] border-[#E8E8E8] shadow-[0_0_1.3px_#C8C8C8]">
                    <iframe
                      title="الموقع على الخريطة"
                      loading="lazy"
                      className="absolute inset-0 h-full w-full grayscale-[0.6]"
                      src={`https://www.openstreetmap.org/export/embed.html?bbox=${
                        property.longitude! - 0.008
                      },${property.latitude! - 0.004},${property.longitude! + 0.008},${
                        property.latitude! + 0.004
                      }&layer=mapnik`}
                    />
                    {/* The design's own pin and label, over the map's centre */}
                    <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-1.5">
                      <Image
                        src="/landing/detail-pin.svg"
                        alt=""
                        width={28}
                        height={28}
                      />
                      <span className="rounded-md bg-white/85 px-2 py-0.5 text-sm font-bold text-brand">
                        الموقع على الخريطة
                      </span>
                    </div>
                    <a
                      href={`https://www.google.com/maps?q=${property.latitude},${property.longitude}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="فتح الموقع في خرائط جوجل"
                      className="absolute bottom-3 left-3"
                    >
                      <Image
                        src="/landing/detail-expand.svg"
                        alt=""
                        width={40}
                        height={40}
                      />
                    </a>
                  </div>
                )}

                <p className="text-center text-sm tracking-[-0.408px] text-muted">
                  رقم المرجعي للاعلان:{' '}
                  <span dir="ltr">{property.referenceNumber}</span>
                </p>
              </div>
            </div>
          </div>

          <AdvertiserCard property={property} />
        </div>
      </div>
    </>
  )
}
