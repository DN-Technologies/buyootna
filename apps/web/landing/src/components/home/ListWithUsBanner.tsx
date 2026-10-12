import Image from 'next/image'
import AccountAction from '@/components/ui/AccountAction'

/** "اعرض عقارك أو خدمتك على بيوتنا الان": the dark band with the house photo. */
export default function ListWithUsBanner() {
  return (
    <div className="flex flex-col bg-brand lg:h-100 lg:flex-row">
      <div className="flex flex-1 flex-col justify-center gap-10 px-5 py-14 lg:gap-12 lg:py-0 lg:pr-[max(20px,calc((100vw-1240px)/2))] lg:pl-5">
        <div className="flex flex-col gap-4">
          <h2 className="text-2xl leading-normal font-bold tracking-[-0.48px] text-white">
            اعرض عقارك أو خدمتك على بيوتنا الان
          </h2>
          <p className="max-w-139.25 text-[17px] leading-normal font-medium text-[#D7D7D7]">
            حوّل ما تقدمه إلى فرص جديدة، واعرض عقارك أو خدمتك أمام جمهور مهتم
            يبحث عن القيمة التي تقدمها.
          </p>
        </div>
        <div className="flex flex-wrap gap-5">
          <AccountAction className="flex h-12 items-center rounded-full border-[1.4px] border-[#E2E8F0] bg-white px-8 text-sm font-bold text-ink transition hover:bg-surface">
            اعلن عن عقارك
          </AccountAction>
          <AccountAction className="flex h-12 items-center rounded-full border-[1.2px] border-white px-8 text-[15px] font-bold text-white transition hover:bg-white/10">
            اعرض خدمتك
          </AccountAction>
        </div>
      </div>

      <div className="relative h-60 w-full lg:h-full lg:w-[49.3%] lg:shrink-0">
        <Image
          src="/landing/banner-house.jpg"
          alt="منزل حديث عند الغروب"
          fill
          sizes="(min-width: 1024px) 50vw, 100vw"
          className="object-cover"
        />
      </div>
    </div>
  )
}
