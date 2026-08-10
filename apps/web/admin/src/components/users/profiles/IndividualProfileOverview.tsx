'use client'

import UserBasicInfoCard from '../overview/UserBasicInfoCard'
import UserActivityInfoCard from '../overview/UserActivityInfoCard'

export interface IndividualProfileOverviewProps {
  email: string
  fullName: string
  whatsapp: string
  phone: string
  accountType: string
  lastActivity: string
  lastLogin: string
  joinedAt: string
  loading?: boolean
}

export default function IndividualProfileOverview({
  email,
  fullName,
  whatsapp,
  phone,
  accountType,
  lastActivity,
  lastLogin,
  joinedAt,
  loading = false,
}: IndividualProfileOverviewProps) {
  return (
    <div className="flex flex-col gap-5 w-full font-['Cairo']" dir="rtl">
      <UserBasicInfoCard
        email={email}
        fullName={fullName}
        whatsapp={whatsapp}
        phone={phone}
        accountType={accountType}
        loading={loading}
      />

      <UserActivityInfoCard
        lastActivity={lastActivity}
        lastLogin={lastLogin}
        joinedAt={joinedAt}
        loading={loading}
      />
    </div>
  )
}
