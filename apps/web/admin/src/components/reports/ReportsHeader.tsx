'use client'

import React from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { HomeBreadcrumbIcon } from '@/components/icons/AdminIcons'
import { ReportStats } from './types'

interface ReportsHeaderProps {
  stats: ReportStats
}

export function ReportsHeader({ stats }: ReportsHeaderProps) {
  const router = useRouter()

  return (
    <div className="space-y-4">
      {/* Breadcrumb and Back Action */}
      <div className="flex items-center justify-between">
        <nav className="flex items-center gap-2 text-sm text-[#6B6A6A]">
          <Link
            href="/"
            className="flex items-center gap-1 hover:text-[#111111] transition-colors"
          >
            <HomeBreadcrumbIcon className="w-3.5 h-3.5" color="#6B6A6A" />
            <span>الرئيسية</span>
          </Link>
          <ChevronLeft className="w-3.5 h-3.5 text-[#A0A0A0]" />
          <span className="text-[#111111] font-medium">
            البلاغات التي تحتاج مراجعة
          </span>
        </nav>

        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-[#0f2236] transition-colors cursor-pointer"
        >
          <span>العودة</span>
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Page Heading */}
      <div className="space-y-1">
        <h1 className="text-[22px] font-bold text-[#111111] leading-tight">
          البلاغات التي تحتاج مراجعة
        </h1>
        <p className="text-sm text-[#6B6A6A]">
          إدارة ومراجعة جميع البلاغات المقدمة من المستخدمين واتخاذ الإجراءات
          المناسبة.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-1">
        <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-lg p-4 flex flex-col gap-1.5 transition hover:shadow-xs">
          <span className="text-sm font-medium text-[#6B6A6A]">
            إجمالي البلاغات
          </span>
          <span className="text-[26px] font-bold text-[#111111] leading-none">
            {stats.total}
          </span>
        </div>

        <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-lg p-4 flex flex-col gap-1.5 transition hover:shadow-xs">
          <span className="text-sm font-medium text-[#6B6A6A]">
            قيد المراجعة
          </span>
          <span className="text-[26px] font-bold text-[#111111] leading-none">
            {stats.pending}
          </span>
        </div>

        <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-lg p-4 flex flex-col gap-1.5 transition hover:shadow-xs">
          <span className="text-sm font-medium text-[#6B6A6A]">تم حلها</span>
          <span className="text-[26px] font-bold text-[#018B1B] leading-none">
            {stats.resolved}
          </span>
        </div>
      </div>
    </div>
  )
}
