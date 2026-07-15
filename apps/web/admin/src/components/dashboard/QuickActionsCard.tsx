'use client'

import { Card, CardContent, CardHeader, CardTitle, Button } from '@buyootna/ui'

export default function QuickActionsCard() {
  return (
    <Card
      className="bg-white border-[#ECECEC]"
      data-node-id="quick-actions-card"
    >
      <CardHeader className="border-b border-[#ECECEC] pb-4">
        <CardTitle className="text-base font-['Cairo'] font-bold text-primary">
          إجراءات سريعة
        </CardTitle>
        <p className="text-xs text-[#6B6A6A] mt-1">
          الوصول السريع للمهام الإدارية المعتادة.
        </p>
      </CardHeader>
      <CardContent className="pt-6 space-y-4">
        <Button
          variant="outline"
          className="w-full justify-start text-sm font-semibold font-['Cairo'] h-11 border-[#ECECEC] hover:bg-[#F8F9FA] hover:text-primary"
        >
          إرسال تنبيه عام للمنصة
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-sm font-semibold font-['Cairo'] h-11 border-[#ECECEC] hover:bg-[#F8F9FA] hover:text-primary"
        >
          تحديث أسعار الباقات والاشتراكات
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-sm font-semibold font-['Cairo'] h-11 border-[#ECECEC] hover:bg-[#F8F9FA] hover:text-primary"
        >
          توليد تقرير الإيرادات الشهري
        </Button>
        <Button
          variant="outline"
          className="w-full justify-start text-sm font-semibold font-['Cairo'] h-11 border-[#ECECEC] hover:bg-[#F8F9FA] hover:text-primary"
        >
          مراجعة سجلات الأخطاء والعمليات
        </Button>
      </CardContent>
    </Card>
  )
}
