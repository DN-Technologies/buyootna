'use client'

import { Fragment, useCallback, useEffect, useState } from 'react'
import {
  useParams,
  useRouter,
  usePathname,
  useSearchParams,
} from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import UserDetailHeader from '@/components/users/UserDetailHeader'
import UserQuickStats from '@/components/users/UserQuickStats'
import UserDetailTabs, { tabsFor } from '@/components/users/UserDetailTabs'
import IdentitySwitcher, {
  IDENTITY_TYPE_LABELS,
} from '@/components/users/IdentitySwitcher'
import UserDetailPageSkeleton from '@/components/users/UserDetailPageSkeleton'
import IndividualProfileOverview from '@/components/users/profiles/IndividualProfileOverview'
import OfficeProfileOverview from '@/components/users/profiles/OfficeProfileOverview'
import CompanyProfileOverview from '@/components/users/profiles/CompanyProfileOverview'
import UserServicesTabContent from '@/components/users/services/UserServicesTabContent'
import UserExhibitionTabContent from '@/components/users/exhibition/UserExhibitionTabContent'
import UserAdsTabContent from '@/components/users/ads/UserAdsTabContent'
import UserRequestsTabContent from '@/components/users/requests/UserRequestsTabContent'
import UserPackagesTabContent from '@/components/users/packages/UserPackagesTabContent'
import ChangePackageDrawer from '@/components/users/packages/ChangePackageDrawer'
import UserInvoicesDiscountsTabContent from '@/components/users/invoices/UserInvoicesDiscountsTabContent'
import AddExceptionalFeatureDrawer from '@/components/users/packages/AddExceptionalFeatureDrawer'
import AddCouponModal from '@/components/users/AddCouponModal'
import SuccessToast from '@/components/users/SuccessToast'
import UserReportsTabContent from '@/components/users/reports/UserReportsTabContent'
import UserRatingsTabContent from '@/components/users/ratings/UserRatingsTabContent'
import UserLogsTabContent from '@/components/users/logs/UserLogsTabContent'
import UserNotesTabContent from '@/components/users/notes/UserNotesTabContent'
import { setActiveAccountType } from '@/lib/active-account-type'
import { workingHourLines } from '@/lib/working-hours'
import { formatRelativeArabicTime } from '@/lib/admin-dashboard'
import {
  fetchUserDetails,
  AdminUserDetail,
  AdminUserIdentity,
} from '@/lib/admin-users'
import { fetchUserReports } from '@/lib/admin-reports'
import { fetchUserReviewsSummary } from '@/lib/admin-ratings'
import { fetchUserRequests } from '@/lib/admin-requests'

/**
 * The persona the page shows: `?identity=` when it's one of the account's,
 * else the one the app opens by default (the individual, else the first).
 */
function selectIdentity(
  identities: AdminUserIdentity[],
  requestedId: string | null,
): AdminUserIdentity | undefined {
  return (
    identities.find((i) => i.id === requestedId) ??
    identities.find((i) => i.type === 'INDIVIDUAL') ??
    identities[0]
  )
}

const TAB_SLUGS: Record<string, string> = {
  'نظرة عامة': 'overview',
  الاعلانات: 'ads',
  الطلبات: 'requests',
  الخدمات: 'services',
  المعرض: 'exhibition',
  الباقة: 'packages',
  'الفواتير والخصم': 'invoices',
  البلاغات: 'reports',
  التقييمات: 'ratings',
  السجل: 'logs',
  ملاحظات: 'notes',
}

const SLUG_TO_TAB: Record<string, string> = {
  overview: 'نظرة عامة',
  ads: 'الاعلانات',
  requests: 'الطلبات',
  services: 'الخدمات',
  exhibition: 'المعرض',
  packages: 'الباقة',
  invoices: 'الفواتير والخصم',
  reports: 'البلاغات',
  ratings: 'التقييمات',
  logs: 'السجل',
  notes: 'ملاحظات',
}

