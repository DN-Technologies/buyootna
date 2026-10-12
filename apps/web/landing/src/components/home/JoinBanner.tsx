import Link from 'next/link'

import SignupLink from '@/components/auth/SignupLink'
import { LOGIN_PATH } from '@/lib/siteLinks'

/** "انضم إلى بيوتنا وابدأ تجربتك": the closing call to sign up. */
export default function JoinBanner() {
  return (
    <div className="bg-brand px-5 py-16 md:py-21">
      <div className="mx-auto flex max-w-205.75 flex-col items-center gap-8 text-center">
        <div className="flex flex-col gap-5">
          <h2 className="text-[26px] leading-normal font-bold tracking-[-0.64px] text-white md:text-[32px]">
            انضم إلى بيوتنا وابدأ تجربتك
          </h2>
          <p className="text-base leading-normal font-medium text-[#D7D7D7] md:text-lg">
            أنشئ حسابك مجانًا واستمتع بتجربة أسهل لاكتشاف العقارات والخدمات
            والصفقات والمزادات، وكن جزءًا من منصة تجمع كل احتياجاتك العقارية في
            مكان واحد.
          </p>
        </div>
        <div className="flex flex-wrap justify-center gap-3">
          <SignupLink className="flex h-12 items-center rounded-full border border-[#E2E8F0] bg-white px-8 text-sm font-bold text-ink transition hover:bg-surface">
            ابدأ تجربتك الان
          </SignupLink>
          <Link
            href={LOGIN_PATH}
            className="flex h-12 items-center rounded-full border-[1.2px] border-white px-8 text-[15px] font-bold text-white transition hover:bg-white/10"
          >
            تسجيل الدخول
          </Link>
        </div>
      </div>
    </div>
  )
}
