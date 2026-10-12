/* eslint-disable @next/next/no-img-element -- office logos are uploaded to
   storage hosts the image optimizer isn't configured for */
import Image from 'next/image'
import Link from 'next/link'

import InitialTile from '@/components/ui/InitialTile'
import { LOGIN_PATH } from '@/lib/siteLinks'
import type { Office } from '@/lib/types'

/** A real-estate office: logo, name, location, rating and contact buttons. */
export default function OfficeCard({ office }: { office: Office }) {
  return (
    <article className="flex h-full w-full flex-col gap-4 rounded-lg border border-line bg-white p-4">
      <div className="flex items-start gap-2">
        {office.logoUrl ? (
          <img
            src={office.logoUrl}
            alt={`شعار ${office.name}`}
            loading="lazy"
            className="h-12 w-12 shrink-0 rounded-lg object-cover"
          />
        ) : (
          <InitialTile name={office.name} size={48} className="rounded-lg" />
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <div className="flex items-center gap-1">
            <h3 className="truncate text-[15px] font-bold leading-tight text-[#0F172B]">
              {office.name}
            </h3>
            {office.isVerified && (
              <Image
                src="/landing/office-verified.svg"
                alt="موثق"
                width={14}
                height={13}
              />
            )}
          </div>
          {office.location && (
            <p className="flex items-center gap-0.5 text-sm text-muted">
              <Image
                src="/landing/card-location.svg"
                alt=""
                width={16}
                height={16}
              />
              <span className="truncate">{office.location}</span>
            </p>
          )}
        </div>

        <Link
          href={LOGIN_PATH}
          aria-label="أضف إلى المفضلة"
          className="shrink-0"
        >
          <Image
            src="/landing/company-heart.svg"
            alt=""
            width={24}
            height={24}
          />
        </Link>
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-[#F1F5F9] pt-3">
        <div className="flex items-center gap-1 text-[13px] font-medium text-muted">
          <span className="flex items-center gap-0.5 text-sm text-ink">
            <Image src="/landing/star.svg" alt="" width={12} height={12} />
            {office.rating.toFixed(1)}
          </span>
          ( {office.reviewsCount} تقييم )
        </div>
        <div className="flex items-center gap-2">
          {office.phone && (
            <a
              href={`tel:${office.phone}`}
              aria-label={`اتصل بـ ${office.name}`}
              className="flex h-7.5 w-10 items-center justify-center rounded-full border border-brand transition hover:bg-tag"
            >
              <Image
                src="/landing/office-phone.svg"
                alt=""
                width={16}
                height={16}
              />
            </a>
          )}
          <Link
            href={LOGIN_PATH}
            aria-label="محادثة"
            className="flex h-7.5 w-10 items-center justify-center rounded-full border border-[#B28648] transition hover:bg-tag"
          >
            <Image
              src="/landing/office-chat.svg"
              alt=""
              width={16}
              height={16}
            />
          </Link>
        </div>
      </div>
    </article>
  )
}
