'use client'

import PageHeader from '@/components/PageHeader'
import MetricsGrid, { MetricItem } from '@/components/dashboard/MetricsGrid'
import DashboardEmptyState from '@/components/dashboard/DashboardEmptyState'
import RevenueChart from '@/components/dashboard/RevenueChart'
import UsersDonutChart from '@/components/dashboard/UsersDonutChart'
import RecentRegistrationsTable from '@/components/dashboard/RecentRegistrationsTable'
import RecentActivitiesCard from '@/components/dashboard/RecentActivitiesCard'
import ReportsCard from '@/components/dashboard/ReportsCard'
import VerificationRequestsCard from '@/components/dashboard/VerificationRequestsCard'
import { useDashboardPage } from './useDashboardPage'

function formatChange(pct: number): string {
  const sign = pct > 0 ? '+' : ''
  return `${sign}${pct}%`
}

export default function DashboardPage() {
  const { data, loading, error, reload } = useDashboardPage()

  const metrics: MetricItem[] | undefined = data
    ? [
        {
          id: 'users',
          title: 'إجمالي المستخدمين',
          count: data.metrics.totalUsers.toLocaleString('en-US'),
          change: formatChange(data.metrics.totalUsersChangePct),
          variant: data.metrics.totalUsersChangePct < 0 ? 'red' : 'green',
        },
        {
          id: 'demo',
          title: 'الحسابات التجريبية',
          count: data.metrics.trialAccounts.toLocaleString('en-US'),
          change: formatChange(data.metrics.trialAccountsChangePct),
          variant: data.metrics.trialAccountsChangePct < 0 ? 'red' : 'green',
        },
        {
          id: 'reports',
          title: 'البلاغات الجديدة',
          count: '0',
          change: '0%',
          variant: 'red',
        },
        {
          id: 'revenue',
          title: 'إجمالي الإيرادات',
          count: `${data.metrics.revenueTotal.toLocaleString('en-US')} د.ك`,
          change: formatChange(data.metrics.revenueChangePct),
          variant: data.metrics.revenueChangePct < 0 ? 'red' : 'green',
        },
      ]
    : undefined

  return (
    <div className="space-y-8 text-right select-none" dir="rtl">
      <PageHeader
        breadcrumbs={['الرئيسية']}
        title="مرحبا ابراهيم !"
        subtitle="نظرة شاملة على حالة المنصة وأدائها"
        showExport={false}
      />

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg font-['Cairo'] text-sm flex items-center justify-between">
          <span>{error}</span>
          <button
            onClick={() => reload()}
            className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 font-semibold cursor-pointer"
          >
            إعادة المحاولة
          </button>
        </div>
      )}

      <MetricsGrid metrics={metrics} />

      {loading && !data ? (
        <DashboardEmptyState
          title="جاري تحميل البيانات..."
          subtitle="يرجى الانتظار قليلاً"
        />
      ) : !data || data.metrics.totalUsers === 0 ? (
        <DashboardEmptyState />
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RevenueChart data={data.revenueByMonth} />
            <UsersDonutChart
              individual={data.usersByType.individual}
              company={data.usersByType.company}
              office={data.usersByType.office}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            <ReportsCard />
            <RecentRegistrationsTable
              registrations={data.recentRegistrations}
            />
            <VerificationRequestsCard requests={data.pendingVerifications} />
            <RecentActivitiesCard />
          </div>
        </>
      )}
    </div>
  )
}
