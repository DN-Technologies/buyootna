'use client'

import React, { useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { Card, Button } from '@buyootna/ui'

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

export default function RevenueChart() {
  const [activeMonthIdx, setActiveMonthIdx] = useState<number>(11) // January (index 11) is active by default
  const [isHovered, setIsHovered] = useState<boolean>(true)

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
    <Card
      className="lg:col-span-2 bg-white border-[#ECECEC] p-[20px] select-none relative overflow-hidden"
      data-node-id="2376:5464"
    >
      <div className="flex items-start justify-between w-full pb-6">
        <div className="space-y-1 text-right">
          <h3 className="font-['Cairo'] font-bold text-[16px] text-[#111111] leading-none">
            الإيرادات والمصروفات
          </h3>
          <p className="font-['Cairo'] font-medium text-[13px] text-[#6b6a6a] leading-none">
            تحليل مالي شهري لعام 2026
          </p>
        </div>

        <Button
          variant="outline"
          className="bg-white border border-[#E2E8F0] rounded-[6px] h-[30px] px-3 font-['Cairo'] font-semibold text-[12px] text-[#111111] hover:bg-[#F8F9FA] gap-1.5 flex items-center shrink-0 cursor-pointer"
        >
          <ChevronDown className="w-3.5 h-3.5 text-[#111111]" />
          <span>هذه السنة</span>
        </Button>
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
            <linearGradient id="chart-area-grad" x1="0" y1="0" x2="0" y2="1">
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
          <path d={svgLineD} fill="none" stroke="#3B82F6" strokeWidth="2.5" />

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
  )
}
