'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import {
  BillingFilterState,
  BillingTab,
  FilterOption,
  INVOICE_STATUS_OPTIONS,
  ROLE_OPTIONS,
  SUBSCRIPTION_STATUS_OPTIONS,
  formatKwd,
} from '@/components/billing/billing.types'
import BillingMetrics, { BillingMetric } from '@/components/billing/BillingMetrics'
import BillingFilters from '@/components/billing/BillingFilters'
import {
  InvoicesTable,
  SubscriptionsTable,
} from '@/components/billing/SubscriptionsTable'
import UserPagination from '@/components/users/UserPagination'
import {
  AdminBillingInvoicesResponse,
  AdminSubscriptionsResponse,
  BackendInvoiceStatus,
  fetchBillingInvoices,
  fetchSubscriptions,
} from '@/lib/admin-billing'

const PAGE_SIZE = 10
const EMPTY_FILTERS: BillingFilterState = { search: '', role: '', plan: '', status: '' }

export default function BillingPage() {
  const [activeTab, setActiveTab] = useState<BillingTab>('subscriptions')
  const [filters, setFilters] = useState<BillingFilterState>(EMPTY_FILTERS)
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [subscriptions, setSubscriptions] = useState<AdminSubscriptionsResponse | null>(null)
  const [invoices, setInvoices] = useState<AdminBillingInvoicesResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // The search box asks the server once typing pauses
  useEffect(() => {
    const timer = setTimeout(() => {
      setFilters((prev) => (prev.search === search ? prev : { ...prev, search }))
      setPage(1)
    }, 350)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    setError(null)
    const common = {
      search: filters.search || undefined,
      role: filters.role || undefined,
      page,
      limit: PAGE_SIZE,
    }
    const request =
      activeTab === 'subscriptions'
        ? fetchSubscriptions({
            ...common,
            plan: filters.plan || undefined,
            status: (filters.status || undefined) as 'active' | 'expired' | undefined,
          }).then((res) => !cancelled && setSubscriptions(res))
        : fetchBillingInvoices({
            ...common,
            status: (filters.status || undefined) as BackendInvoiceStatus | undefined,
          }).then((res) => !cancelled && setInvoices(res))
    request
      .catch(() => !cancelled && setError('تعذر تحميل البيانات.'))
      .finally(() => !cancelled && setLoading(false))
    return () => {
      cancelled = true
    }
  }, [activeTab, filters, page])

  const switchTab = (tab: BillingTab) => {
    if (tab === activeTab) return
    setActiveTab(tab)
    setFilters(EMPTY_FILTERS)
    setSearch('')
    setPage(1)
  }

  const updateFilter = (key: keyof BillingFilterState) => (value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setPage(1)
  }

  const metrics: BillingMetric[] =
    activeTab === 'subscriptions'
      ? [
          { label: 'إجمالي الاشتراكات', value: String(subscriptions?.metrics.total ?? 0) },
          { label: 'نشطة', value: String(subscriptions?.metrics.active ?? 0), tone: 'positive' },
          {
            label: 'تنتهي خلال 7 أيام',
            value: String(subscriptions?.metrics.expiringSoon ?? 0),
            tone: 'warning',
          },
          { label: 'منتهية', value: String(subscriptions?.metrics.expired ?? 0) },
        ]
      : [
          { label: 'إجمالي الفواتير', value: String(invoices?.metrics.total ?? 0) },
          { label: 'مدفوعة', value: String(invoices?.metrics.paid ?? 0), tone: 'positive' },
          {
            label: 'بانتظار الدفع',
            value: String(invoices?.metrics.pending ?? 0),
            tone: 'warning',
          },
          { label: 'الإيرادات المحصلة', value: formatKwd(invoices?.metrics.revenuePaid ?? 0) },
        ]

  const planOptions: FilterOption[] = [
    { value: '', label: 'الكل' },
    ...(subscriptions?.planNames ?? []).map((name) => ({ value: name, label: name })),
  ]

  const dropdowns = [
    { label: 'المستخدم', value: filters.role, options: ROLE_OPTIONS, onSelect: updateFilter('role') },
    ...(activeTab === 'subscriptions'
      ? [{ label: 'الباقة', value: filters.plan, options: planOptions, onSelect: updateFilter('plan') }]
      : []),
    {
      label: 'الحالة',
      value: filters.status,
      options: activeTab === 'subscriptions' ? SUBSCRIPTION_STATUS_OPTIONS : INVOICE_STATUS_OPTIONS,
      onSelect: updateFilter('status'),
    },
  ]

  const current = activeTab === 'subscriptions' ? subscriptions : invoices
  const pagination = current && current.meta.total > 0 && (
    <UserPagination
      currentPage={current.meta.currentPage}
      totalPages={current.meta.totalPages}
      totalItems={current.meta.total}
      currentCount={current.data.length}
      itemLabel={activeTab === 'subscriptions' ? 'اشتراك' : 'فاتورة'}
      onPageChange={setPage}
    />
  )

  return (
    <div className="flex flex-col gap-6 w-full font-['Cairo'] text-right pb-10" dir="rtl">
      <div className="flex items-center justify-between flex-wrap gap-4 border-b border-[#ECECEC] pb-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-1.5 text-[13px] text-[#6B6A6A]">
            <Link href="/" className="hover:text-[#111111]">
              الرئيسية
            </Link>
            <ChevronLeft className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span>المالية</span>
            <ChevronLeft className="w-3.5 h-3.5 text-[#94A3B8]" />
            <span className="text-[#111111] font-bold">الاشتراكات والفواتير</span>
          </div>
          <h1 className="text-[22px] font-bold text-[#111111] mt-1">الاشتراكات والفواتير</h1>
          <p className="text-[13px] font-medium text-[#6B6A6A]">
            اشتراكات الشركات وباقات الإعلانات للأفراد والمكاتب، وكل الفواتير وحالات الدفع.
          </p>
        </div>
      </div>

      <BillingMetrics metrics={metrics} loading={loading && !current} />

      <div className="border-b border-[#ECECEC] flex items-center gap-8 pt-2">
        {(
          [
            ['subscriptions', 'الاشتراكات'],
            ['invoices', 'الفواتير'],
          ] as const
        ).map(([tab, label]) => (
          <button
            key={tab}
            type="button"
            onClick={() => switchTab(tab)}
            className={`pb-3 text-[15px] font-bold transition-all relative cursor-pointer ${
              activeTab === tab ? 'text-primary' : 'text-[#6B6A6A] hover:text-[#111111]'
            }`}
          >
            <span>{label}</span>
            {activeTab === tab && (
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-full" />
            )}
          </button>
        ))}
      </div>

      <BillingFilters
        search={search}
        onSearchChange={setSearch}
        searchPlaceholder={
          activeTab === 'subscriptions'
            ? 'ابحث بالاسم أو البريد أو الهاتف...'
            : 'ابحث برقم الفاتورة أو الاسم أو البريد...'
        }
        dropdowns={dropdowns}
      />

      {error ? (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      ) : loading && !current ? (
        <div className="py-24 text-center text-[13px] text-[#6B6A6A]">جاري التحميل...</div>
      ) : activeTab === 'subscriptions' ? (
        <SubscriptionsTable rows={subscriptions?.data ?? []} footer={pagination} />
      ) : (
        <InvoicesTable rows={invoices?.data ?? []} footer={pagination} />
      )}
    </div>
  )
}
