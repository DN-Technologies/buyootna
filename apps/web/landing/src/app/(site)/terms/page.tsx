import type { Metadata } from 'next'

import LegalDocument from '@/components/layout/LegalDocument'
import PageHeader from '@/components/layout/PageHeader'
import { TERMS_OF_USE } from '@/lib/legal/terms'

export const metadata: Metadata = {
  title: 'شروط الاستخدام — بيوتنا',
  description: 'الشروط والأحكام المنظمة لاستخدام تطبيق وموقع بيوتنا.',
}

export default function TermsPage() {
  return (
    <>
      <PageHeader title="شروط الاستخدام" />
      <LegalDocument blocks={TERMS_OF_USE} />
    </>
  )
}
