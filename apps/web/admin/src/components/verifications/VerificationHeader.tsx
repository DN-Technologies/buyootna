'use client'

import React from 'react'
import Link from 'next/link'
import { ChevronLeft } from 'lucide-react'
import {
  HomeBreadcrumbIcon,
  ExportTrayIcon,
  TrendArrowDownIcon,
  TrendArrowUpIcon,
} from '@/components/icons/AdminIcons'
import { VerificationTab } from './types'

interface VerificationHeaderProps {
  activeTab: VerificationTab
  onTabChange: (tab: VerificationTab) => void
  onExport: () => void
  onBack: () => void
}

export default function VerificationHeader({
  activeTab,
  onTabChange,
  onExport,
  onBack,
}: VerificationHeaderProps) {
  return (
    <div className="border-b border-[#ECECEC] pb-5 pt-2 px-8 -mx-6 -mt-6 md:-mx-8 md:-mt-8 flex flex-col gap-1.5 text-right shrink-0 bg-white">
      {/* Breadcrumb line matching Figma 4779:122937 */}
      <div className="flex items-center justify-start gap-1.5 text-[14px] font-['Cairo']">
        <Link
          href="/"
          className="flex items-center gap-1.5 text-[#A0A0A0] hover:text-[#111111] transition-colors"
        >
          <HomeBreadcrumbIcon className="w-3.5 h-3.5 text-[#A0A0A0]" />
          <span>الرئيسية</span>
        </Link>
        <ChevronLeft className="w-3.5 h-3.5 text-[#A0A0A0]" />
        <span className="text-[#111111] font-normal">طلبات التحقق</span>
      </div>

      {/* Back Link matching Figma 4779:122938 */}
      <div className="flex items-center justify-start mt-0.5">
        <button
          type="button"
          onClick={onBack}
          className="flex items-center gap-1 text-[14px] font-['Cairo'] font-normal text-[#111111] hover:text-primary transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-3 h-3 text-[#111111]" />
          <span>العودة</span>
        </button>
      </div>

      {/* Page Title & Action matching Figma 4779:122942 */}
      <div className="flex items-center justify-between mt-2">
        <div className="space-y-1 text-right">
          <h1 className="font-['Cairo'] font-bold text-[22px] text-[#111111] leading-tight">
            طلبات التحقق
          </h1>
          <p className="font-['Cairo'] font-medium text-[16px] text-[#6B6A6A] leading-normal tracking-[0.32px]">
            مراجعة وإدارة جميع طلبات التوثيق المقدمة من الشركات والمكاتب
            العقارية.
          </p>
        </div>

        {/* Export Action Button */}
        <button
          type="button"
          onClick={onExport}
          className="bg-white border border-[#E2E8F0] hover:bg-[#F8FAFC] rounded-[20px] h-10 px-5 font-['Cairo'] font-bold text-[14px] text-[#111111] flex items-center justify-center gap-2 cursor-pointer shadow-xs transition-colors"
        >
          <ExportTrayIcon className="w-4 h-4 text-[#111111]" />
          <span>تصدير</span>
        </button>
      </div>

      {/* Top 3 Metric Cards matching Figma 4779:122943 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
        {/* Card 1: قيد المراجعة (RTL rightmost) */}
        <div className="bg-[#F8FAFC] rounded-lg p-4 flex flex-col gap-2 border border-transparent hover:border-[#ECECEC] transition-colors">
          <div className="flex items-center justify-between w-full">
            <span className="font-['Cairo'] font-medium text-[14px] text-[#6B6A6A]">
              قيد المراجعة
            </span>
            <div className="bg-[rgba(255,249,72,0.15)] rounded-md px-1.5 py-0.5 flex items-center gap-1">
              <span className="font-['Inter'] font-medium text-[11px] text-[#F5B846] leading-none">
                3.2%
              </span>
              <TrendArrowDownIcon className="w-3 h-3" color="#F5B846" />
            </div>
          </div>
          <div className="text-right">
            <span className="font-['Cairo'] font-bold text-[24px] text-[#111111] leading-tight">
              20
            </span>
          </div>
        </div>

        {/* Card 2: تم اعتمادها اليوم (RTL middle) */}
        <div className="bg-[#F8FAFC] rounded-lg p-4 flex flex-col gap-2 border border-transparent hover:border-[#ECECEC] transition-colors">
          <div className="flex items-center justify-between w-full">
            <span className="font-['Cairo'] font-medium text-[14px] text-[#6B6A6A]">
              تم اعتمادها اليوم
            </span>
            <div className="bg-[rgba(18,194,129,0.1)] rounded-md px-1.5 py-0.5 flex items-center gap-1">
              <span className="font-['Inter'] font-medium text-[11px] text-[#12C281] leading-none">
                8.1%
              </span>
              <TrendArrowUpIcon className="w-3 h-3" color="#12C281" />
            </div>
          </div>
          <div className="text-right">
            <span className="font-['Cairo'] font-bold text-[24px] text-[#018B1B] leading-tight">
              7
            </span>
          </div>
        </div>

        {/* Card 3: تم رفضها اليوم (RTL leftmost) */}
        <div className="bg-[#F8FAFC] rounded-lg p-4 flex flex-col gap-2 border border-transparent hover:border-[#ECECEC] transition-colors">
          <div className="flex items-center justify-between w-full">
            <span className="font-['Cairo'] font-medium text-[14px] text-[#6B6A6A]">
              تم رفضها اليوم
            </span>
            <div className="bg-[rgba(245,70,81,0.1)] rounded-md px-1.5 py-0.5 flex items-center gap-1">
              <span className="font-['Inter'] font-medium text-[11px] text-[#F54651] leading-none">
                3.2%
              </span>
              <TrendArrowDownIcon className="w-3 h-3" color="#F54651" />
            </div>
          </div>
          <div className="text-right">
            <span className="font-['Cairo'] font-bold text-[24px] text-[#9C1E28] leading-tight">
              3
            </span>
          </div>
        </div>
      </div>

      {/* Account Type Tabs matching Figma 4779:122978 */}
      <div className="border-b border-[#EBECEE] flex items-center justify-start gap-2 mt-4">
        <button
          type="button"
          onClick={() => onTabChange('all')}
          className={`px-3 py-2 text-[16px] font-['Cairo'] transition-colors relative cursor-pointer ${
            activeTab === 'all'
              ? 'text-primary font-bold'
              : 'text-[#6B6A6A] font-medium hover:text-[#111111]'
          }`}
        >
          الكل (50)
          {activeTab === 'all' && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-t-md" />
          )}
        </button>

        <button
          type="button"
          onClick={() => onTabChange('offices')}
          className={`px-3 py-2 text-[16px] font-['Cairo'] transition-colors relative cursor-pointer ${
            activeTab === 'offices'
              ? 'text-primary font-bold'
              : 'text-[#6B6A6A] font-medium hover:text-[#111111]'
          }`}
        >
          المكاتب العقارية (50)
          {activeTab === 'offices' && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-t-md" />
          )}
        </button>

        <button
          type="button"
          onClick={() => onTabChange('companies')}
          className={`px-3 py-2 text-[16px] font-['Cairo'] transition-colors relative cursor-pointer ${
            activeTab === 'companies'
              ? 'text-primary font-bold'
              : 'text-[#6B6A6A] font-medium hover:text-[#111111]'
          }`}
        >
          الشركات (20)
          {activeTab === 'companies' && (
            <span className="absolute bottom-0 inset-x-0 h-0.5 bg-primary rounded-t-md" />
          )}
        </button>
      </div>
    </div>
  )
}
