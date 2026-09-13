'use client'

import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@buyootna/ui'
import PageHeader from '@/components/PageHeader'

export default function DealsPage() {
  const handleExport = () => {
    alert('جاري تصدير بيانات الصفقات والمزادات...')
  }

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <PageHeader
        breadcrumbs={['الرئيسية', 'إدارة المنصة', 'الصفقات والمزادات']}
        title="الصفقات والمزادات"
        subtitle="متابعة وإدارة كافة الصفقات العقارية والمزادات العلنية المباشرة عبر المنصة."
        onExport={handleExport}
      />

      {/* Main Content Card */}
      <Card className="bg-white border-[#ECECEC]">
        <CardHeader className="border-b border-[#ECECEC] pb-4">
          <CardTitle className="text-base font-['Cairo'] font-bold text-primary">
            قائمة الصفقات والمزادات
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-[#6B6A6A]">
            <p className="text-sm font-['Cairo'] mb-4">
              لا توجد صفقات أو مزادات نشطة لعرضها حالياً.
            </p>
            <Button
              variant="outline"
              className="font-['Cairo'] font-semibold text-xs border-[#ECECEC] hover:bg-[#F8F9FA]"
            >
              إضافة صفقة جديدة
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
