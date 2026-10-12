'use client'

import { useState } from 'react'

import AdForm from '@/components/account/AdForm'
import RequireAccount from '@/components/account/RequireAccount'
import PageHeader from '@/components/layout/PageHeader'

export default function NewAdPage() {
  const [step, setStep] = useState<'form' | 'preview'>('form')

  return (
    <>
      <PageHeader
        title={step === 'preview' ? 'معاينة الاعلان' : 'إضافة إعلان'}
        trail={step === 'preview' ? [{ label: 'إضافة إعلان', href: '/ads/new' }] : []}
      />
      <RequireAccount text="سجل حسابك لنشر إعلانك والوصول إلى المهتمين بعقارك.">
        <AdForm onStep={setStep} />
      </RequireAccount>
    </>
  )
}
