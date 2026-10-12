import type { Metadata } from 'next'

import LegalDocument from '@/components/layout/LegalDocument'
import PageHeader from '@/components/layout/PageHeader'
import { PRIVACY_POLICY } from '@/lib/legal/privacy'

export const metadata: Metadata = {
  title: 'سياسة الخصوصية — بيوتنا',
  description: 'كيف يجمع تطبيق بيوتنا بياناتك ويستخدمها ويحميها.',
}

export default function PrivacyPage() {
  return (
    <>
      <PageHeader title="سياسة الخصوصية" />
      <LegalDocument blocks={PRIVACY_POLICY} />
    </>
  )
}
