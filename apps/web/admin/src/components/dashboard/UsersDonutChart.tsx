'use client'

import { Card } from '@buyootna/ui'

export default function UsersDonutChart() {
  return (
    <Card
      className="lg:col-span-1 bg-white border-[#ECECEC] p-[17px] flex flex-col gap-4 relative select-none"
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
        <div className="relative w-[170px] h-[170px]">
          <svg
            className="w-full h-full transform -rotate-90"
            viewBox="0 0 100 100"
          >
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#3B82F6"
              strokeWidth="12"
              strokeDasharray="174 238.76"
              strokeDashoffset="0"
              className="transition-all duration-300"
            />
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#EAB308"
              strokeWidth="12"
              strokeDasharray="42 238.76"
              strokeDashoffset="-177"
              className="transition-all duration-300"
            />
            <circle
              cx="50"
              cy="50"
              r="38"
              fill="none"
              stroke="#10B981"
              strokeWidth="12"
              strokeDasharray="15 238.76"
              strokeDashoffset="-222"
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
            200
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
            20
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
            50
          </span>
        </div>
      </div>
    </Card>
  )
}
