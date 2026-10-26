'use client'

import { Fragment } from 'react'
import { useParams } from 'next/navigation'
import UserDetailHeader from '@/components/users/UserDetailHeader'
import UserQuickStats from '@/components/users/UserQuickStats'
import UserDetailTabs from '@/components/users/UserDetailTabs'
import IdentitySwitcher from '@/components/users/IdentitySwitcher'
import UserDetailPageSkeleton from '@/components/users/UserDetailPageSkeleton'
import {
  UserDetailDialogs,
  UserDetailTabPanel,
  buildUserDetailView,
  useIdentityCounts,
  useUserDetail,
  useUserDetailDialogs,
  useUserDetailNavigation,
} from '@/components/users/user-detail'

export default function UserOverviewPage() {
  const params = useParams<{ id: string }>()
  const { user, loading, error, reload } = useUserDetail(params.id)
  const { identity, role, activeTab, changeTab, changeIdentity } =
    useUserDetailNavigation(user)
  const counts = useIdentityCounts(params.id, identity?.id, !!user)
  const dialogs = useUserDetailDialogs()

  if (loading) {
    return <UserDetailPageSkeleton />
  }

  if (error || !user) {
    return (
      <div className="w-full text-center py-24 text-[#6B6A6A] font-['Cairo']">
        {error || 'المستخدم غير موجود'}
      </div>
    )
  }

  const view = buildUserDetailView(user, identity, role)

  return (
    <div className="flex flex-col gap-5 pb-10 relative" dir="rtl">
      {/* Bleeds to cancel the dashboard shell's padding, matching PageHeader's pattern */}
      <div className="-mx-6 -mt-6 md:-mx-8 md:-mt-8 flex flex-col gap-4 bg-white">
        <UserDetailHeader
          name={view.displayName}
          email={user.email || '—'}
          accountType={view.accountType}
          planLabel={user.activePlan?.name || 'الباقة العادية'}
          statusLabel={view.statusLabel}
          avatarUrl={view.avatarUrl}
          isOffice={role !== 'INDIVIDUAL'}
          userId={user.id}
          licenseNumber={view.licenseNumber}
          location={view.location}
          backHref={`/users?type=${role.toLowerCase()}`}
          onActionSelect={dialogs.handleHeaderAction}
          identitySwitcher={
            <IdentitySwitcher
              identities={user.identities ?? []}
              selectedId={identity?.id}
              onSelect={changeIdentity}
            />
          }
        />
        <UserQuickStats
          userRole={role}
          stats={{
            ...counts,
            adsCount: identity?.properties?.length,
            soldCount: identity?.stats?.soldCount,
            servicesCount: view.servicesCount,
          }}
        />
        <UserDetailTabs
          activeTab={activeTab}
          onTabChange={changeTab}
          userRole={role}
        />
      </div>

      {/* Keyed by persona: switching identity starts each tab afresh */}
      <Fragment key={identity?.id ?? 'account'}>
        <UserDetailTabPanel
          activeTab={activeTab}
          user={user}
          identity={identity}
          role={role}
          view={view}
          onRefresh={reload}
        />
      </Fragment>

      <UserDetailDialogs
        user={user}
        identityId={identity?.id}
        view={view}
        dialogs={dialogs}
      />
    </div>
  )
}
