import type { Metadata } from 'next'
import Link from 'next/link'

import CompanyCard from '@/components/cards/CompanyCard'
import ListingShell, { EmptyResults } from '@/components/layout/ListingShell'
import ListSearchBar from '@/components/ui/ListSearchBar'
import Pagination from '@/components/ui/Pagination'
import { COMPANY_CATEGORIES, COMPANY_SPECIALTIES } from '@/lib/categories'
import { getCompanies } from '@/lib/data'
import { formatNumber } from '@/lib/format'
import {
  hrefWith,
  listParam,
  pageParam,
  param,
  type RawSearchParams,
} from '@/lib/searchParams'

export const metadata: Metadata = {
  title: 'شركات الخدمات — بيوتنا',
  description:
    'اكتشف شركات المقاولات والتشطيب والصيانة والخدمات العقارية في الكويت.',
}

const PAGE_SIZE = 12

export default async function CompaniesPage({
  searchParams,
}: {
  searchParams: Promise<RawSearchParams>
}) {
  const params = await searchParams
  // The hero search can send several service types; the chips here pick one
  const categories = listParam(params, 'category').filter((name) =>
    COMPANY_CATEGORIES.includes(name),
  )
  const category = categories.join(',') || undefined
  const specialty =
    listParam(params, 'specialty')
      .filter((name) => COMPANY_SPECIALTIES.includes(name))
      .join(',') || undefined
  const location = listParam(params, 'location').join(',') || undefined
  const search = param(params, 'search')
  const page = pageParam(params)

  const { data, meta } = await getCompanies({
    category,
    specialty,
    location,
    search,
    page,
    limit: PAGE_SIZE,
  })
  // What the hero search narrowed by, beyond the category chips below
  const narrowedBy = [specialty, location]
    .filter(Boolean)
    .join(' • ')
    .replaceAll(',', '، ')

  return (
    <ListingShell
      title="شركات الخدمات"
      countLabel={meta.total ? `${formatNumber(meta.total)} شركة` : undefined}
    >
      <ListSearchBar
        action="/companies"
        placeholder="ابحث باسم الشركة"
        defaultValue={search}
        hidden={{ category, specialty, location }}
      />

      {narrowedBy && (
        <p className="flex flex-wrap items-center gap-3 text-sm font-medium text-muted">
          <span>نتائج البحث عن: {narrowedBy}</span>
          <Link href="/companies" className="font-bold text-brand">
            مسح التصفية
          </Link>
        </p>
      )}

      <nav
        aria-label="نوع الخدمة"
        className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5"
      >
        {['', ...COMPANY_CATEGORIES].map((name) => {
          const active = name
            ? categories.includes(name)
            : categories.length === 0
          return (
            <Link
              key={name || 'all'}
              href={hrefWith('/companies', {
                category: name || undefined,
                specialty,
                location,
                search,
              })}
              aria-current={active ? 'page' : undefined}
              className={`flex h-10 shrink-0 items-center rounded-full border px-4 text-sm whitespace-nowrap transition ${
                active
                  ? 'border-brand bg-brand font-bold text-white'
                  : 'border-line bg-white font-medium text-ink hover:bg-tag'
              }`}
            >
              {name || 'الكل'}
            </Link>
          )
        })}
      </nav>

      {data.length > 0 ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {data.map((company) => (
            <CompanyCard key={company.id} company={company} />
          ))}
        </div>
      ) : (
        <EmptyResults message="لا توجد شركات مطابقة لبحثك." />
      )}

      <Pagination
        current={meta.current || page}
        totalPages={meta.totalPages}
        hrefFor={(target) =>
          hrefWith('/companies', {
            category,
            specialty,
            location,
            search,
            page: target,
          })
        }
      />
    </ListingShell>
  )
}
