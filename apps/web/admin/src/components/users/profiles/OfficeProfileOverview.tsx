'use client'

import OfficeVerificationBanner from '../overview/OfficeVerificationBanner'
import OfficeBasicInfoCard from '../overview/OfficeBasicInfoCard'
import OfficeSocialLinksCard from '../overview/OfficeSocialLinksCard'
import UserActivityInfoCard from '../overview/UserActivityInfoCard'

export interface OfficeProfileOverviewProps {
  email: string
  fullName: string
  whatsapp: string
  phone: string
  licenseNumber?: string | null
  workingHours?: {
    weekday?: string
    weekend?: string
  }
  isPendingVerification?: boolean
  onReviewVerification?: () => void
  lastActivity: string
  lastLogin: string
  joinedAt: string
  instagramUrl?: string
  xUrl?: string
  loading?: boolean
}

export default function OfficeProfileOverview({
  email,
  fullName,
  whatsapp,
  phone,
  licenseNumber,
  workingHours,
  isPendingVerification = true,
  onReviewVerification,
  lastActivity,
  lastLogin,
  joinedAt,
  instagramUrl,
  xUrl,
  loading = false,
}: OfficeProfileOverviewProps) {
  return (
    <div className="flex flex-col gap-5 w-full font-['Cairo']" dir="rtl">
      {isPendingVerification && !loading && (
        <OfficeVerificationBanner onReview={onReviewVerification} />
      )}

      <OfficeBasicInfoCard
        email={email}
        fullName={fullName}
        whatsapp={whatsapp}
        phone={phone}
        licenseNumber={licenseNumber}
        workingHours={workingHours}
        accountType="مكتب عقاري"
        loading={loading}
      />

      <OfficeSocialLinksCard
        instagramUrl={instagramUrl}
        xUrl={xUrl}
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
