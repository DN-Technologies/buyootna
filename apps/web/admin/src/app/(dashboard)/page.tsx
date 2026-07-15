'use client'

import React from 'react'
import PageHeader from '@/components/PageHeader'
import MetricsGrid from '@/components/dashboard/MetricsGrid'
import RevenueChart from '@/components/dashboard/RevenueChart'
import UsersDonutChart from '@/components/dashboard/UsersDonutChart'
import RecentRegistrationsTable from '@/components/dashboard/RecentRegistrationsTable'
import RecentActivitiesCard from '@/components/dashboard/RecentActivitiesCard'
import ReportsCard from '@/components/dashboard/ReportsCard'
import VerificationRequestsCard from '@/components/dashboard/VerificationRequestsCard'

export default function DashboardPage() {
  const handleExport = () => {
    alert('جاري تحضير ملف التصدير للوحة التحكم...')
  }

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* PageHeader Greeting */}
      <PageHeader
        breadcrumbs={['الرئيسية']}
        title="مرحبا ابراهيم !"
        subtitle="نظرة شاملة على حالة المنصة وأدائها"
        onExport={handleExport}
      />

      {/* Metrics Grid */}
      <MetricsGrid />

      {/* Row 3: Charts Grid (Revenue Area Chart + Users Donut Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <RevenueChart />
        <UsersDonutChart />
      </div>

      {/* Row 4: Details Tables & Sidebar (Pending Approvals + Recent Registrations + Reports + Verification Requests + Quick Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        <ReportsCard />
        <RecentRegistrationsTable />

        <VerificationRequestsCard />
        <RecentActivitiesCard />
      </div>
    </div>
  )
}
