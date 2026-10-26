'use client'

import IndividualProfileOverview from '@/components/users/profiles/IndividualProfileOverview'
import OfficeProfileOverview from '@/components/users/profiles/OfficeProfileOverview'
import CompanyProfileOverview from '@/components/users/profiles/CompanyProfileOverview'
import type { AdminUserDetail, AdminUserIdentity } from '@/lib/admin-users'
import { workingHourLines } from '@/lib/working-hours'
import type { UserRole } from './constants'
import { UserDetailView, formatArabicDate } from './user-detail.utils'

interface UserDetailOverviewProps {
  user: AdminUserDetail
  identity: AdminUserIdentity | undefined
  role: UserRole
  view: UserDetailView
}

/** نظرة عامة: the overview that fits the selected persona's type. */
export default function UserDetailOverview({
  user,
  identity,
  role,
  view,
}: UserDetailOverviewProps) {
  const common = {
    email: user.email || '—',
    fullName: view.displayName,
    whatsapp: user.whatsapp || '—',
    phone: user.phone || '—',
    lastActivity: view.lastActivity,
    lastLogin: view.lastLogin,
    joinedAt: view.joinedAt,
  }

  if (role === 'COMPANY') {
    const data = identity?.companyData
    return (
      <CompanyProfileOverview
        {...common}
        licenseNumber={view.licenseNumber}
        isPendingVerification={data?.status === 'PENDING'}
        submittedAt={formatArabicDate(data?.updatedAt)}
        workingHours={workingHourLines(data?.workingHours)}
        serviceAreas={data?.serviceAreas || undefined}
      />
    )
  }

  if (role === 'OFFICE') {
    const data = identity?.officeData
    return (
      <OfficeProfileOverview
        {...common}
        licenseNumber={view.licenseNumber}
        isPendingVerification={data?.status === 'PENDING'}
        submittedAt={formatArabicDate(data?.updatedAt)}
        workingHours={workingHourLines(data?.workingHours)}
      />
    )
  }

  return <IndividualProfileOverview {...common} accountType={view.accountType} />
}
