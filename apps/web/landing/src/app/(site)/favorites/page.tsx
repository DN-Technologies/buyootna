import type { Metadata } from 'next'
import Image from 'next/image'

import GuestPrompt from '@/components/layout/GuestPrompt'
import PageHeader from '@/components/layout/PageHeader'

export const metadata: Metadata = {
  title: 'المفضلة — بيوتنا',
  description: 'احفظ العقارات التي تهمك وارجع إليها في أي وقت.',
}

/** Saved ads belong to an account; a visitor is invited to sign in. */
export default function FavoritesPage() {
  return (
    <>
      <PageHeader title="المفضلة" />
      <GuestPrompt
        icon={
          <div className="flex flex-col items-center gap-2">
            <Image
              src="/landing/guest-heart.svg"
              alt=""
              width={64}
              height={64}
            />
            <Image
              src="/landing/guest-shadow.svg"
              alt=""
              width={64}
              height={5}
            />
          </div>
        }
        title="احفظ عقاراتك المفضلة"
        text="سجل حسابك للوصول إلى العقارات المحفوظة ومشاهدتها في أي وقت"
      />
    </>
  )
}
