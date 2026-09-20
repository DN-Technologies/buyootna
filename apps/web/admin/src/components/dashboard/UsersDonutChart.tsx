'use client'

import { useMemo } from 'react'
import { Card } from '@buyootna/ui'

interface UsersDonutChartProps {
  individual: number
  company: number
  office: number
}

const RADIUS = 38
const CIRCUMFERENCE = 2 * Math.PI * RADIUS

export default function UsersDonutChart({
  individual,
  company,
  office,
}: UsersDonutChartProps) {
  const segments = useMemo(() => {
    const total = individual + company + office || 1
    const individualArc = (individual / total) * CIRCUMFERENCE
    const companyArc = (company / total) * CIRCUMFERENCE
    const officeArc = (office / total) * CIRCUMFERENCE

    return {
      individual: { arc: individualArc, offset: 0 },
      company: { arc: companyArc, offset: -individualArc },
      office: { arc: officeArc, offset: -(individualArc + companyArc) },
    }
  }, [individual, company, office])

  return (
    <Card
      className="lg:col-span-1 bg-white border-[#ECECEC] p-4.25 flex flex-col gap-4 relative select-none"
      data-node-id="2376:5436"
    >
      <div className="space-y-1 text-right">
        <h3 className="font-['Cairo'] font-bold text-[16px] text-[#111111] leading-none">
          المستخدمون
        </h3>
        <p className="font-['Cairo'] font-medium text-[13px] text-[#6b6a6a] leading-none">
          تابع اعداد المستخدمون حسب نوع كل حساب
        </p>
      </div>

      <div className="flex items-center justify-center py-4">
        <div className="relative w-42.5 h-42.5">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke="#3B82F6"
              strokeWidth="12"
              strokeDasharray={`${segments.individual.arc} ${CIRCUMFERENCE}`}
              strokeDashoffset={segments.individual.offset}
              className="transition-all duration-300"
            />
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke="#10B981"
              strokeWidth="12"
              strokeDasharray={`${segments.company.arc} ${CIRCUMFERENCE}`}
              strokeDashoffset={segments.company.offset}
              className="transition-all duration-300"
            />
            <circle
              cx="50"
              cy="50"
              r={RADIUS}
              fill="none"
              stroke="#EAB308"
              strokeWidth="12"
              strokeDasharray={`${segments.office.arc} ${CIRCUMFERENCE}`}
              strokeDashoffset={segments.office.offset}
              className="transition-all duration-300"
            />
          </svg>
        </div>
      </div>

      <div className="flex flex-col gap-3.5 w-full mt-auto">
        <div className="flex items-center justify-between w-full h-[22.5px]">
          <div className="flex items-center justify-end gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
            <span className="font-['Cairo'] font-semibold text-[12px] text-[#6b6a6a] leading-none">
              الأفراد
            </span>
          </div>
          <span className="font-sans font-semibold text-[13px] text-[#111111]">
            {individual}
          </span>
        </div>
        <div className="flex items-center justify-between w-full h-[22.5px]">
          <div className="flex items-center justify-end gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#10B981]" />
            <span className="font-['Cairo'] font-semibold text-[12px] text-[#6b6a6a] leading-none">
              الشركات
            </span>
          </div>
          <span className="font-sans font-semibold text-[13px] text-[#111111]">
            {company}
          </span>
        </div>
        <div className="flex items-center justify-between w-full h-[22.5px]">
          <div className="flex items-center justify-end gap-2.5">
            <span className="w-2 h-2 rounded-full bg-[#EAB308]" />
            <span className="font-['Cairo'] font-semibold text-[12px] text-[#6b6a6a] leading-none">
              المكاتب العقارية
            </span>
          </div>
          <span className="font-sans font-semibold text-[13px] text-[#111111]">
            {office}
          </span>
        </div>
      </div>
    </Card>
  )
}
