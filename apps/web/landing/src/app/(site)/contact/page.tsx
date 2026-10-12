import type { Metadata } from 'next'
import Image from 'next/image'
import type { ReactNode } from 'react'

import PageHeader from '@/components/layout/PageHeader'
import { CONTACT } from '@/lib/siteLinks'

export const metadata: Metadata = {
  title: 'تواصل معنا — بيوتنا',
  description:
    'تواصل مع فريق بيوتنا عبر الهاتف أو واتساب أو البريد الالكتروني.',
}

// The brand marks come from the design as separate coloured pieces, placed
// by the same insets the design uses
const piece = 'absolute block h-full w-full'

const CallTile = (
  <span className="flex h-12.5 w-12.5 shrink-0 items-center justify-center rounded-xl bg-brand">
    <Image src="/landing/contact-call.svg" alt="" width={24} height={24} />
  </span>
)

const WhatsAppTile = (
  <span className="relative h-12.5 w-12.5 shrink-0 rounded-xl bg-[#60D669]">
    <span className="absolute top-3.25 right-[26%] left-[26%] aspect-128/129">
      <span className="absolute inset-[1.73%_1.74%_2.06%_1.73%]">
        <Image src="/landing/wa-1.svg" alt="" fill className={piece} />
      </span>
      <span className="absolute inset-[0_0_0.33%_0]">
        <Image src="/landing/wa-2.svg" alt="" fill className={piece} />
      </span>
      <span className="absolute inset-[26.58%_24.53%_26.89%_24.9%]">
        <Image src="/landing/wa-3.svg" alt="" fill className={piece} />
      </span>
    </span>
  </span>
)

const MailTile = (
  <span className="relative h-12.5 w-12.5 shrink-0 rounded-xl bg-white">
    <span className="absolute top-4 right-[26%] left-[26%] aspect-256/193">
      <span className="absolute inset-[25.65%_77.27%_0.49%_0]">
        <Image src="/landing/gmail-1.svg" alt="" fill className={piece} />
      </span>
      <span className="absolute inset-[25.65%_-0.01%_0.49%_77.28%]">
        <Image src="/landing/gmail-2.svg" alt="" fill className={piece} />
      </span>
      <span className="absolute inset-[9.07%_20.91%_24.61%_21.09%]">
        <Image src="/landing/gmail-3.svg" alt="" fill className={piece} />
      </span>
      <span className="absolute inset-[0_-0.01%_51.74%_77.28%]">
        <Image src="/landing/gmail-4.svg" alt="" fill className={piece} />
      </span>
      <span className="absolute inset-[0_77.27%_51.74%_0]">
        <Image src="/landing/gmail-5.svg" alt="" fill className={piece} />
      </span>
    </span>
  </span>
)

const CHANNELS: {
  label: string
  value: string
  href: string
  tile: ReactNode
}[] = [
  {
    label: 'رقم الدعم',
    value: CONTACT.phone,
    href: `tel:${CONTACT.phone}`,
    tile: CallTile,
  },
  {
    label: 'واتساب',
    value: CONTACT.whatsapp,
    href: `https://wa.me/965${CONTACT.whatsapp}`,
    tile: WhatsAppTile,
  },
  {
    label: 'البريد الالكتروني',
    value: CONTACT.supportEmail,
    href: `mailto:${CONTACT.supportEmail}`,
    tile: MailTile,
  },
]

export default function ContactPage() {
  return (
    <>
      <PageHeader title="تواصل معنا" />
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 pt-4 pb-24 md:px-9">
        <section className="flex flex-col gap-6">
          <Image
            src="/landing/logo-full.png"
            alt="Buyootna"
            width={121}
            height={82}
          />
          <p className="text-base leading-normal font-medium tracking-[-0.408px] text-ink">
            لا تتردد في الاتصال بنا، سواء كان لديك اقتراح لتحسين خدماتنا، أو
            شكوى ترغب في مناقشتها، أو مشكلة تحتاج إلى حل.
          </p>
        </section>

        <section className="flex flex-col gap-4">
          <h2 className="text-base font-semibold tracking-[0.32px] text-ink">
            معلومات التواصل
          </h2>
          <div className="grid gap-2 md:grid-cols-3">
            {CHANNELS.map((channel) => (
              <a
                key={channel.label}
                href={channel.href}
                className="flex items-center justify-between rounded-md border-[0.5px] border-line bg-surface p-3 transition hover:border-brand"
              >
                <span className="flex min-w-0 items-center gap-4">
                  {channel.tile}
                  <span className="flex min-w-0 flex-col gap-1 text-sm">
                    <span className="font-semibold tracking-[0.28px] text-ink">
                      {channel.label}
                    </span>
                    <span
                      dir="ltr"
                      className="truncate text-right font-medium tracking-[-0.408px] text-muted"
                    >
                      {channel.value}
                    </span>
                  </span>
                </span>
                <Image
                  src="/landing/contact-link.svg"
                  alt=""
                  width={21}
                  height={21}
                  className="shrink-0"
                />
              </a>
            ))}
          </div>
        </section>
      </div>
    </>
  )
}
