'use client'

import { useState } from 'react'

import CompanyCard from '@/components/cards/CompanyCard'
import Section from '@/components/ui/Section'
import SectionHeader from '@/components/ui/SectionHeader'
import { api } from '@/lib/api'
import { COMPANY_CATEGORIES } from '@/lib/categories'
import type { Company, Page } from '@/lib/types'

const ALL = ''
// Two rows of three, as in the design
const CARDS_SHOWN = 6

/** "اكتشف شركات الخدمات": category tabs over a grid of companies. */
export default function CompaniesSection({ initial }: { initial: Company[] }) {
  const [category, setCategory] = useState(ALL)
  const [companies, setCompanies] = useState(initial)
  const [loading, setLoading] = useState(false)

  // With nothing to show even under "الكل", the section is left out
  if (initial.length === 0) return null

  const select = async (next: string) => {
    if (next === category) return
    setCategory(next)
    if (next === ALL) {
      setCompanies(initial)
      return
    }
    setLoading(true)
    try {
      const { data } = await api.get<Page<Company>>('/users/companies', {
        params: { category: next, limit: CARDS_SHOWN },
      })
      setCompanies(data.data ?? [])
    } catch {
      setCompanies([])
    } finally {
      setLoading(false)
    }
  }

  const allHref = category
    ? `/companies?category=${encodeURIComponent(category)}`
    : '/companies'

  return (
    <Section className="flex flex-col gap-4">
      <SectionHeader title="اكتشف شركات الخدمات" allHref={allHref} />

      <div className="flex flex-col gap-5">
        <div
          role="tablist"
          aria-label="نوع الخدمة"
          className="no-scrollbar flex gap-2.5 overflow-x-auto border-b border-line"
        >
          {[ALL, ...COMPANY_CATEGORIES].map((name) => {
            const active = name === category
            return (
              <button
                key={name || 'all'}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => select(name)}
                className="flex h-11 shrink-0 flex-col items-center justify-between px-2.5 pt-2.5"
              >
                <span
                  className={`text-base whitespace-nowrap ${active ? 'font-bold text-brand' : 'font-medium text-muted'}`}
                >
                  {name || 'الكل'}
                </span>
                <span
                  className={`h-0.5 w-full rounded-t-md ${active ? 'bg-brand' : 'bg-transparent'}`}
                />
              </button>
            )
          })}
        </div>

        {companies.length > 0 ? (
          <div
            aria-busy={loading}
            className={`grid gap-5 sm:grid-cols-2 lg:grid-cols-3 ${loading ? 'opacity-60' : ''}`}
          >
            {companies.slice(0, CARDS_SHOWN).map((company) => (
              <CompanyCard key={company.id} company={company} />
            ))}
          </div>
        ) : (
          <p className="py-12 text-center text-base font-medium text-muted">
            {loading
              ? 'جاري التحميل...'
              : 'لا توجد شركات في هذا التصنيف حالياً'}
          </p>
        )}
      </div>
    </Section>
  )
}
