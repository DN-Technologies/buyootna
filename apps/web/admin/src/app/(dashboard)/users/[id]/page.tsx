'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter, usePathname, useSearchParams } from 'next/navigation'
import { CheckCircle2 } from 'lucide-react'
import UserDetailHeader from '@/components/users/UserDetailHeader'
import UserQuickStats from '@/components/users/UserQuickStats'
import UserDetailTabs from '@/components/users/UserDetailTabs'
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
import AddExceptionalFeatureDrawer from '@/components/users/packages/AddExceptionalFeatureDrawer'
import UserInvoicesDiscountsTabContent from '@/components/users/invoices/UserInvoicesDiscountsTabContent'
import UserReportsTabContent from '@/components/users/reports/UserReportsTabContent'
import UserRatingsTabContent from '@/components/users/ratings/UserRatingsTabContent'
import UserLogsTabContent from '@/components/users/logs/UserLogsTabContent'
import UserNotesTabContent from '@/components/users/notes/UserNotesTabContent'
import { fetchUserDetails, AdminUserDetail } from '@/lib/admin-users'

const roleLabels: Record<string, string> = {
  INDIVIDUAL: 'فرد',
  COMPANY: 'شركة',
  OFFICE: 'مكتب عقاري',
}

const TAB_SLUGS: Record<string, string> = {
  'نظرة عامة': 'overview',
  'الاعلانات': 'ads',
  'الطلبات': 'requests',
  'الخدمات': 'services',
  'المعرض': 'exhibition',
  'الباقة': 'packages',
  'الفواتير والخصم': 'invoices',
  'البلاغات': 'reports',
  'التقييمات': 'ratings',
  'السجل': 'logs',
  'ملاحظات': 'notes',
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

  const [changePackageOpen, setChangePackageOpen] = useState(false)
  const [addExceptionalFeatureOpen, setAddExceptionalFeatureOpen] = useState(false)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const currentTabSlug = searchParams.get('tab')
  const activeTab = (currentTabSlug && SLUG_TO_TAB[currentTabSlug]) || 'نظرة عامة'

  const handleTabChange = (tabLabel: string) => {
    const slug = TAB_SLUGS[tabLabel] || 'overview'
    const newParams = new URLSearchParams(searchParams.toString())
    newParams.set('tab', slug)
    router.replace(`${pathname}?${newParams.toString()}`, { scroll: false })
  }

  useEffect(() => {
    let cancelled = false

    async function load() {
      try {
        setLoading(true)
        setError(null)
        const data = await fetchUserDetails(params.id)
        if (!cancelled) setUser(data)
      } catch (err) {
        console.error('Failed to load user details:', err)
        if (!cancelled) setError('تعذر تحميل بيانات المستخدم.')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [params.id])

  const handleHeaderAction = (action: string) => {
    if (action === 'change_package') {
      setChangePackageOpen(true)
    } else if (action === 'add_exceptional_feature') {
      setAddExceptionalFeatureOpen(true)
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

  const identity = user.identities?.[0]
  const userRole = (user.role || 'INDIVIDUAL') as 'INDIVIDUAL' | 'OFFICE' | 'COMPANY'
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
  const accountType = roleLabels[userRole] || 'فرد'
  const statusLabel: 'نشط' | 'محظور' | 'موقوف' = user.isBlocked
    ? 'محظور'
    : user.isDisabled
      ? 'موقوف'
      : 'نشط'

  return (
    <div className="flex flex-col gap-5 pb-10 relative" dir="rtl">
      {/* Floating Success Toast (Figma Nodes 4043:137427 & 4043:137453) */}
      {toastMessage && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 bg-white border border-[#15a72b] rounded-lg px-4 py-2.5 shadow-lg flex items-center gap-2 font-['Cairo'] text-right animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-5 h-5 text-[#15a72b] shrink-0" />
          <span className="text-[14px] font-medium text-[#111111]">
            {toastMessage}
          </span>
        </div>
      )}

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
          onActionSelect={handleHeaderAction}
        />
        <UserQuickStats userRole={userRole} />
        <UserDetailTabs
          activeTab={activeTab}
          onTabChange={handleTabChange}
          userRole={userRole}
        />
      </div>

      {activeTab === 'الاعلانات' ? (
        <UserAdsTabContent properties={identity?.properties || []} />
      ) : activeTab === 'الطلبات' ? (
        <UserRequestsTabContent userRole={userRole} />
      ) : activeTab === 'الخدمات' ? (
        <UserServicesTabContent />
      ) : activeTab === 'المعرض' ? (
        <UserExhibitionTabContent />
      ) : activeTab === 'الباقة' ? (
        <UserPackagesTabContent />
      ) : activeTab === 'الفواتير والخصم' ? (
        <UserInvoicesDiscountsTabContent />
      ) : activeTab === 'البلاغات' ? (
        <UserReportsTabContent />
      ) : activeTab === 'التقييمات' ? (
        <UserRatingsTabContent />
      ) : activeTab === 'السجل' ? (
        <UserLogsTabContent />
      ) : activeTab === 'ملاحظات' ? (
        <UserNotesTabContent />
      ) : userRole === 'COMPANY' ? (
        <CompanyProfileOverview
          email={user.email || '—'}
          fullName={user.name || displayName}
          whatsapp={user.whatsapp || '—'}
          phone={user.phone || '—'}
          userId={user.id}
          isPendingVerification={true}
          lastActivity="اليوم 09:30 صباحاً"
          lastLogin="28 فبراير 2025"
          joinedAt={formatArabicDate(user.createdAt)}
        />
      ) : userRole === 'OFFICE' ? (
        <OfficeProfileOverview
          email={user.email || '—'}
          fullName={user.name || displayName}
          whatsapp={user.whatsapp || '—'}
          phone={user.phone || '—'}
          userId={user.id}
          isPendingVerification={true}
          lastActivity="اليوم 09:30 صباحاً"
          lastLogin="28 فبراير 2025"
          joinedAt={formatArabicDate(user.createdAt)}
        />
      ) : (
        <IndividualProfileOverview
          email={user.email || '—'}
          fullName={user.name || displayName}
          whatsapp={user.whatsapp || '—'}
          phone={user.phone || '—'}
          accountType={accountType}
          lastActivity="اليوم 09:30 صباحاً"
          lastLogin="28 فبراير 2025"
          joinedAt={formatArabicDate(user.createdAt)}
        />
      )}

      {/* Change Package Drawer */}
      <ChangePackageDrawer
        open={changePackageOpen}
        onClose={() => setChangePackageOpen(false)}
        onSuccess={() => showToast('تم تغيير الباقة بنجاح.')}
        userName={displayName}
        userEmail={user.email || '—'}
        accountType={accountType}
        currentPlanLabel={user.activePlan?.name || 'العادية'}
      />

      {/* Add Exceptional Feature Drawer */}
      <AddExceptionalFeatureDrawer
        open={addExceptionalFeatureOpen}
        onClose={() => setAddExceptionalFeatureOpen(false)}
        onSuccess={() =>
          showToast(`تم منح مميزات استثنائية للمستخدم “${displayName}” بنجاح.`)
        }
      />
    </div>
  )
}
