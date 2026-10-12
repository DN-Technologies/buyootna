import type { Metadata } from 'next'

import QuoteForm from '@/components/account/QuoteForm'
import RequireAccount from '@/components/account/RequireAccount'
import PageHeader from '@/components/layout/PageHeader'

export const metadata: Metadata = { title: 'تقديم عرض سعر — بيوتنا' }

export default function NewQuotePage() {
  return (
    <>
      <PageHeader title="تقديم عرض سعر" />
      <RequireAccount text="سجل حسابك لطلب عروض الأسعار من شركات الخدمات.">
        <QuoteForm />
      </RequireAccount>
    </>
  )
}