function formatArabicDate(date?: string | null) {
  if (!date) return '—'
  return new Intl.DateTimeFormat('ar', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    calendar: 'gregory',
    numberingSystem: 'latn',
  }).format(new Date(date))
}

export default function UserOverviewPage() {
  const params = useParams<{ id: string }>()
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [user, setUser] = useState<AdminUserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reportsCount, setReportsCount] = useState<number | undefined>(
    undefined,
  )
  const [ratingAverage, setRatingAverage] = useState<number | undefined>(
    undefined,
  )
  const [ratingCount, setRatingCount] = useState<number | undefined>(undefined)
  const [requestsCount, setRequestsCount] = useState<number | undefined>(
    undefined,
  )

  const [changePackageOpen, setChangePackageOpen] = useState(false)
  const [addExceptionalFeatureOpen, setAddExceptionalFeatureOpen] =
    useState(false)
  const [addCouponOpen, setAddCouponOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const currentTabSlug = searchParams.get('tab')
  const requestedTab =
    (currentTabSlug && SLUG_TO_TAB[currentTabSlug]) || 'نظرة عامة'

  const identity = user
    ? selectIdentity(user.identities ?? [], searchParams.get('identity'))
    : undefined
  const identityId = identity?.id
  const userRole = (identity?.type || user?.role || 'INDIVIDUAL') as
    'INDIVIDUAL' | 'OFFICE' | 'COMPANY'
  // A tab the selected persona doesn't have (المعرض on an individual) opens the overview
  const activeTab = tabsFor(userRole).includes(requestedTab)
    ? requestedTab
    : 'نظرة عامة'

  const handleTabChange = (tabLabel: string) => {
    const slug = TAB_SLUGS[tabLabel] || 'overview'
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set('tab', slug)
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false })
  }

  // The side nav highlights the shown identity's type, until the page closes
  useEffect(() => {
    if (!identity) return
    setActiveAccountType(
      identity.type.toLowerCase() as 'individual' | 'company' | 'office',
    )
  }, [identity])
  useEffect(() => () => setActiveAccountType(null), [])

  const handleIdentityChange = (nextId: string) => {
    const next = user?.identities.find((i) => i.id === nextId)
    if (!next) return
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set('identity', nextId)
    if (!tabsFor(next.type).includes(activeTab)) newParams.delete('tab')
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false })
  }

  const loadUser = useCallback(
    async (opts: { showSpinner?: boolean } = {}) => {
      try {
        if (opts.showSpinner) setLoading(true)
        setError(null)
        const data = await fetchUserDetails(params.id)
        setUser(data)
      } catch (err) {
        console.error('Failed to load user details:', err)
        setError('تعذر تحميل بيانات المستخدم.')
      } finally {
        if (opts.showSpinner) setLoading(false)
      }
    },
    [params.id],
  )

  useEffect(() => {
    loadUser({ showSpinner: true })
  }, [loadUser])

  const refreshAds = useCallback(() => {
    loadUser()
  }, [loadUser])

  // Lightweight parallel fetches for UserQuickStats — independent of which
  // tab is active, for the selected persona.
  const userLoaded = !!user
  useEffect(() => {
    if (!userLoaded) return
    let cancelled = false
    fetchUserReports(params.id, { limit: 1, identityId })
      .then((res) => {
        if (!cancelled) setReportsCount(res.meta.total)
      })
      .catch((err) => console.error('Failed to load reports count:', err))
    fetchUserReviewsSummary(params.id, identityId)
      .then((res) => {
        if (!cancelled) {
          setRatingAverage(res.averageRating)
          setRatingCount(res.totalRatingsCount)
        }
      })
      .catch((err) => console.error('Failed to load ratings summary:', err))
    fetchUserRequests(params.id, identityId)
      .then((res) => {
        if (!cancelled) setRequestsCount(res.length)
      })
      .catch((err) => console.error('Failed to load requests count:', err))
    return () => {
      cancelled = true
    }
  }, [params.id, identityId, userLoaded])

  const handleHeaderAction = (action: string) => {
    if (action === 'change_package') {
      setChangePackageOpen(true)
    } else if (action === 'add_exceptional_feature') {
      setAddExceptionalFeatureOpen(true)
    } else if (action === 'add_coupon') {
      setAddCouponOpen(true)
    }
  }

  const showToast = (msg: string) => {
    setToastMessage(msg)
    setTimeout(() => {
      setToastMessage(null)
    }, 4000)
  }

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

  const isOffice = userRole === 'OFFICE'
  const displayName =
    identity?.companyData?.name ||
    identity?.officeData?.name ||
    identity?.individualData?.name ||
    user.name ||
    '—'
  const avatarUrl =
    identity?.individualData?.avatarUrl ||
    identity?.companyData?.logoUrl ||
    identity?.officeData?.logoUrl ||
    user.avatarUrl
  const businessData = identity?.companyData ?? identity?.officeData
  // A company's services are rows; an office only has its typed list
  const servicesCount =
    identity?.type === 'COMPANY'
      ? identity.servicesCount
      : identity?.type === 'OFFICE'
        ? (identity.officeData?.services ?? '')
            .split(/[,،\n]/)
            .filter((part) => part.trim()).length
        : undefined
  const lastActivity = user.lastActiveAt
    ? formatRelativeArabicTime(user.lastActiveAt)
    : '—'
  const lastLogin = formatArabicDate(user.lastLoginAt)
  const licenseNumber =
    identity?.companyData?.licenseNumber ?? identity?.officeData?.licenseNumber
  const accountType = IDENTITY_TYPE_LABELS[userRole] || 'فرد'
  const statusLabel: 'نشط' | 'محظور' | 'موقوف' = user.isBlocked
    ? 'محظور'
    : user.isDisabled
      ? 'موقوف'
      : 'نشط'

  return (
    <div className="flex flex-col gap-5 pb-10 relative" dir="rtl">
      {/* Floating Success Toast (Figma Node 5634:72196) */}
      <SuccessToast
        message={toastMessage || ''}
        isOpen={!!toastMessage}
        onClose={() => setToastMessage(null)}
      />

      {/* Bleeds to cancel the dashboard shell's padding, matching PageHeader's pattern */}
      <div className="-mx-6 -mt-6 md:-mx-8 md:-mt-8 flex flex-col gap-4 bg-white">
        <UserDetailHeader
          name={displayName}
          email={user.email || '—'}
          accountType={accountType}
          planLabel={user.activePlan?.name || 'الباقة العادية'}
          statusLabel={statusLabel}
          avatarUrl={avatarUrl}
          isOffice={isOffice || userRole === 'COMPANY'}
          userId={user.id}
          licenseNumber={licenseNumber}
          location={businessData?.hqLocation || undefined}
          backHref={`/users?type=${userRole.toLowerCase()}`}
          onActionSelect={handleHeaderAction}
          identitySwitcher={
            <IdentitySwitcher
              identities={user.identities ?? []}
              selectedId={identityId}
              onSelect={handleIdentityChange}
            />
          }
        />
        <UserQuickStats
          userRole={userRole}
          stats={{
            reportsCount,
            adsCount: identity?.properties?.length,
            ratingAverage,
            ratingCount,
            requestsCount,
            soldCount: identity?.stats?.soldCount,
            servicesCount,
          }}
        />
        <UserDetailTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          userRole={userRole}
        />
      </div>

      {/* Keyed by persona: switching identity starts each tab afresh */}
      <Fragment key={identityId ?? 'account'}>
        {activeTab === 'الاعلانات' ? (
          <UserAdsTabContent
            properties={identity?.properties || []}
            userId={user.id}
            identityId={identityId}
            onRefresh={refreshAds}
          />
        ) : activeTab === 'الطلبات' ? (
          <UserRequestsTabContent
            userRole={userRole}
            userId={user.id}
            identityId={identityId}
          />
        ) : activeTab === 'الخدمات' ? (
          <UserServicesTabContent
            userId={user.id}
            identityId={identityId}
            userRole={userRole}
          />
        ) : activeTab === 'المعرض' ? (
          <UserExhibitionTabContent userId={user.id} identityId={identityId} />
        ) : activeTab === 'الباقة' ? (
          <UserPackagesTabContent userId={user.id} identityId={identityId} />
        ) : activeTab === 'الفواتير والخصم' ? (
          <UserInvoicesDiscountsTabContent
            userId={user.id}
            identityId={identityId}
          />
        ) : activeTab === 'البلاغات' ? (
          <UserReportsTabContent userId={user.id} identityId={identityId} />
        ) : activeTab === 'التقييمات' ? (
          <UserRatingsTabContent userId={user.id} identityId={identityId} />
        ) : activeTab === 'السجل' ? (
          <UserLogsTabContent userId={user.id} />
        ) : activeTab === 'ملاحظات' ? (
          <UserNotesTabContent userId={user.id} />
        ) : userRole === 'COMPANY' ? (
          <CompanyProfileOverview
            email={user.email || '—'}
            fullName={displayName}
            licenseNumber={licenseNumber}
            whatsapp={user.whatsapp || '—'}
            phone={user.phone || '—'}
            isPendingVerification={identity?.companyData?.status === 'PENDING'}
            submittedAt={formatArabicDate(identity?.companyData?.updatedAt)}
            workingHours={workingHourLines(identity?.companyData?.workingHours)}
            serviceAreas={identity?.companyData?.serviceAreas || undefined}
            lastActivity={lastActivity}
            lastLogin={lastLogin}
            joinedAt={formatArabicDate(user.createdAt)}
          />
        ) : userRole === 'OFFICE' ? (
          <OfficeProfileOverview
            email={user.email || '—'}
            fullName={displayName}
            licenseNumber={licenseNumber}
            whatsapp={user.whatsapp || '—'}
            phone={user.phone || '—'}
            isPendingVerification={identity?.officeData?.status === 'PENDING'}
            submittedAt={formatArabicDate(identity?.officeData?.updatedAt)}
            workingHours={workingHourLines(identity?.officeData?.workingHours)}
            lastActivity={lastActivity}
            lastLogin={lastLogin}
            joinedAt={formatArabicDate(user.createdAt)}
          />
        ) : (
          <IndividualProfileOverview
            email={user.email || '—'}
            fullName={displayName}
            whatsapp={user.whatsapp || '—'}
            phone={user.phone || '—'}
            accountType={accountType}
            lastActivity={lastActivity}
            lastLogin={lastLogin}
            joinedAt={formatArabicDate(user.createdAt)}
          />
        )}
      </Fragment>

      {/* Change Package Drawer */}
      <ChangePackageDrawer
        open={changePackageOpen}
        onClose={() => setChangePackageOpen(false)}
        onSuccess={() => showToast('تم تغيير الباقة بنجاح.')}
        userId={user.id}
        identityId={identityId}
        userName={displayName}
        userEmail={user.email || '—'}
        accountType={accountType}
        currentPlanLabel={user.activePlan?.name || 'العادية'}
      />

      {/* Add Exceptional Feature Drawer */}
      <AddExceptionalFeatureDrawer
        userId={user.id}
        identityId={identityId}
        open={addExceptionalFeatureOpen}
        onClose={() => setAddExceptionalFeatureOpen(false)}
        onSuccess={() =>
          showToast(`تم منح مميزات استثنائية للمستخدم “${displayName}” بنجاح.`)
        }
      />

      {/* Add Discount Coupon Modal (Figma Nodes 5634:71560, 5634:71598, 5634:71780) */}
      <AddCouponModal
        user={
          user ? { id: user.id, name: displayName, email: user.email } : null
        }
        isOpen={addCouponOpen}
        onClose={() => setAddCouponOpen(false)}
        onSuccess={() =>
          showToast(`تم اضافة كوبون خصم للمستخدم “${displayName}” بنجاح.`)
        }
      />
    </div>
  )
}
