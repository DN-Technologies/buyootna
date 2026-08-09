'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import UserDetailHeader from '@/components/users/UserDetailHeader'
import UserQuickStats from '@/components/users/UserQuickStats'
import UserDetailTabs from '@/components/users/UserDetailTabs'
import UserBasicInfoCard from '@/components/users/overview/UserBasicInfoCard'
import UserActivityInfoCard from '@/components/users/overview/UserActivityInfoCard'
import UserAdsTabContent from '@/components/users/ads/UserAdsTabContent'
import UserRequestsTabContent from '@/components/users/requests/UserRequestsTabContent'
import UserPackagesTabContent from '@/components/users/packages/UserPackagesTabContent'
import UserInvoicesDiscountsTabContent from '@/components/users/invoices/UserInvoicesDiscountsTabContent'
import { fetchUserDetails, AdminUserDetail } from '@/lib/admin-users'

const roleLabels: Record<string, string> = {
  INDIVIDUAL: 'فرد',
  COMPANY: 'شركة',
  OFFICE: 'مكتب عقاري',
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
  const [user, setUser] = useState<AdminUserDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('نظرة عامة')

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

  if (loading) {
    return (
      <div className="w-full flex items-center justify-center py-24">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (error || !user) {
    return (
      <div className="w-full text-center py-24 text-[#6B6A6A] font-['Cairo']">
        {error || 'المستخدم غير موجود'}
      </div>
    )
  }

  const identity = user.identities?.[0]
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
  const accountType = roleLabels[user.role || 'INDIVIDUAL'] || 'فرد'
  const statusLabel: 'نشط' | 'محظور' | 'موقوف' = user.isBlocked
    ? 'محظور'
    : user.isDisabled
      ? 'موقوف'
      : 'نشط'

  return (
    <div className="flex flex-col gap-5 pb-10" dir="rtl">
      {/* Bleeds to cancel the dashboard shell's padding, matching PageHeader's pattern */}
      <div className="-mx-6 -mt-6 md:-mx-8 md:-mt-8 flex flex-col gap-4 bg-white">
        <UserDetailHeader
          name={displayName}
          email={user.email || '—'}
          accountType={accountType}
          planLabel={user.activePlan?.name || 'الباقة العادية'}
          statusLabel={statusLabel}
          avatarUrl={avatarUrl}
        />
        <UserQuickStats />
        <UserDetailTabs activeTab={activeTab} onTabChange={setActiveTab} />
      </div>

      {activeTab === 'الاعلانات' ? (
        <UserAdsTabContent properties={identity?.properties || []} />
      ) : activeTab === 'الطلبات' ? (
        <UserRequestsTabContent />
      ) : activeTab === 'الباقة' ? (
        <UserPackagesTabContent />
      ) : activeTab === 'الفواتير والخصم' ? (
        <UserInvoicesDiscountsTabContent />
      ) : (
        <div className="flex flex-col gap-5 w-full">
          <UserBasicInfoCard
            email={user.email || '—'}
            fullName={user.name || displayName}
            whatsapp={user.whatsapp || '—'}
            phone={user.phone || '—'}
            accountType={accountType}
          />
          <UserActivityInfoCard
            lastActivity="اليوم 09:30 صباحاً"
            lastLogin="28 فبراير 2025"
            joinedAt={formatArabicDate(user.createdAt)}
          />
        </div>
      )}
    </div>
  )
}
