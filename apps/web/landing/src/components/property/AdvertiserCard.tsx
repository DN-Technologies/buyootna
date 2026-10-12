/* eslint-disable @next/next/no-img-element -- advertiser photos come from
   storage hosts the image optimizer isn't configured for */
import Image from 'next/image'

import AccountAction from '@/components/ui/AccountAction'
import InitialTile from '@/components/ui/InitialTile'
import type { PropertyDetails } from '@/lib/types'

const ROLE_LINES: Record<string, string> = {
  COMPANY: 'شركة',
  OFFICE: 'مكتب عقاري',
}

/** The chat button; a visitor gets the sign-in dialog. */
export function StartChatButton({
  className = 'w-full',
}: {
  className?: string
}) {
  return (
    <AccountAction
      className={`flex h-12 items-center justify-center gap-2 rounded-3xl bg-brand px-3 text-sm font-bold tracking-[0.28px] text-white transition hover:bg-brand-dark ${className}`}
    >
      <Image src="/landing/detail-chat.svg" alt="" width={16} height={16} />
      ابدأ المحادثة
    </AccountAction>
  )
}

/** "تواصل مع المعلن": who posted the ad and the ways to reach them. */
export default function AdvertiserCard({
  property,
}: {
  property: PropertyDetails
}) {
  const { host } = property
  // The API sends a stock placeholder when the advertiser has no photo
  const photo =
    host.avatarUrl && !host.avatarUrl.includes('placeholder')
      ? host.avatarUrl
      : null
  const phone = property.phoneNumber || host.phone

  return (
    <aside className="flex w-full shrink-0 flex-col gap-4 rounded-lg bg-tag px-5 pt-4 pb-6 lg:w-100">
      <div className="flex flex-col gap-7">
        <div className="flex flex-col gap-4">
          <h2 className="flex h-10 items-center text-base font-bold text-ink">
            تواصل مع المعلن
          </h2>
          <div className="flex items-center gap-3.5">
            {photo ? (
              <img
                src={photo}
                alt=""
                className="h-16 w-16 shrink-0 rounded-full object-cover"
              />
            ) : (
              <InitialTile
                name={host.name}
                size={64}
                className="rounded-full"
              />
            )}
            <div className="flex min-w-0 flex-col gap-2.5">
              <p className="flex items-center gap-2 text-[17px] leading-[1.2] font-semibold text-ink">
                <span className="truncate">{host.name}</span>
                {host.isVerified && (
                  <Image
                    src="/landing/detail-verified.svg"
                    alt="موثّق"
                    width={14}
                    height={14}
                    className="shrink-0"
                  />
                )}
              </p>
              <p className="truncate text-sm font-medium tracking-[-0.408px] text-muted">
                {ROLE_LINES[host.role] ??
                  `مضيف في بيوتنا منذ ${host.joinedDate}`}
              </p>
              {host.rating > 0 && (
                <p className="flex items-center gap-0.5 text-sm font-medium tracking-[-0.408px] text-ink">
                  <Image
                    src="/landing/detail-star.svg"
                    alt=""
                    width={12}
                    height={12}
                  />
                  {host.rating.toFixed(1)}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <StartChatButton />
          {phone && (
            <a
              href={`tel:${phone}`}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-3xl text-sm font-bold tracking-[0.28px] text-brand transition hover:bg-white"
            >
              <Image
                src="/landing/detail-phone.svg"
                alt=""
                width={16}
                height={16}
              />
              اتصال
            </a>
          )}
        </div>
      </div>

      {property.licenseNumber && (
        <p className="flex items-center justify-center gap-1.5 text-[15px] font-medium tracking-[-0.408px] text-ink">
          <Image
            src="/landing/detail-license.svg"
            alt=""
            width={14.5}
            height={16}
          />
          رقم الرخصة <span dir="ltr">{property.licenseNumber}</span>
        </p>
      )}
    </aside>
  )
}
