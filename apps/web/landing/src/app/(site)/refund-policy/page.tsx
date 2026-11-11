import type { Metadata } from 'next'

import LegalDocument from '@/components/layout/LegalDocument'
import PageHeader from '@/components/layout/PageHeader'
import { REFUND_POLICY } from '@/lib/legal/refund'

export const metadata: Metadata = {
  title: 'سياسة الاسترجاع والاسترداد — بيوتنا',
  description:
    'متى يمكن استرداد المبلغ في بيوتنا، وكيف تطلب الاسترجاع، وكيف تُعاد المبالغ.',
}

export default function RefundPolicyPage() {
  return (
    <>
      <PageHeader title="سياسة الاسترجاع والاسترداد" />
      <LegalDocument blocks={REFUND_POLICY} />
    </>
  )
}
