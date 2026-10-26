'use client'

import type { WorkingHourItem } from '@/lib/working-hours'
import OfficeVerificationBanner from '../overview/OfficeVerificationBanner'
import CompanyBasicInfoCard from '../overview/CompanyBasicInfoCard'
import UserActivityInfoCard from '../overview/UserActivityInfoCard'

export interface CompanyProfileOverviewProps {
  email: string
  fullName: string
  whatsapp: string
  phone: string
  serviceAreas?: string
  workingHours?: WorkingHourItem[] | null
  licenseNumber?: string | null
  isPendingVerification?: boolean
  // When the licence was sent for review (the identity's data date)
  submittedAt?: string
  onReviewVerification?: () => void
  lastActivity: string
  lastLogin: string
  joinedAt: string
  loading?: boolean
}

export default function CompanyProfileOverview({
  email,
  fullName,
  whatsapp,
  phone,
  serviceAreas,
  workingHours,
  licenseNumber,
  isPendingVerification = false,
  submittedAt,
  onReviewVerification,
  lastActivity,
  lastLogin,
  joinedAt,
  loading = false,
}: CompanyProfileOverviewProps) {
  return (
    <div className="flex flex-col gap-5 w-full font-['Cairo']" dir="rtl">
      {isPendingVerification && !loading && (
        <OfficeVerificationBanner
          submittedAt={submittedAt}
          onReview={onReviewVerification}
        />
      )}

      <CompanyBasicInfoCard
        email={email}
        fullName={fullName}
        whatsapp={whatsapp}
        phone={phone}
        serviceAreas={serviceAreas}
        workingHours={workingHours}
        accountType="شركة"
        licenseNumber={licenseNumber}
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
