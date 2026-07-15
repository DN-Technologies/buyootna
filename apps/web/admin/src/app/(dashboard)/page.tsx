'use client'

import React, { useState } from 'react'
import { ArrowLeft, ChevronDown, Eye, MoreVertical } from 'lucide-react'
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

const chartMonths = [
  { name: 'ديسمبر', value: '110,000 د.ك', x: 60, y: 184 },
  { name: 'نوفمبر', value: '108,000 د.ك', x: 120, y: 182 },
  { name: 'اكتوبر', value: '122,000 د.ك', x: 180, y: 170 },
  { name: 'سبتمبر', value: '135,000 د.ك', x: 240, y: 162 },
  { name: 'اغسطس', value: '148,000 د.ك', x: 300, y: 156 },
  { name: 'يوليو', value: '130,000 د.ك', x: 360, y: 165 },
  { name: 'يونيو', value: '172,000 د.ك', x: 420, y: 137 },
  { name: 'مايو', value: '195,000 د.ك', x: 480, y: 123 },
  { name: 'ابريل', value: '210,000 د.ك', x: 540, y: 115 },
  { name: 'مارس', value: '235,000 د.ك', x: 600, y: 106 },
  { name: 'فبراير', value: '250,000 د.ك', x: 660, y: 95 },
  { name: 'يناير', value: '137,000 د.ك', x: 720, y: 56 },
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

const recentRegistrations = [
  {
    id: '1',
    name: 'أحمد سعيد',
    email: 'Ahmed@gmail.com',
    type: 'فرد',
    subscription: 'ــــــ',
    subColor: 'text-[#a0a0a0]',
    subBg: 'bg-transparent',
    date: 'منذ ساعتين',
  },
  {
    id: '2',
    name: 'فاطمة الحربي',
    email: 'fatima@desertdelights.com',
    type: 'فرد',
    subscription: 'المجاني',
    subColor: 'text-[#2563eb]',
    subBg: 'bg-[#eaf0fd]',
    date: 'منذ 30 دقيقة',
  },
  {
    id: '3',
    name: 'محمد الزهراني',
    email: 'mohammed@oasistreats.net',
    type: 'مكتب عقاري',
    subscription: 'الفضية',
    subColor: 'text-[#344054]',
    subBg: 'bg-[#f2f4f7]',
    date: 'منذ يوم',
  },
  {
    id: '4',
    name: 'محمد الزهراني',
    email: 'mohammed@oasistreats.net',
    type: 'شركة',
    subscription: 'السنوية',
    subColor: 'text-[#12c281]',
    subBg: 'bg-[#12c281]/10',
    date: 'منذ 5 دقائق',
  },
  {
    id: '5',
    name: 'محمد الزهراني',
    email: 'mohammed@oasistreats.net',
    type: 'فرد',
    subscription: 'ــــــ',
    subColor: 'text-[#a0a0a0]',
    subBg: 'bg-transparent',
    date: 'منذ 5 دقائق',
  },
  {
    id: '6',
    name: 'محمد الزهراني',
    email: 'mohammed@oasistreats.net',
    type: 'فرد',
    subscription: 'ــــــ',
    subColor: 'text-[#a0a0a0]',
    subBg: 'bg-transparent',
    date: 'منذ 5 دقائق',
  },
]

const reports = [
  {
    id: '1',
    type: 'عقار',
    title: 'فيلا بالتجمع الخامس',
    reason: 'معلومات غير صحيحة',
    time: 'منذ 47 دقيقة',
    priority: 'عاجل',
    priorityColor: 'text-[#9c1e28]',
    bulletColor: 'bg-[#9c1e28]',
  },
  {
    id: '2',
    type: 'عقار',
    title: 'فيلا بالتجمع الخامس',
    reason: 'معلومات غير صحيحة',
    time: 'منذ 47 دقيقة',
    priority: 'عاجل',
    priorityColor: 'text-[#9c1e28]',
    bulletColor: 'bg-[#9c1e28]',
  },
  {
    id: '3',
    type: 'عقار',
    title: 'فيلا بالتجمع الخامس',
    reason: 'معلومات غير صحيحة',
    time: 'منذ 47 دقيقة',
    priority: 'منخفضة',
    priorityColor: 'text-[#344054]',
    bulletColor: 'bg-[#344054]',
  },
  {
    id: '4',
    type: 'عقار',
    title: 'فيلا بالتجمع الخامس',
    reason: 'معلومات غير صحيحة',
    time: 'منذ 47 دقيقة',
    priority: 'متوسط',
    priorityColor: 'text-[#b97500]',
    bulletColor: 'bg-[#b97500]',
  },
]

export default function DashboardPage() {
  const [activeMonthIdx, setActiveMonthIdx] = useState<number>(11) // January (index 11) is active by default
  const [isHovered, setIsHovered] = useState<boolean>(true)

  const handleExport = () => {
    alert('جاري تحضير ملف التصدير للوحة التحكم...')
  }

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const x = e.clientX - rect.left
    const width = rect.width
    const viewBoxX = (x / width) * 800

    let closestIdx = 0
    let minDiff = Infinity

    chartMonths.forEach((m, idx) => {
      const diff = Math.abs(viewBoxX - m.x)
      if (diff < minDiff) {
        minDiff = diff
        closestIdx = idx
      }
    })

    setActiveMonthIdx(closestIdx)
    setIsHovered(true)
  }

  const activeMonth = chartMonths[activeMonthIdx]

  // SVG coordinate details for drawing
  const svgLineD =
    'M 60,184 C 90,184 90,182 120,182 C 150,182 150,170 180,170 C 210,170 210,162 240,162 C 270,162 270,156 300,156 C 330,156 330,165 360,165 C 390,165 390,137 420,137 C 450,137 450,123 480,123 C 510,123 510,115 540,115 C 570,115 570,106 600,106 C 630,106 630,95 660,95 C 690,95 690,56 720,56'
  const svgAreaD = `${svgLineD} L 720,240 L 60,240 Z`

  return (
    <div className="space-y-6 text-right" dir="rtl">
      {/* PageHeader Greeting */}
      <PageHeader
        breadcrumbs={['الرئيسية']}
        title="مرحبا ابراهيم !"
        subtitle="نظرة شاملة على حالة المنصة وأدائها"
        onExport={handleExport}
      />

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className="bg-white border border-[#ECECEC] rounded-[8px] p-4 flex flex-col gap-2 relative overflow-hidden select-none"
            data-node-id={`card-${metric.id}`}
          >
            <div className="flex items-start justify-between relative">
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

              <p className="font-['Cairo'] font-medium text-[14px] text-[#6b6a6a] leading-[1.2]">
                {metric.title}
              </p>
            </div>

            <div className="flex flex-col items-end justify-center relative mt-1 select-text">
              <p className="font-['Cairo'] font-bold text-[24px] text-[#111111] leading-[1.4] text-right">
                {metric.value}
              </p>
            </div>

            {/* Sparkline */}
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
                <path d={metric.areaPath} fill={`url(#grad-${metric.id})`} />
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

      {/* Row 3: Charts Grid (Revenue Area Chart + Users Donut Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Area Chart */}
        <Card
          className="lg:col-span-2 bg-white border-[#ECECEC] p-[20px] select-none relative overflow-hidden"
          data-node-id="2376:5464"
        >
          <div className="flex items-start justify-between w-full pb-6">
            <Button
              variant="outline"
              className="bg-white border border-[#E2E8F0] rounded-[6px] h-[30px] px-3 font-['Cairo'] font-semibold text-[12px] text-[#111111] hover:bg-[#F8F9FA] gap-1.5 flex items-center shrink-0 cursor-pointer"
            >
              <ChevronDown className="w-3.5 h-3.5 text-[#111111]" />
              <span>هذه السنة</span>
            </Button>

            <div className="space-y-1 text-right">
              <h3 className="font-['Cairo'] font-bold text-[16px] text-[#111111] leading-none">
                الإيرادات والمصروفات
              </h3>
              <p className="font-['Cairo'] font-medium text-[13px] text-[#6b6a6a] leading-none">
                تحليل مالي شهري لعام 2026
              </p>
            </div>
          </div>

          <div className="relative w-full h-[260px] mt-2">
            {isHovered && activeMonth && (
              <div
                className="absolute bg-white border border-[#eceeef] shadow-lg rounded-[6px] px-[12px] py-[10px] z-10 flex flex-col gap-1.5 pointer-events-none transition-all duration-150 ease-out text-right border-solid"
                style={{
                  left: `${(activeMonth.x / 800) * 100}%`,
                  top: `${(activeMonth.y / 240) * 100 - 32}%`,
                  transform: 'translate(-50%, -100%)',
                }}
              >
                <p className="font-['Cairo'] font-semibold text-[13px] text-[#111111] leading-none">
                  {activeMonth.name}
                </p>
                <div className="flex items-center justify-end gap-2 shrink-0">
                  <span className="font-['Cairo'] font-normal text-[12px] text-[#111111]">
                    {activeMonth.value}
                  </span>
                  <span className="font-['Cairo'] font-normal text-[12px] text-[#6b6a6a]">
                    الايرادات
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
                </div>
              </div>
            )}

            <svg
              className="w-full h-[220px]"
              viewBox="0 0 800 240"
              preserveAspectRatio="none"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setIsHovered(true)}
            >
              <defs>
                <linearGradient
                  id="chart-area-grad"
                  x1="0"
                  y1="0"
                  x2="0"
                  y2="1"
                >
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0.0" />
                </linearGradient>
              </defs>

              {/* Horizontal Grid */}
              {[0, 60, 120, 180, 240].map((y, idx) => (
                <line
                  key={idx}
                  x1="60"
                  y1={y}
                  x2="720"
                  y2={y}
                  stroke="#ECECEC"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              ))}

              {/* Vertical Grid */}
              {chartMonths.map((m, idx) => (
                <line
                  key={idx}
                  x1={m.x}
                  y1="0"
                  x2={m.x}
                  y2="240"
                  stroke="#ECECEC"
                  strokeDasharray="4 4"
                  strokeWidth="1"
                />
              ))}

              {/* Y-Axis Labels */}
              {[
                { val: '360', y: 8 },
                { val: '270', y: 68 },
                { val: '180', y: 128 },
                { val: '90', y: 188 },
                { val: '0', y: 236 },
              ].map((axis, idx) => (
                <text
                  key={idx}
                  x="745"
                  y={axis.y}
                  textAnchor="start"
                  fill="#6B6A6A"
                  className="font-sans text-[11px]"
                >
                  {axis.val}
                </text>
              ))}

              <path d={svgAreaD} fill="url(#chart-area-grad)" />
              <path
                d={svgLineD}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2.5"
              />

              {isHovered && activeMonth && (
                <line
                  x1={activeMonth.x}
                  y1="0"
                  x2={activeMonth.x}
                  y2="240"
                  stroke="#3B82F6"
                  strokeWidth="1.5"
                  strokeDasharray="2 2"
                />
              )}

              {isHovered && activeMonth && (
                <>
                  <circle
                    cx={activeMonth.x}
                    cy={activeMonth.y}
                    r="7"
                    fill="#3B82F6"
                    fillOpacity="0.3"
                  />
                  <circle
                    cx={activeMonth.x}
                    cy={activeMonth.y}
                    r="4.5"
                    fill="#ffffff"
                    stroke="#3B82F6"
                    strokeWidth="2"
                  />
                </>
              )}
            </svg>

            {/* X-Axis Labels */}
            <div className="absolute left-[60px] right-[80px] bottom-0 flex justify-between select-none">
              {chartMonths.map((m, idx) => (
                <div
                  key={idx}
                  className={`font-['Cairo'] text-[11px] font-medium transition duration-150 ${
                    activeMonthIdx === idx
                      ? 'text-[#111111] font-bold'
                      : 'text-[#A0A0A0]'
                  }`}
                  style={{ width: '40px', textAlign: 'center' }}
                >
                  {m.name}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Users Donut Chart */}
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
              <span className="font-sans font-semibold text-[13px] text-[#111111]">
                200
              </span>
              <div className="flex items-center justify-end gap-2.5">
                <span className="font-['Cairo'] font-semibold text-[12px] text-[#6b6a6a] leading-none">
                  الأفراد
                </span>
                <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
              </div>
            </div>
            <div className="flex items-center justify-between w-full h-[22.5px]">
              <span className="font-sans font-semibold text-[13px] text-[#111111]">
                20
              </span>
              <div className="flex items-center justify-end gap-2.5">
                <span className="font-['Cairo'] font-semibold text-[12px] text-[#6b6a6a] leading-none">
                  الشركات
                </span>
                <span className="w-2 h-2 rounded-full bg-[#10B981]" />
              </div>
            </div>
            <div className="flex items-center justify-between w-full h-[22.5px]">
              <span className="font-sans font-semibold text-[13px] text-[#111111]">
                50
              </span>
              <div className="flex items-center justify-end gap-2.5">
                <span className="font-['Cairo'] font-semibold text-[12px] text-[#6b6a6a] leading-none">
                  المكاتب العقارية
                </span>
                <span className="w-2 h-2 rounded-full bg-[#EAB308]" />
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Row 4: Details Tables & Sidebar (Pending Approvals + Recent Registrations + Reports + Quick Actions) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-2">
        {/* Left Column: Data Tables (Pending Approvals + Recent Registrations) */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Pending approvals table */}
          <Card
            className="bg-white border-[#ECECEC]"
            data-node-id="pending-approvals-card"
          >
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

          {/* Figma compliant Recent Registrations Table (node 2376:5586) */}
          <Card
            className="bg-white border-[#ECECEC] py-[20px] select-none relative overflow-hidden"
            data-node-id="2376:5586"
          >
            <div className="flex items-start justify-between w-full px-6 pb-4">
              <div className="space-y-1 text-right">
                <h3 className="font-['Cairo'] font-bold text-[16px] text-[#111111] leading-none">
                  التسجيلات الاخيرة
                </h3>
                <p className="font-['Cairo'] font-medium text-[13px] text-[#6b6a6a] leading-none">
                  تحليل مالي شهري لعام 2026
                </p>
              </div>
              <Button
                variant="ghost"
                className="text-primary font-['Cairo'] font-bold text-[13px] hover:bg-slate-50 h-[30px] px-3 rounded-[12px]"
              >
                عرض الكل
              </Button>
            </div>

            <div className="overflow-x-auto w-full">
              <table className="w-full text-right text-sm">
                <thead>
                  <tr className="bg-[#F7FAF9] border-b border-[#ECECEC] text-[#6B6A6A]">
                    <th className="px-6 py-3 font-semibold font-['Cairo'] text-xs">
                      اسم المستخدم
                    </th>
                    <th className="px-6 py-3 font-semibold font-['Cairo'] text-xs">
                      نوع الحساب
                    </th>
                    <th className="px-6 py-3 font-semibold font-['Cairo'] text-xs">
                      الاشتراك
                    </th>
                    <th className="px-6 py-3 font-semibold font-['Cairo'] text-xs">
                      تاريخ التسجيل
                    </th>
                    <th className="px-6 py-3 font-semibold font-['Cairo'] text-xs text-left">
                      الاجراءات
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#ECECEC]">
                  {recentRegistrations.map((reg) => (
                    <tr
                      key={reg.id}
                      className="hover:bg-[#F9FAFB]/50 transition duration-150 h-[48px]"
                    >
                      <td className="px-6 py-2">
                        <div className="flex flex-col gap-0.5 text-right leading-none">
                          <span className="font-['Cairo'] font-semibold text-[13px] text-[#111111]">
                            {reg.name}
                          </span>
                          <span className="font-['Cairo'] font-normal text-[12px] text-[#6b6a6a]">
                            {reg.email}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-2 font-['Cairo'] font-normal text-[13px] text-[#111111]">
                        {reg.type}
                      </td>
                      <td className="px-6 py-2">
                        {reg.subscription === 'ــــــ' ? (
                          <span className="font-['Cairo'] font-medium text-[11px] text-[#a0a0a0]">
                            ــــــ
                          </span>
                        ) : (
                          <span
                            className={`px-2 py-0.5 rounded-[99px] text-[12px] font-['Cairo'] font-medium ${reg.subBg} ${reg.subColor}`}
                          >
                            {reg.subscription}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-2 font-['Cairo'] font-normal text-[12px] text-[#6b6a6a]">
                        {reg.date}
                      </td>
                      <td className="px-6 py-2 text-left">
                        <div className="flex justify-end items-center gap-3">
                          <button className="p-1 rounded hover:bg-slate-50 text-[#111111] transition cursor-pointer">
                            <Eye className="w-5 h-5 text-[#6B6A6A]" />
                          </button>
                          <button className="p-1 rounded hover:bg-slate-50 text-[#111111] transition cursor-pointer">
                            <MoreVertical className="w-5 h-5 text-[#6B6A6A]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column: Stacked Sidebar (Reports Needing Review + Quick Actions) */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          {/* Reports Needing Review Card */}
          <Card
            className="bg-white border-[#ECECEC] p-[17px] flex flex-col gap-4 relative select-none"
            data-node-id="2376:5216"
          >
            <div className="flex items-start justify-between w-full pb-2">
              <Button
                variant="ghost"
                className="text-primary font-['Cairo'] font-bold text-[13px] hover:bg-slate-50 h-[30px] px-3 rounded-[12px]"
              >
                عرض الكل
              </Button>
              <div className="space-y-1 text-right">
                <h3 className="font-['Cairo'] font-bold text-[16px] text-[#111111] leading-none">
                  البلاغات التي تحتاج مراجعة
                </h3>
                <p className="font-['Cairo'] font-medium text-[13px] text-[#6b6a6a] leading-none">
                  آخر البلاغات التي لم يتم التعامل معها
                </p>
              </div>
            </div>

            <div className="flex flex-col w-full">
              {reports.map((rep, idx) => (
                <div
                  key={rep.id}
                  className={`flex items-center justify-between py-3.5 w-full ${
                    idx < reports.length - 1 ? 'border-b border-[#ECEEEF]' : ''
                  }`}
                >
                  <button className="text-primary font-['Cairo'] font-bold text-[13px] hover:underline cursor-pointer">
                    التفاصيل
                  </button>

                  <div className="flex flex-col gap-1.5 items-end text-right">
                    <div className="flex items-center gap-1 justify-end h-[20px] rounded-[99px]">
                      <span
                        className={`font-['Cairo'] font-medium text-[12px] ${rep.priorityColor}`}
                      >
                        {rep.priority}
                      </span>
                      <span
                        className={`w-2 h-2 rounded-full ${rep.bulletColor}`}
                      />
                    </div>
                    <p className="font-['Cairo'] font-semibold text-[13px] text-[#111111] leading-none">
                      <span>عقار </span>
                      <span className="font-normal text-[#111111]">
                        {rep.title}
                      </span>
                    </p>
                    <p className="font-['Cairo'] font-normal text-[12px] text-[#6b6a6a] leading-none mt-0.5">
                      {rep.reason} · {rep.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          {/* Quick Actions Panel */}
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
        </div>
      </div>
    </div>
  )
}
