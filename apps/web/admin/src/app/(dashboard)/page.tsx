'use client'

import React from 'react'
import { ArrowLeft } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Button } from '@buyootna/ui'
import PageHeader from '@/components/PageHeader'

const metrics = [
  {
    id: 'users',
    title: 'إجمالي المستخدمين',
    value: '500',
    trend: '8.1%',
    isPositive: true,
    linePath: 'M 0 32 Q 20 30, 40 28 T 80 20 T 100 8',
    areaPath: 'M 0 32 Q 20 30, 40 28 T 80 20 T 100 8 L 100 40 L 0 40 Z',
  },
  {
    id: 'demo',
    title: 'الحسابات التجريبية',
    value: '100',
    trend: '8.1%',
    isPositive: true,
    linePath: 'M 0 8 Q 30 12, 60 22 T 100 32',
    areaPath: 'M 0 8 Q 30 12, 60 22 T 100 32 L 100 40 L 0 40 Z',
  },
  {
    id: 'reports',
    title: 'البلاغات الجديدة',
    value: '10',
    trend: '3.2%',
    isPositive: false,
    linePath: 'M 0 32 Q 25 28, 50 26 T 75 22 T 100 16',
    areaPath: 'M 0 32 Q 25 28, 50 26 T 75 22 T 100 16 L 100 40 L 0 40 Z',
  },
  {
    id: 'revenue',
    title: 'إجمالي الإيرادات',
    value: '84,800 د.ك',
    trend: '8.1%',
    isPositive: true,
    linePath: 'M 0 12 Q 25 15, 50 22 T 100 28',
    areaPath: 'M 0 12 Q 25 15, 50 22 T 100 28 L 100 40 L 0 40 Z',
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
    alert('جاري تحضير ملف التصدير للوحة التحكم...')
  }

  return (
    <div className="space-y-6 text-right" dir="rtl">
      <PageHeader
        breadcrumbs={['الرئيسية']}
        title="مرحبا ابراهيم !"
        subtitle="نظرة شاملة على حالة المنصة وأدائها"
        onExport={handleExport}
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className="bg-white border border-[#ECECEC] rounded-[8px] p-4 flex flex-col gap-2 relative overflow-hidden select-none"
            data-node-id={`card-${metric.id}`}
          >
            {/* Top row: badge + title */}
            <div className="flex items-start justify-between relative">
              <p className="font-['Cairo'] font-medium text-[14px] text-[#6b6a6a] leading-[1.2]">
                {metric.title}
              </p>

              <div
                className={`flex gap-[2px] items-center px-1.5 py-0.5 rounded-[6px] ${
                  metric.isPositive
                    ? 'bg-[#12c281]/10 text-[#12C281]'
                    : 'bg-[#f54651]/10 text-[#F54651]'
                }`}
              >
                <span className="text-[11px] font-semibold font-sans leading-none">
                  {metric.trend}
                </span>
                {metric.isPositive ? (
                  <svg
                    className="w-2.5 h-2.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-2.5 h-2.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth="3"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M19.5 4.5l-15 15m0 0h11.25m-11.25 0V8.25"
                    />
                  </svg>
                )}
              </div>
            </div>

            {/* Value */}
            <div className="flex flex-col justify-center relative mt-1 select-text">
              <p className="font-['Cairo'] font-bold text-[24px] text-[#111111] leading-[1.4] text-right">
                {metric.value}
              </p>
            </div>

            {/* Sparkline Graphic */}
            <div className="h-[40px] w-full mt-2 relative -mx-4 -mb-4 overflow-hidden">
              <svg
                className="w-[calc(100%+32px)] h-full"
                viewBox="0 0 100 40"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient
                    id={`grad-${metric.id}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop
                      offset="0%"
                      stopColor={metric.isPositive ? '#12C281' : '#F54651'}
                      stopOpacity="0.15"
                    />
                    <stop
                      offset="100%"
                      stopColor={metric.isPositive ? '#12C281' : '#F54651'}
                      stopOpacity="0.0"
                    />
                  </linearGradient>
                </defs>
                {/* Gradient Area Fill */}
                <path d={metric.areaPath} fill={`url(#grad-${metric.id})`} />
                {/* Stroke Path */}
                <path
                  d={metric.linePath}
                  fill="none"
                  stroke={metric.isPositive ? '#12C281' : '#F54651'}
                  strokeWidth="1.5"
                />
              </svg>
            </div>
          </div>
        ))}
      </div>

      {/* Section Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
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
            <CardTitle className="text-base font-['Cairo'] font-bold text-primary```">
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
