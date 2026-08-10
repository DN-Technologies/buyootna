'use client'

import OfficeVerificationBanner from '../overview/OfficeVerificationBanner'
import CompanyBasicInfoCard from '../overview/CompanyBasicInfoCard'
import OfficeSocialLinksCard from '../overview/OfficeSocialLinksCard'
import UserActivityInfoCard from '../overview/UserActivityInfoCard'

export interface CompanyProfileOverviewProps {
  email: string
  fullName: string
  whatsapp: string
  phone: string
  serviceAreas?: string
  workingHours?: {
    weekday?: string
    weekend?: string
  }
  userId?: string
  isPendingVerification?: boolean
  onReviewVerification?: () => void
  lastActivity: string
  lastLogin: string
  joinedAt: string
  instagramUrl?: string
  xUrl?: string
  loading?: boolean
}

export default function CompanyProfileOverview({
  email,
  fullName,
  whatsapp,
  phone,
  serviceAreas,
  workingHours,
  userId,
  isPendingVerification = true,
  onReviewVerification,
  lastActivity,
  lastLogin,
  joinedAt,
  instagramUrl,
  xUrl,
  loading = false,
}: CompanyProfileOverviewProps) {
  return (
    <div className="flex flex-col gap-5 w-full font-['Cairo']" dir="rtl">
      {isPendingVerification && !loading && (
        <OfficeVerificationBanner onReview={onReviewVerification} />
      )}

      <CompanyBasicInfoCard
        email={email}
        fullName={fullName}
        whatsapp={whatsapp}
        phone={phone}
        serviceAreas={serviceAreas}
        workingHours={workingHours}
        accountType="شركة"
        userId={userId}
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
