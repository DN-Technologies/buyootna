'use client'

import { Card } from '@buyootna/ui'
import { Wrench } from 'lucide-react'

export default function UserServicesTabContent() {
  return (
    <Card className="p-8 bg-white border border-[#ECECEC] rounded-lg text-center flex flex-col items-center justify-center gap-3 font-['Cairo'] min-h-75">
      <div className="size-12 rounded-full bg-[#F5F7F9] flex items-center justify-center text-primary">
        <Wrench className="w-6 h-6" />
      </div>
      <h3 className="font-bold text-[18px] text-[#111111]">خدمات المكتب</h3>
      <p className="text-[14px] text-[#6B6A6A] max-w-md leading-relaxed">
        يتم عرض جميع الخدمات المتاحة والخاصة بهذا المكتب العقاري هنا.
      </p>
    </Card>
  )
}
