"use client";

import React from "react";
import PageHeader from "@/components/PageHeader";
import MetricsGrid from "@/components/dashboard/MetricsGrid";
import RevenueChart from "@/components/dashboard/RevenueChart";
import UsersDonutChart from "@/components/dashboard/UsersDonutChart";
import PendingApprovalsTable from "@/components/dashboard/PendingApprovalsTable";
import RecentRegistrationsTable from "@/components/dashboard/RecentRegistrationsTable";
import RecentActivitiesCard from "@/components/dashboard/RecentActivitiesCard";
import ReportsCard from "@/components/dashboard/ReportsCard";
import VerificationRequestsCard from "@/components/dashboard/VerificationRequestsCard";
import QuickActionsCard from "@/components/dashboard/QuickActionsCard";

export default function DashboardPage() {
  const handleExport = () => {
    alert("جاري تحضير ملف التصدير للوحة التحكم...");
  };

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* PageHeader Greeting */}
      <PageHeader 
        breadcrumbs={["الرئيسية"]} 
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
        
        {/* Left Column: Data Tables (Pending Approvals + Recent Registrations + Recent Activities) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          <PendingApprovalsTable />
          <RecentRegistrationsTable />
          <RecentActivitiesCard />
        </div>

        {/* Right Column: Stacked Sidebar (Reports Needing Review + Verification Requests + Quick Actions) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <ReportsCard />
          <VerificationRequestsCard />
          <QuickActionsCard />
        </div>

      </div>
    </div>
  );
}
