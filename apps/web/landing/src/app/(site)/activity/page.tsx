import type { Metadata } from 'next'
import Image from 'next/image'

import GuestPrompt from '@/components/layout/GuestPrompt'
import PageHeader from '@/components/layout/PageHeader'

export const metadata: Metadata = {
  title: 'نشاطي — بيوتنا',
  description: 'أدر إعلاناتك وتنبيهاتك وعروض الأسعار الخاصة بك على بيوتنا.',
}

/** Ads, alerts and quote requests belong to an account; a visitor is invited to sign in. */
export default function ActivityPage() {
  return (
    <>
      <PageHeader title="نشاطي" />
      <GuestPrompt
        icon={
          <Image
            src="/landing/guest-activity.svg"
            alt=""
            width={112}
            height={77}
          />
        }
        title="ابدأ رحلتك العقارية"
        text="سجل حسابك لإدارة الإعلانات والتنبيهات وعروض الأسعار الخاصة بك"
      />
    </>
  )
}
