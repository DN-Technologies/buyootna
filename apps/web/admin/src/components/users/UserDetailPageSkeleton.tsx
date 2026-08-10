'use client'

import UserDetailHeader from './UserDetailHeader'
import UserQuickStats from './UserQuickStats'
import UserDetailTabs from './UserDetailTabs'
import IndividualProfileOverview from './profiles/IndividualProfileOverview'

export default function UserDetailPageSkeleton() {
  return (
    <div className="flex flex-col gap-5 pb-10" dir="rtl">
      {/* Header, stats, and tabs shell */}
      <div className="-mx-6 -mt-6 md:-mx-8 md:-mt-8 flex flex-col gap-4 bg-white">
        <UserDetailHeader
          name=""
          email=""
          accountType=""
          planLabel=""
          statusLabel="نشط"
          loading={true}
        />
        <UserQuickStats loading={true} />
        <UserDetailTabs activeTab="نظرة عامة" />
      </div>

      {/* Overview cards skeleton */}
      <IndividualProfileOverview
        email=""
        fullName=""
        whatsapp=""
        phone=""
        accountType=""
        lastActivity=""
        lastLogin=""
        joinedAt=""
        loading={true}
      />
    </div>
  )
}
