'use client'

import React, { useState } from 'react'
import { ArrowLeft, ChevronDown } from 'lucide-react'
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
      {/* Figma compliant PageTitle Greeting (node 2376:5365) */}
      <PageHeader
        breadcrumbs={['الرئيسية']}
        title="مرحبا ابراهيم !"
        subtitle="نظرة شاملة على حالة المنصة وأدائها"
        onExport={handleExport}
      />

      {/* Figma compliant Metrics Grid (node 2376:5369) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => (
          <div
            key={metric.id}
            className="bg-white border border-[#ECECEC] rounded-[8px] p-4 flex flex-col gap-2 relative overflow-hidden select-none"
            data-node-id={`card-${metric.id}`}
          >
            {/* Top row: badge + title */}
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

            {/* Value */}
            <div className="flex flex-col items-end justify-center relative mt-1 select-text">
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

      {/* Row 3: Charts Grid (Revenue Area Chart + Users Donut Chart) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Figma compliant Revenue & Expenses Area Chart Card (node 2376:5464) */}
        <Card
          className="lg:col-span-2 bg-white border-[#ECECEC] p-[20px] select-none relative overflow-hidden"
          data-node-id="2376:5464"
        >
          {/* Header */}
          <div className="flex items-start justify-between w-full pb-6">
            {/* Dropdown Selector (Left side in RTL) */}
            <Button
              variant="outline"
              className="bg-white border border-[#E2E8F0] rounded-[6px] h-[30px] px-3 font-['Cairo'] font-semibold text-[12px] text-[#111111] hover:bg-[#F8F9FA] gap-1.5 flex items-center shrink-0 cursor-pointer"
            >
              <ChevronDown className="w-3.5 h-3.5 text-[#111111]" />
              <span>هذه السنة</span>
            </Button>

            {/* Titles (Right side in RTL) */}
            <div className="space-y-1 text-right">
              <h3 className="font-['Cairo'] font-bold text-[16px] text-[#111111] leading-none">
                الإيرادات والمصروفات
              </h3>
              <p className="font-['Cairo'] font-medium text-[13px] text-[#6b6a6a] leading-none">
                تحليل مالي شهري لعام 2026
              </p>
            </div>
          </div>

          {/* SVG Chart Wrapper */}
          <div className="relative w-full h-[260px] mt-2">
            {/* Active Tooltip Popover (Figma node 2376:5554 style) */}
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

            {/* The Graph */}
            <svg
              className="w-full h-[220px]"
              viewBox="0 0 800 240"
              preserveAspectRatio="none"
              onMouseMove={handleMouseMove}
              onMouseLeave={() => setIsHovered(true)} // Keep hovered on last point by default
            >
              <defs>
                {/* Area Gradient */}
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

              {/* Horizontal Grid Lines */}
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

              {/* Vertical Grid Lines */}
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

              {/* Y-Axis Value Labels (Right side in RTL, outside the grid) */}
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

              {/* Area Fill path */}
              <path d={svgAreaD} fill="url(#chart-area-grad)" />

              {/* Stroke line path */}
              <path
                d={svgLineD}
                fill="none"
                stroke="#3B82F6"
                strokeWidth="2.5"
              />

              {/* Hover Vertical Guide Line */}
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

              {/* Hover highlighted circle */}
              {isHovered && activeMonth && (
                <>
                  {/* Glow ring */}
                  <circle
                    cx={activeMonth.x}
                    cy={activeMonth.y}
                    r="7"
                    fill="#3B82F6"
                    fillOpacity="0.3"
                  />
                  {/* Core dot */}
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

            {/* X-Axis labels (RTL bottom) */}
            <div className="absolute left-[60px] right-[80px] bottom-0 flex justify-between select-none">
              {chartMonths.map((m, idx) => (
                <div
                  key={idx}
                  className={`font-['Cairo'] text-[11px] font-medium transition duration-150 ${
                    activeMonthIdx === idx
                      ? 'text-[#111111] font-bold'
                      : 'text-[#A0A0A0]'
                  }`}
                  style={{
                    width: '40px',
                    textAlign: 'center',
                  }}
                >
                  {m.name}
                </div>
              ))}
            </div>
          </div>
        </Card>

        {/* Figma compliant Users Donut Chart Card (node 2376:5436) */}
        <Card
          className="lg:col-span-1 bg-white border-[#ECECEC] p-[17px] flex flex-col gap-4 relative select-none"
          data-node-id="2376:5436"
        >
          {/* Header */}
          <div className="space-y-1 text-right">
            <h3 className="font-['Cairo'] font-bold text-[16px] text-[#111111] leading-none">
              المستخدمون
            </h3>
            <p className="font-['Cairo'] font-medium text-[13px] text-[#6b6a6a] leading-none">
              تابع اعداد المستخدمون حسب نوع كل حساب
            </p>
          </div>

          {/* Donut graphic circle */}
          <div className="flex items-center justify-center py-4">
            <div className="relative w-[170px] h-[170px]">
              <svg
                className="w-full h-full transform -rotate-90"
                viewBox="0 0 100 100"
              >
                {/* 1. Individuals Segment (Blue #3B82F6): Value 200/270 (74.1%)
                    Circumference = 2 * PI * r = 2 * PI * 38 = 238.76
                    Length = 74.1% of 238.76 = 176.9
                    Offset = 0
                */}
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

                {/* 2. Real Estate Offices Segment (Gold #EAB308): Value 50/270 (18.5%)
                    Length = 18.5% of 238.76 = 44.2
                    Offset = -176.9 - gap
                */}
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

                {/* 3. Companies Segment (Green #10B981): Value 20/270 (7.4%)
                    Length = 7.4% of 238.76 = 17.7
                    Offset = -221.1 - gap
                */}
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

          {/* Details list (RTL Legend) */}
          <div className="flex flex-col gap-3.5 w-full mt-auto">
            {/* Row 1: Individuals */}
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

            {/* Row 2: Companies */}
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

            {/* Row 3: Offices */}
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

      {/* Row 4: Details Tables/Actions (Pending Approvals + Quick Actions) */}
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
