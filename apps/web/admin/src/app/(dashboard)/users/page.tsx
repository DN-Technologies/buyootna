'use client'

import React from 'react'
import { Download, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@buyootna/ui'
import PageHeader from '@/components/PageHeader'
import StatCard from '@/components/StatCard'

export default function UsersPage() {
  const handleAddUser = () => {
    alert('إضافة مستخدم جديد')
  }

  const handleExport = () => {
    alert('جاري تصدير بيانات إدارة المستخدمين...')
  }

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Header matching Figma Node 2558-88544 */}
      <PageHeader
        breadcrumbs={['الرئيسية', 'إدارة الحسابات', 'المستخدمون']}
        title="المستخدمون"
        subtitle="إدارة جميع حسابات المنصة، ومتابعة الاشتراكات والحالة والنشاط."
        primaryAction={{
          label: 'اضافة مستخدم',
          onClick: handleAddUser,
          icon: <Plus className="w-4 h-4 text-white" />,
        }}
        secondaryAction={{
          label: 'تصدير البيانات',
          onClick: handleExport,
          icon: <Download className="w-4 h-4 text-[#111111]" />,
        }}
      />

      {/* Statistics Cards Grid matching Figma Node 2558-88544 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="إجمالي المستخدمين"
          count={500}
          change="8.1%"
          trend="up"
          variant="green"
        />
        <StatCard
          title="نشط"
          count={100}
          change="8.1%"
          trend="up"
          variant="green"
        />
        <StatCard
          title="محظور"
          count={10}
          change="3.2%"
          trend="down"
          variant="red"
        />
        <StatCard
          title="موقوف"
          count={10}
          change="3.2%"
          trend="down"
          variant="orange"
        />
      </div>

      {/* Main Data Content Card */}
      <Card className="bg-white border-[#ECECEC]">
        <CardHeader className="border-b border-[#ECECEC] pb-4">
          <CardTitle className="text-base font-['Cairo'] font-bold text-primary">
            قائمة البيانات
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="flex flex-col items-center justify-center py-12 text-[#6B6A6A]">
            <p className="text-sm font-['Cairo'] mb-4">
              لا توجد بيانات لعرضها حالياً. هذه الصفحة عبارة عن هيكل جاهز
              للتطوير.
            </p>
            <Button
              variant="outline"
              onClick={handleAddUser}
              className="font-['Cairo'] font-semibold text-xs border-[#ECECEC] hover:bg-[#F8F9FA]"
            >
              إضافة جديد
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
