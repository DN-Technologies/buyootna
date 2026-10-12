import Image from 'next/image'
import Link from 'next/link'

import AccountTypeDialog from '@/components/auth/AccountTypeDialog'

// Sign-in and sign-up: the form on one side, the brand panel on the other
export default function AuthLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <div className="flex min-h-screen flex-1 bg-white text-ink">
      <main className="flex min-w-0 flex-1 items-center justify-center px-5 py-10">
        <div className="flex w-full max-w-90 flex-col items-center gap-8">
          {children}
        </div>
      </main>

      <aside className="relative hidden w-[38%] max-w-137 shrink-0 overflow-hidden lg:block">
        <Image
          src="/landing/auth-bg.jpg"
          alt=""
          fill
          priority
          sizes="548px"
          className="object-cover"
        />
        <Link
          href="/"
          aria-label="بيوتنا - الرئيسية"
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <Image
            src="/landing/auth-logo.png"
            alt="Buyootna"
            width={292}
            height={197}
            priority
          />
        </Link>
      </aside>

      <AccountTypeDialog />
    </div>
  )
}
