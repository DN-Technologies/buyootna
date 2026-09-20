'use client'

import React, { useState } from 'react'
import PageHeader from '@/components/PageHeader'
import MetricsGrid from '@/components/dashboard/MetricsGrid'
import DashboardEmptyState from '@/components/dashboard/DashboardEmptyState'
import RevenueChart from '@/components/dashboard/RevenueChart'
import UsersDonutChart from '@/components/dashboard/UsersDonutChart'
import RecentRegistrationsTable from '@/components/dashboard/RecentRegistrationsTable'
import RecentActivitiesCard from '@/components/dashboard/RecentActivitiesCard'
import ReportsCard from '@/components/dashboard/ReportsCard'
import VerificationRequestsCard from '@/components/dashboard/VerificationRequestsCard'

export default function DashboardPage() {
  // Matching Figma 2772:54871 initial state (no data yet)
  const [hasData] = useState(false)

  return (
    <div className="space-y-8 text-right select-none" dir="rtl">
      {/* PageHeader Greeting matching Figma 2772:54878 */}
      <PageHeader
        breadcrumbs={['الرئيسية']}
        title="مرحبا ابراهيم !"
        subtitle="نظرة شاملة على حالة المنصة وأدائها"
        showExport={false}
      />

      {/* 4 Stat Cards Row matching Figma 2772:54882 */}
      <MetricsGrid />

      {/* Main Content: Empty State matching Figma 2774:55560 when no data */}
      {!hasData ? (
        <DashboardEmptyState />
      ) : (
        <>
          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <RevenueChart />
            <UsersDonutChart />
          </div>

          {/* Details Tables & Sidebar */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
            <ReportsCard />
            <RecentRegistrationsTable />
            <VerificationRequestsCard />
            <RecentActivitiesCard />
          </div>
        </>
      )}
    </div>
  )
}
