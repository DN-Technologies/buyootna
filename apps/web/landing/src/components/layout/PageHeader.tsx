import Image from 'next/image'
import Link from 'next/link'
import { Fragment } from 'react'

import SiteNav from '@/components/layout/SiteNav'

interface PageHeaderProps {
  // Omit when the page shows its own title below the band
  title?: string
  // The page's name in the trail, when it differs from the title
  crumb?: string
  // Pages between the home page and this one
  trail?: { label: string; href: string }[]
}

const chevron = (
  <Image src="/landing/crumb-chevron.svg" alt="" width={12} height={12} />
)

/**
 * The top of an inner page: the hero's backdrop as a short band, the nav,
 * the trail back to the home page and the page title.
 */
export default function PageHeader({
  title,
  crumb = title,
  trail = [],
}: PageHeaderProps) {
  return (
    // Above the content, so the nav's menus can hang over it
    <div className="relative z-10 bg-[#F9F9F9] pt-6 pb-8 md:pt-12 md:pb-10">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <Image
          src="/landing/hero-photo.jpg"
          alt=""
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-15"
        />
        <Image
          src="/landing/hero-pattern.png"
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-60 mix-blend-color-dodge"
        />
        <div className="absolute inset-0 bg-linear-to-b from-transparent to-white" />
      </div>

      <div className="relative flex flex-col gap-2">
        <SiteNav />
        <div className="mx-auto w-full max-w-7xl px-5">
          <nav
            aria-label="مسار الصفحة"
            className="flex h-9.25 items-center gap-1.5 px-4 text-sm tracking-[-0.408px] md:px-8"
          >
            <Link href="/" className="text-[#A0A0A0] transition hover:text-ink">
              الرئيسية
            </Link>
            {trail.map((step) => (
              <Fragment key={step.href}>
                {chevron}
                <Link
                  href={step.href}
                  className="text-[#A0A0A0] transition hover:text-ink"
                >
                  {step.label}
                </Link>
              </Fragment>
            ))}
            {chevron}
            <span aria-current="page" className="truncate text-ink">
              {crumb}
            </span>
          </nav>
          {title && (
            <h1 className="text-center text-[28px] leading-normal font-bold tracking-[-0.72px] text-ink md:text-4xl">
              {title}
            </h1>
          )}
        </div>
      </div>
    </div>
  )
}
