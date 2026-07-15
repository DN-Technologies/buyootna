'use client'

import React from 'react'
import {
  Users,
  FileCheck,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  ArrowLeft,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@buyootna/ui'
import PageHeader from '@/components/PageHeader'

const stats = [
  {
    title: 'إجمالي المستخدمين',
    value: '1,248',
    change: '+12% هذا الشهر',
    icon: Users,
    color: 'text-blue-600 bg-blue-50 border-blue-100',
  },
  {
    title: 'الطلبات قيد المراجعة',
    value: '24',
    change: '6 طلبات جديدة اليوم',
    icon: AlertCircle,
    color: 'text-amber-600 bg-amber-50 border-amber-100',
  },
  {
    title: 'الاشتراكات النشطة',
    value: '382',
    change: '+8.5% من الأسبوع الماضي',
    icon: CheckCircle2,
    color: 'text-green-600 bg-green-50 border-green-100',
  },
  {
    title: 'الإيرادات الشهرية',
    value: '4,850 د.ك',
    change: '+18% نمو متوقع',
    icon: TrendingUp,
    color: 'text-purple-600 bg-purple-50 border-purple-100',
  },
]

const pendingRequests = [
  {
    id: '1',
    name: 'شركة النخبة العقارية',
    type: 'شركة',
    license: 'LIC-88390',
    date: 'منذ ساعتين',
    status: 'قيد الانتظار',
  },
  {
    id: '2',
    name: 'مكتب دار الخليج للعقارات',
    type: 'مكتب عقاري',
    license: 'LIC-22451',
    date: 'منذ 4 ساعات',
    status: 'قيد الانتظار',
  },
  {
    id: '3',
    name: 'شركة روتانا للمقاولات',
    type: 'شركة',
    license: 'LIC-11928',
    date: 'منذ يوم واحد',
    status: 'قيد الانتظار',
  },
  {
    id: '4',
    name: 'مكتب الصديق للخدمات العقارية',
    type: 'مكتب عقاري',
    license: 'LIC-77421',
    date: 'منذ يومين',
    status: 'قيد الانتظار',
  },
]

export default function DashboardPage() {
  const handleExport = () => {
    alert('جاري تحضير ملف التصدير...')
  }

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* Figma compliant PageTitle Greeting (node 2376:5365) */}
      <PageHeader
        breadcrumbs={['الرئيسية']}
        title="مرحبا ابراهيم !"
        subtitle="نظرة شاملة على حالة المنصة وأدائها"
        onExport={handleExport}
      />

      {/* Grid Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => {
          const Icon = stat.icon
          return (
            <Card key={i} className="bg-white border-[#ECECEC]">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-xs font-['Cairo'] font-semibold text-[#6B6A6A]">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg border ${stat.color}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-['Cairo'] text-[#111111]">
                  {stat.value}
                </div>
                <p className="text-xs text-green-600 mt-1 font-['Cairo']">
                  {stat.change}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Section Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Pending approvals table */}
        <Card className="lg:col-span-2 bg-white border-[#ECECEC]">
          <CardHeader className="flex flex-row items-center justify-between border-b border-[#ECECEC] pb-4">
            <div>
              <CardTitle className="text-base font-['Cairo'] font-bold text-primary">
                طلبات الاعتماد قيد الانتظار
              </CardTitle>
              <p className="text-xs text-[#6B6A6A] mt-1">
                طلبات جديدة للتسجيل كشركات أو مكاتب عقارية بحاجة لمراجعة
                التراخيص.
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="font-['Cairo'] font-semibold text-xs gap-1"
            >
              عرض الكل
              <ArrowLeft className="w-3.5 h-3.5" />
            </Button>
          </CardHeader>
          <CardContent className="pt-4 p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="border-b border-[#ECECEC] text-[#6B6A6A]">
                    <th className="px-6 py-3 font-semibold font-['Cairo'] text-xs">
                      الجهة الطالبة
                    </th>
                    <th className="px-6 py-3 font-semibold font-['Cairo'] text-xs">
                      نوع الحساب
                    </th>
                    <th className="px-6 py-3 font-semibold font-['Cairo'] text-xs">
                      رقم الترخيص
                    </th>
                    <th className="px-6 py-3 font-semibold font-['Cairo'] text-xs">
                      التاريخ
                    </th>
                    <th className="px-6 py-3 font-semibold font-['Cairo'] text-xs text-left">
                      الإجراء
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECECEC]">
                  {pendingRequests.map((req) => (
                    <tr
                      key={req.id}
                      className="hover:bg-[#F9FAFB]/50 transition duration-150"
                    >
                      <td className="px-6 py-3.5 font-semibold text-[#111111]">
                        {req.name}
                      </td>
                      <td className="px-6 py-3.5 text-[#6B6A6A] text-xs">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            req.type === 'شركة'
                              ? 'bg-blue-50 text-blue-600'
                              : 'bg-purple-50 text-purple-600'
                          }`}
                        >
                          {req.type}
                        </span>
                      </td>
                      <td className="px-6 py-3.5 text-[#6B6A6A] font-mono text-xs">
                        {req.license}
                      </td>
                      <td className="px-6 py-3.5 text-[#6B6A6A] text-xs">
                        {req.date}
                      </td>
                      <td className="px-6 py-3.5 text-left">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="default"
                            className="bg-primary text-white hover:bg-primary/90 text-xs font-semibold px-2.5 py-1"
                          >
                            مراجعة
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions Panel */}
        <Card className="bg-white border-[#ECECEC]">
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
      </div>
    </div>
  )
}
