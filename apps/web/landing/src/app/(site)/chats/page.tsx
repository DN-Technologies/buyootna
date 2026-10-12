import type { Metadata } from 'next'
import Image from 'next/image'

import GuestPrompt from '@/components/layout/GuestPrompt'
import PageHeader from '@/components/layout/PageHeader'

export const metadata: Metadata = {
  title: 'المحادثات — بيوتنا',
  description: 'تواصل مع المكاتب العقارية والمعلنين على بيوتنا.',
}

/** Chats belong to an account; a visitor is invited to sign in. */
export default function ChatsPage() {
  return (
    <>
      <PageHeader title="المحادثات" />
      <GuestPrompt
        icon={
          <Image src="/landing/guest-chat.svg" alt="" width={112} height={77} />
        }
        title="ابدأ محادثاتك الان"
        text="سجل حسابك للتواصل مع المكاتب العقارية والعملاء بسهولة ومتابعة الرسائل."
      />
    </>
  )
}
