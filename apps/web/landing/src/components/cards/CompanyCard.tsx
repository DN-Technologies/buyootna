/* eslint-disable @next/next/no-img-element -- company logos are uploaded to
   storage hosts the image optimizer isn't configured for */
import Image from 'next/image'

import InitialTile from '@/components/ui/InitialTile'
import { splitServices } from '@/lib/format'
import type { Company } from '@/lib/types'
import AccountAction from '@/components/ui/AccountAction'

/** A service company: logo, services, rating, projects and the quote CTA. */
export default function CompanyCard({ company }: { company: Company }) {
  const services = splitServices(company.category).slice(0, 3)

  return (
    <article className="flex h-full w-full flex-col gap-4 rounded-md border border-line bg-[#FEFEFE] p-3.5">
      <div className="flex items-start gap-2.5">
        {company.logoUrl ? (
          <img
            src={company.logoUrl}
            alt={`شعار ${company.name}`}
            loading="lazy"
            className="h-19 w-19 shrink-0 rounded-sm object-cover"
          />
        ) : (
          <InitialTile name={company.name} size={76} className="rounded-sm" />
        )}

        <div className="flex min-w-0 flex-1 flex-col gap-3">
          <div className="flex items-center gap-1.5">
            <h3 className="truncate text-base font-semibold leading-tight text-ink">
              {company.name}
            </h3>
            {company.isVerified && (
              <Image
                src="/landing/verified.svg"
                alt="موثق"
                width={11}
                height={12}
              />
            )}
          </div>

          {services.length > 0 && (
            <ul className="flex flex-wrap gap-2">
              {services.map((service) => (
                <li
                  key={service}
                  className="rounded-xl bg-tag px-1.75 py-1 text-sm font-medium text-brand"
                >
                  {service}
                </li>
              ))}
            </ul>
          )}

          <div className="flex items-center gap-3">
            <span className="flex items-center gap-0.5 text-sm font-medium text-ink">
              <Image src="/landing/star.svg" alt="" width={12} height={12} />
              {company.rating.toFixed(1)}
            </span>
            <span className="text-[13px] font-medium text-muted">
              {company.reviewsCount} تقييم
            </span>
          </div>
        </div>

        <AccountAction aria-label="أضف إلى المفضلة" className="shrink-0 pt-2.5">
          <Image
            src="/landing/company-heart.svg"
            alt=""
            width={24}
            height={24}
          />
        </AccountAction>
      </div>

      <dl className="mt-auto flex items-stretch justify-between border-t border-line px-2 pt-4 text-center font-medium">
        <div className="flex flex-1 flex-col gap-2">
          <dt className="text-sm text-ink">منطقة الخدمة</dt>
          <dd className="truncate text-[13px] text-muted">
            {company.serviceArea || 'الكويت'}
          </dd>
        </div>
        <div className="mx-2 w-px bg-line" />
        <div className="flex flex-1 flex-col gap-2">
          <dt className="text-sm text-ink">{company.projectsCount}</dt>
          <dd className="text-[13px] text-muted">مشاريع مكتملة</dd>
        </div>
      </dl>

      <div className="flex items-center gap-2">
        {/* Both need an account */}
        <AccountAction className="flex h-11 flex-1 items-center justify-center rounded-full bg-brand text-sm font-semibold text-white transition hover:bg-brand-dark">
          طلب عرض سعر
        </AccountAction>
        <AccountAction
          aria-label="محادثة"
          className="flex h-11 flex-1 items-center justify-center rounded-full border border-[#E2E8F0] bg-white transition hover:bg-tag"
        >
          <Image
            src="/landing/company-chat.svg"
            alt=""
            width={20}
            height={20}
          />
        </AccountAction>
      </div>
    </article>
  )
}
