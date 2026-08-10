'use client'

import { Card } from '@buyootna/ui'
import { Store } from 'lucide-react'

export default function UserExhibitionTabContent() {
  return (
    <Card className="p-8 bg-white border border-[#ECECEC] rounded-lg text-center flex flex-col items-center justify-center gap-3 font-['Cairo'] min-h-75">
      <div className="size-12 rounded-full bg-[#F5F7F9] flex items-center justify-center text-primary">
        <Store className="w-6 h-6" />
      </div>
      <h3 className="font-bold text-[18px] text-[#111111]">معرض الشركة</h3>
      <p className="text-[14px] text-[#6B6A6A] max-w-md leading-relaxed">
        يتم عرض جميع العقارات والمعروضات الخاصة بالشركة في المعرض هنا.
      </p>
    </Card>
  )
}
