import Link from 'next/link'

import PageHeader from '@/components/layout/PageHeader'

/** A page or an ad that isn't there (any more). */
export default function NotFound() {
  return (
    <>
      <PageHeader title="الصفحة غير موجودة" />
      <div className="mx-auto flex min-h-80 w-full max-w-7xl flex-col items-center justify-center gap-6 px-5 pb-24 text-center">
        <p className="max-w-105 text-base leading-normal font-medium text-muted">
          قد يكون الإعلان قد أُزيل أو انتهت مدته، أو أن الرابط غير صحيح.
        </p>
        <Link
          href="/properties"
          className="flex h-12 items-center rounded-3xl bg-brand px-8 text-sm font-bold text-white transition hover:bg-brand-dark"
        >
          تصفح العقارات
        </Link>
      </div>
    </>
  )
}
