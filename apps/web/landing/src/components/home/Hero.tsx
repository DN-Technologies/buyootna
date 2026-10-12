import Image from 'next/image'

import SearchFilter from '@/components/home/SearchFilter'
import SiteNav from '@/components/layout/SiteNav'

/** The opening screen: backdrop, the floating nav, headline and the search. */
export default function Hero() {
  return (
    // Above the sections that follow, so the search panels can hang over them
    <div className="relative z-10 bg-[#F9F9F9]">
      {/* Backdrop: a faint skyline photo fading to white, under a soft pattern */}
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

      <div className="relative pt-6 md:pt-12">
        <SiteNav />

        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-10 px-5 pt-14 pb-16 md:gap-12 md:pt-25 md:pb-39">
          <div className="flex flex-col items-center gap-4 text-center">
            <h1 className="text-[34px] leading-[1.4] font-extrabold tracking-[-1.2px] text-ink md:text-[48px] md:leading-normal lg:text-[60px] lg:whitespace-nowrap">
              مستقبلك العقاري يبدأ من هنا
            </h1>
            <p className="max-w-195.25 text-base leading-[1.6] font-medium text-[#363636] md:text-[22px] md:leading-normal">
              اكتشف العقارات والخدمات والفرص العقارية التي تناسب احتياجاتك مع
              المزادات والصفقات في مكان واحد.
            </p>
          </div>

          <SearchFilter withServices />
        </div>
      </div>
    </div>
  )
}
