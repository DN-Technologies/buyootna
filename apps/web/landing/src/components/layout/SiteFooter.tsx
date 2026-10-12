import Image from 'next/image'
import Link from 'next/link'

import SignupLink from '@/components/auth/SignupLink'
import {
  CONTACT,
  LOGIN_PATH,
  SIGNUP_PATH,
  SOCIAL_LINKS,
  STORE_LINKS,
} from '@/lib/siteLinks'

const COLUMNS = [
  {
    title: 'استكشف',
    links: [
      { label: 'الاعلانات العقارية', href: '/properties' },
      { label: 'الشركات', href: '/companies' },
      { label: 'المكاتب العقارية', href: '/offices' },
    ],
  },
  {
    title: 'الحساب',
    links: [
      { label: 'تسجيل الدخول', href: LOGIN_PATH },
      { label: 'إنشاء حساب', href: SIGNUP_PATH },
      { label: 'المفضلة', href: '/favorites' },
    ],
  },
  {
    title: 'المساعدة',
    links: [
      { label: 'سياسة الخصوصية', href: '/privacy' },
      { label: 'الشروط والأحكام', href: '/terms' },
      { label: 'عن بيوتنا', href: '/about' },
      { label: 'تواصل معنا', href: '/contact' },
    ],
  },
]

const CONTACT_ROWS = [
  {
    icon: '/landing/footer-call.svg',
    text: CONTACT.phone,
    href: `tel:${CONTACT.phone}`,
  },
  {
    icon: '/landing/footer-whatsapp.svg',
    text: CONTACT.whatsapp,
    href: `https://wa.me/965${CONTACT.whatsapp}`,
  },
  {
    icon: '/landing/footer-mail.svg',
    text: CONTACT.email,
    href: `mailto:${CONTACT.email}`,
  },
]

export default function SiteFooter() {
  return (
    <footer>
      <div className="border-t border-white/10 bg-brand pt-16 pb-16 lg:pt-22.5 lg:pb-20.5">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-12 px-5 lg:flex-row lg:items-start lg:gap-10">
          <div className="flex flex-col gap-5 lg:w-[320px] lg:shrink-0">
            <Image
              src="/landing/footer-logo.png"
              alt="بيوتنا"
              width={82}
              height={56}
            />
            <p className="max-w-75.75 text-base font-medium leading-[1.3] text-white">
              وكالة رقمية متكاملة متخصصة في بناء تجارب رقمية استثنائية تحقق
              أهداف عملك وتتجاوز توقعاتك.
            </p>
            <div className="flex items-center gap-3">
              <a href={SOCIAL_LINKS.facebook} aria-label="فيسبوك">
                <Image
                  src="/landing/social-facebook.svg"
                  alt=""
                  width={36}
                  height={36}
                />
              </a>
              <a
                href={SOCIAL_LINKS.instagram}
                aria-label="انستغرام"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1D293D]"
              >
                <Image
                  src="/landing/social-instagram.svg"
                  alt=""
                  width={19}
                  height={18}
                />
              </a>
              <a
                href={SOCIAL_LINKS.x}
                aria-label="إكس"
                className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#1D293D]"
              >
                <Image
                  src="/landing/social-x.svg"
                  alt=""
                  width={17}
                  height={16}
                />
              </a>
            </div>
          </div>

          <div className="grid flex-1 grid-cols-2 gap-8 sm:grid-cols-4">
            {COLUMNS.map((column) => (
              <div key={column.title} className="flex flex-col gap-3">
                <h3 className="text-base font-bold text-white/90">
                  {column.title}
                </h3>
                <ul className="flex flex-col gap-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      {link.href === SIGNUP_PATH ? (
                        <SignupLink className="block py-1 text-sm font-medium text-white/45 transition hover:text-white">
                          {link.label}
                        </SignupLink>
                      ) : (
                        <Link
                          href={link.href}
                          className="block py-1 text-sm font-medium text-white/45 transition hover:text-white"
                        >
                          {link.label}
                        </Link>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="flex flex-col gap-3">
              <h3 className="text-base font-bold text-white/90">التواصل</h3>
              <ul className="flex flex-col gap-2.5">
                {CONTACT_ROWS.map((row) => (
                  <li key={row.icon}>
                    <a
                      href={row.href}
                      className="flex h-6.5 items-center gap-2 text-sm font-medium text-[#9099A0] transition hover:text-white"
                    >
                      <Image src={row.icon} alt="" width={20} height={20} />
                      <span dir="ltr" className="break-all">
                        {row.text}
                      </span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white">
        <div className="mx-auto flex w-full max-w-7xl flex-col items-center gap-4 px-5 py-4 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted">
            © 2026 دار النخبة. جميع الحقوق محفوظة.
          </p>
          <div dir="ltr" className="flex items-center gap-3">
            <a
              href={STORE_LINKS.appStore}
              className="flex h-10 items-center gap-2 rounded-md bg-[#1D293D] px-4 text-sm text-[#CAD5E2]"
            >
              <Image
                src="/landing/footer-appstore.svg"
                alt=""
                width={16}
                height={16}
              />
              App Store
            </a>
            <a
              href={STORE_LINKS.googlePlay}
              className="flex h-10 items-center gap-2 rounded-md bg-[#1D293D] px-4 text-sm text-[#CAD5E2]"
            >
              <Image
                src="/landing/footer-play.svg"
                alt=""
                width={16}
                height={16}
              />
              Google Play
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
