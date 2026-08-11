'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import {
  BillingFilterState,
  SubscriptionRecord,
} from '@/components/billing/billing.types'
import { MOCK_SUBSCRIPTIONS } from '@/components/billing/billing.data'
import BillingMetrics from '@/components/billing/BillingMetrics'
import BillingFilters from '@/components/billing/BillingFilters'
import SubscriptionsTable from '@/components/billing/SubscriptionsTable'
import BillingPagination from '@/components/billing/BillingPagination'

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<'subscriptions' | 'invoices'>(
    'subscriptions',
  )

  // Search & Filters State
  const [filters, setFilters] = useState<BillingFilterState>({
    searchQuery: '',
    userRoleFilter: 'الكل',
    packageFilter: 'الكل',
    statusFilter: 'الكل',
  })

  // Selection & Pagination State
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [currentPage, setCurrentPage] = useState(1)

  const updateFilters = (updates: Partial<BillingFilterState>) => {
    setFilters((prev) => ({ ...prev, ...updates }))
  }

  // Filter logic
  const filteredSubscriptions =
    activeTab === 'invoices'
      ? []
      : MOCK_SUBSCRIPTIONS.filter((sub) => {
          const q = filters.searchQuery.toLowerCase().trim()
          const matchesSearch =
            !q ||
            sub.userName.toLowerCase().includes(q) ||
            sub.userEmail.toLowerCase().includes(q) ||
            sub.packageName.toLowerCase().includes(q)

          const matchesUser =
            filters.userRoleFilter === 'الكل' ||
            (filters.userRoleFilter === 'الأفراد' &&
              sub.userRole === 'INDIVIDUAL') ||
            (filters.userRoleFilter === 'المكاتب العقارية' &&
              sub.userRole === 'OFFICE') ||
            (filters.userRoleFilter === 'الشركات' && sub.userRole === 'COMPANY')

          const matchesPackage =
            filters.packageFilter === 'الكل' ||
            sub.packageName === filters.packageFilter

          const matchesStatus =
            filters.statusFilter === 'الكل' ||
            (filters.statusFilter === 'مدفوعة' && sub.status === 'نشط') ||
            sub.status === filters.statusFilter

          return matchesSearch && matchesUser && matchesPackage && matchesStatus
        })

  const handleToggleSelectAll = () => {
    if (selectedIds.length === filteredSubscriptions.length) {
      setSelectedIds([])
    } else {
      setSelectedIds(filteredSubscriptions.map((s) => s.id))
    }
  }

  const handleToggleSelectOne = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    )
  }

  const handleActionClick = (
    action: 'view' | 'invoice' | 'rebuy',
    sub: SubscriptionRecord,
  ) => {
    if (action === 'view') alert(`عرض تفاصيل اشتراك ${sub.userName}`)
    else if (action === 'invoice') alert(`تحميل فاتورة ${sub.userName}`)
    else if (action === 'rebuy') alert(`شراء الباقة مجدداً لـ ${sub.userName}`)
  }

  return (
    <div
      className="flex flex-col gap-6 w-full font-['Cairo'] text-right pb-10"
      dir="rtl"
    >
      {/* Top Header Strip matching Figma Node 4497:213610 */}
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#ECECEC] pb-4">
        <div className="flex flex-col gap-1">
          {/* Breadcrumbs */}
          <div className="flex items-center gap-1.5 text-[13px] text-[#6B6A6A]">
            <Link href="/" className="hover:text-[#111111]">
              الرئيسية
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>المالية</span>
            <ChevronLeft className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="text-[#111111] font-bold">
              الاشتراكات والفواتير
            </span>
          </div>

          {/* Title & Subtitle */}
          <h1 className="text-[22px] font-bold text-[#111111] mt-1">
            الاشتراكات والفواتير
          </h1>
          <p className="text-[13px] font-medium text-[#6B6A6A]">
            إدارة اشتراكات المستخدمين والشركات ومتابعة الفواتير وحالات الدفع
            والمعاملات المالية.
          </p>
        </div>
      </div>

      {/* Summary Metrics Cards Grid */}
      <BillingMetrics />

      {/* Main Sub-nav Tabs */}
      <div className="border-b border-[#ECECEC] flex items-center gap-8 pt-2">
        <button
          type="button"
          onClick={() => setActiveTab('subscriptions')}
          className={`pb-3 text-[15px] font-bold transition-all relative cursor-pointer ${
            activeTab === 'subscriptions'
              ? 'text-primary'
              : 'text-[#6B6A6A] hover:text-[#111111]'
          }`}
        >
          <span>الاشتراكات</span>
          {activeTab === 'subscriptions' && (
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('invoices')}
          className={`pb-3 text-[15px] font-bold transition-all relative cursor-pointer ${
            activeTab === 'invoices'
              ? 'text-primary'
              : 'text-[#6B6A6A] hover:text-[#111111]'
          }`}
        >
          <span>الفواتير</span>
          {activeTab === 'invoices' && (
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full" />
          )}
        </button>
      </div>

      {/* Search & Filter Dropdowns Bar */}
      <BillingFilters filters={filters} onChange={updateFilters} />

      {/* Subscriptions Table & Pagination Card */}
      {filteredSubscriptions.length === 0 ? (
        <SubscriptionsTable
          subscriptions={[]}
          selectedIds={[]}
          onToggleSelectAll={() => {}}
          onToggleSelectOne={() => {}}
          onActionClick={() => {}}
          emptyTitle="لا توجد فواتير حتى الآن"
          emptySubtitle="ستظهر الفواتير والاشتراكات هنا عند إجلاء أي عملية شراء من المستخدمين."
        />
      ) : (
        <div className="bg-white border border-[#ECECEC] rounded-2xl shadow-xs overflow-hidden">
          <SubscriptionsTable
            subscriptions={filteredSubscriptions}
            selectedIds={selectedIds}
            onToggleSelectAll={handleToggleSelectAll}
            onToggleSelectOne={handleToggleSelectOne}
            onActionClick={handleActionClick}
          />
          <BillingPagination
            currentPage={currentPage}
            totalUsersCount={100}
            onPageChange={setCurrentPage}
          />
        </div>
      )}
    </div>
  )
}
