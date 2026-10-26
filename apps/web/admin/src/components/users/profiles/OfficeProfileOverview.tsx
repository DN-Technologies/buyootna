'use client'

import type { WorkingHourItem } from '@/lib/working-hours'
import OfficeVerificationBanner from '../overview/OfficeVerificationBanner'
import OfficeBasicInfoCard from '../overview/OfficeBasicInfoCard'
import UserActivityInfoCard from '../overview/UserActivityInfoCard'

export interface OfficeProfileOverviewProps {
  email: string
  fullName: string
  whatsapp: string
  phone: string
  licenseNumber?: string | null
  workingHours?: WorkingHourItem[] | null
  isPendingVerification?: boolean
  // When the licence was sent for review (the identity's data date)
  submittedAt?: string
  onReviewVerification?: () => void
  lastActivity: string
  lastLogin: string
  joinedAt: string
  loading?: boolean
}

export default function OfficeProfileOverview({
  email,
  fullName,
  whatsapp,
  phone,
  licenseNumber,
  workingHours,
  isPendingVerification = false,
  submittedAt,
  onReviewVerification,
  lastActivity,
  lastLogin,
  joinedAt,
  loading = false,
}: OfficeProfileOverviewProps) {
  return (
    <div className="flex flex-col gap-5 w-full font-['Cairo']" dir="rtl">
      {isPendingVerification && !loading && (
        <OfficeVerificationBanner
          submittedAt={submittedAt}
          onReview={onReviewVerification}
        />
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

      <UserActivityInfoCard
        lastActivity={lastActivity}
        lastLogin={lastLogin}
        joinedAt={joinedAt}
        loading={loading}
      />
    </div>
  )
}
