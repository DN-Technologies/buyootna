import Image from 'next/image'

import { STORE_LINKS } from '@/lib/siteLinks'

/** A phone frame around one app screenshot. */
function Phone({ screen, className }: { screen: string; className: string }) {
  return (
    <div
      className={`absolute aspect-183/375 w-45.75 rounded-[34px] bg-linear-to-b from-[#333339] to-black p-2.25 shadow-xl ${className}`}
    >
      <div className="relative h-full w-full overflow-hidden rounded-[26px] bg-white">
        <Image
          src={screen}
          alt=""
          fill
          sizes="183px"
          className="object-cover"
        />
      </div>
      <div className="absolute top-1.75 left-1/2 h-4.5 w-23.5 -translate-x-1/2 rounded-b-xl bg-black" />
    </div>
  )
}

/** "تجربتك العقارية أسهل على تطبيق بيوتنا": the app promo with store buttons. */
export default function MobileAppPromo() {
  return (
    <div id="app" className="relative overflow-hidden bg-[#F7F8FA]">
      <Image
        src="/landing/app-pattern.png"
        alt=""
        fill
        sizes="100vw"
        aria-hidden
        className="object-cover opacity-45 mix-blend-color-dodge"
      />

      <div className="relative mx-auto flex w-full max-w-7xl flex-col items-center gap-10 px-5 py-16 lg:flex-row lg:justify-between lg:gap-21.25">
        <div className="flex flex-col gap-8 lg:max-w-135.5">
          <div className="flex flex-col gap-4">
            <h2 className="text-[22px] leading-normal font-bold tracking-[-0.52px] text-ink md:text-[26px]">
              تجربتك العقارية أسهل على تطبيق بيوتنا
            </h2>
            <p className="text-base leading-normal font-medium text-muted md:text-lg">
              حمّل تطبيق بيوتنا واستمتع بتجربة أسرع وأسهل للبحث عن العقارات،
              اكتشاف الخدمات، ومتابعة عقاراتك ورسائل العملاء أينما كنت.
            </p>
          </div>

          <div
            dir="ltr"
            className="flex flex-wrap items-center justify-end gap-4 sm:gap-8"
          >
            <a
              href={STORE_LINKS.googlePlay}
              aria-label="متوفر على Google Play"
              className="flex h-12 items-center gap-1.75 rounded-md bg-black px-6 shadow-[0_0_4px_rgba(0,0,0,0.25)]"
            >
              <span className="flex flex-col items-end gap-1">
                <span className="text-[10px] leading-none font-medium text-white">
                  متوفر على
                </span>
                {/* The wordmark is stored upside down in the design file */}
                <Image
                  src="/landing/google-play-wordmark.svg"
                  alt="Google Play"
                  width={74}
                  height={15}
                  className="-scale-y-100"
                />
              </span>
              <Image
                src="/landing/google-play.svg"
                alt=""
                width={21}
                height={24}
              />
            </a>
            <a
              href={STORE_LINKS.appStore}
              aria-label="متوفر على App Store"
              className="flex h-12 items-center gap-2 rounded-md bg-black px-6 shadow-[0_0_4px_rgba(0,0,0,0.25)]"
            >
              <span className="flex flex-col items-end gap-1 text-white">
                <span className="text-[9px] leading-none font-medium">
                  متوفر على
                </span>
                <span className="text-lg leading-none font-medium tracking-[-0.47px]">
                  App Store
                </span>
              </span>
              <Image src="/landing/apple.svg" alt="" width={20} height={24} />
            </a>
          </div>
        </div>

        {/* Three phones: two behind, one in front and lower */}
        <div
          aria-hidden
          className="relative h-125.5 w-110 max-w-full shrink-0 origin-top scale-[0.72] sm:scale-100"
        >
          <div className="absolute top-15 left-32.5 h-73 w-73 rounded-full bg-[#E6E9EF]" />
          <div className="absolute -top-5 -left-15 h-73 w-73 rounded-full bg-[#ECEFF4]" />
          <Phone screen="/landing/app-screen-1.png" className="top-0 left-0" />
          <Phone
            screen="/landing/app-screen-2.png"
            className="top-0 left-64.25"
          />
          <Phone
            screen="/landing/app-screen-3.png"
            className="top-31.25 left-34.5"
          />
        </div>
      </div>
    </div>
  )
}
