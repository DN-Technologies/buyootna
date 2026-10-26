'use client'

import UserAdsTabContent from '@/components/users/ads/UserAdsTabContent'
import UserRequestsTabContent from '@/components/users/requests/UserRequestsTabContent'
import UserServicesTabContent from '@/components/users/services/UserServicesTabContent'
import UserExhibitionTabContent from '@/components/users/exhibition/UserExhibitionTabContent'
import UserPackagesTabContent from '@/components/users/packages/UserPackagesTabContent'
import UserInvoicesDiscountsTabContent from '@/components/users/invoices/UserInvoicesDiscountsTabContent'
import UserReportsTabContent from '@/components/users/reports/UserReportsTabContent'
import UserRatingsTabContent from '@/components/users/ratings/UserRatingsTabContent'
import UserLogsTabContent from '@/components/users/logs/UserLogsTabContent'
import UserNotesTabContent from '@/components/users/notes/UserNotesTabContent'
import type { AdminUserDetail, AdminUserIdentity } from '@/lib/admin-users'
import type { UserRole } from './constants'
import UserDetailOverview from './UserDetailOverview'
import type { UserDetailView } from './user-detail.utils'

interface UserDetailTabPanelProps {
  activeTab: string
  user: AdminUserDetail
  identity: AdminUserIdentity | undefined
  role: UserRole
  view: UserDetailView
  onRefresh: () => void
}

/**
 * The open tab's content. Per-persona tabs get the selected identity;
 * السجل and ملاحظات are about the whole account.
 */
export default function UserDetailTabPanel({
  activeTab,
  user,
  identity,
  role,
  view,
  onRefresh,
}: UserDetailTabPanelProps) {
  const userId = user.id
  const identityId = identity?.id

  switch (activeTab) {
    case 'الاعلانات':
      return (
        <UserAdsTabContent
          properties={identity?.properties || []}
          userId={userId}
          identityId={identityId}
          onRefresh={onRefresh}
        />
      )
    case 'الطلبات':
      return (
        <UserRequestsTabContent
          userRole={role}
          userId={userId}
          identityId={identityId}
        />
      )
    case 'الخدمات':
      return (
        <UserServicesTabContent
          userId={userId}
          identityId={identityId}
          userRole={role}
        />
      )
    case 'المعرض':
      return <UserExhibitionTabContent userId={userId} identityId={identityId} />
    case 'الباقة':
      return <UserPackagesTabContent userId={userId} identityId={identityId} />
    case 'الفواتير والخصم':
      return (
        <UserInvoicesDiscountsTabContent userId={userId} identityId={identityId} />
      )
    case 'البلاغات':
      return <UserReportsTabContent userId={userId} identityId={identityId} />
    case 'التقييمات':
      return <UserRatingsTabContent userId={userId} identityId={identityId} />
    case 'السجل':
      return <UserLogsTabContent userId={userId} />
    case 'ملاحظات':
      return <UserNotesTabContent userId={userId} />
    default:
      return (
        <UserDetailOverview user={user} identity={identity} role={role} view={view} />
      )
  }
}
