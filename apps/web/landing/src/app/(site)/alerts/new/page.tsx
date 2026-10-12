import type { Metadata } from 'next'

import AlertForm from '@/components/account/AlertForm'
import RequireAccount from '@/components/account/RequireAccount'
import PageHeader from '@/components/layout/PageHeader'

export const metadata: Metadata = { title: 'إضافة تنبيه — بيوتنا' }

export default function NewAlertPage() {
  return (
    <>
      <PageHeader title="إضافة تنبيه" />
      <RequireAccount text="سجل حسابك لإضافة التنبيهات ومتابعة العقارات التي تهمك.">
        <AlertForm />
      </RequireAccount>
    </>
  )
}
