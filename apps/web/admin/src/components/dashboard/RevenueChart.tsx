'use client'

import React, { useMemo, useState } from 'react'
import { Card } from '@buyootna/ui'

export interface RevenueChartMonth {
  month: string
  year: number
  amount: number
}

interface RevenueChartProps {
  data: RevenueChartMonth[]
}

const CHART_LEFT = 60
const CHART_RIGHT = 720
const CHART_TOP = 16
const CHART_BOTTOM = 220

function formatAmount(amount: number): string {
  return `${amount.toLocaleString('en-US')} د.ك`
}

export default function RevenueChart({ data }: RevenueChartProps) {
  const points = useMemo(() => {
    const maxVal = Math.max(...data.map((d) => d.amount), 1)
    const step = data.length > 1 ? (CHART_RIGHT - CHART_LEFT) / (data.length - 1) : 0

    return data.map((d, idx) => ({
      ...d,
      x: CHART_LEFT + idx * step,
      y: CHART_BOTTOM - (d.amount / maxVal) * (CHART_BOTTOM - CHART_TOP),
    }))
  }, [data])

  const [activeMonthIdx, setActiveMonthIdx] = useState<number>(
    Math.max(points.length - 1, 0),
  )
  const [isHovered, setIsHovered] = useState<boolean>(true)

  const handleMouseMove = (e: React.MouseEvent<SVGSVGElement, MouseEvent>) => {
    const svg = e.currentTarget
    const rect = svg.getBoundingClientRect()
    const x = e.clientX - rect.left
    const width = rect.width
    const viewBoxX = (x / width) * 800

    let closestIdx = 0
    let minDiff = Infinity

    points.forEach((p, idx) => {
      const diff = Math.abs(viewBoxX - p.x)
      if (diff < minDiff) {
        minDiff = diff
        closestIdx = idx
      }
    })

    setActiveMonthIdx(closestIdx)
    setIsHovered(true)
  }

  const activeMonth = points[activeMonthIdx]

  // Smooth line through the points using the same "half-step" cubic bezier
  // construction as the original hand-drawn chart: for consecutive points
  // (x0,y0)->(x1,y1), control points sit at the horizontal midpoint.
  const { svgLineD, svgAreaD } = useMemo(() => {
    if (points.length === 0) return { svgLineD: '', svgAreaD: '' }
    let d = `M ${points[0].x},${points[0].y}`
    for (let i = 1; i < points.length; i++) {
      const prev = points[i - 1]
      const cur = points[i]
      const midX = (prev.x + cur.x) / 2
      d += ` C ${midX},${prev.y} ${midX},${cur.y} ${cur.x},${cur.y}`
    }
    const area = `${d} L ${points[points.length - 1].x},240 L ${points[0].x},240 Z`
    return { svgLineD: d, svgAreaD: area }
  }, [points])

  const maxVal = Math.max(...data.map((d) => d.amount), 1)
  const yAxisLabels = [1, 0.75, 0.5, 0.25, 0].map((frac) => ({
    val: Math.round((maxVal * frac) / 1000) * 1000,
    y: CHART_TOP + (1 - frac) * (CHART_BOTTOM - CHART_TOP) - 8,
  }))

  return (
    <Card
      className="lg:col-span-2 bg-white border-[#ECECEC] p-5 select-none relative overflow-hidden"
      data-node-id="2376:5464"
    >
      <div className="flex items-start justify-between w-full pb-6">
        <div className="space-y-1 text-right">
          <h3 className="font-['Cairo'] font-bold text-[16px] text-[#111111] leading-none">
            الإيرادات
          </h3>
          <p className="font-['Cairo'] font-medium text-[13px] text-[#6b6a6a] leading-none">
            تحليل مالي شهري لآخر 12 شهر
          </p>
        </div>
      </div>

      <div className="relative w-full h-65 mt-2">
        {isHovered && activeMonth && (
          <div
            className="absolute bg-white border border-[#eceeef] shadow-lg rounded-md px-3 py-2.5 z-10 flex flex-col gap-1.5 pointer-events-none transition-all duration-150 ease-out text-right border-solid"
            style={{
              left: `${(activeMonth.x / 800) * 100}%`,
              top: `${(activeMonth.y / 240) * 100 - 32}%`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            <p className="font-['Cairo'] font-semibold text-[13px] text-[#111111] leading-none">
              {activeMonth.month}
            </p>
            <div className="flex items-center justify-end gap-2 shrink-0">
              <span className="font-['Cairo'] font-normal text-[12px] text-[#111111]">
                {formatAmount(activeMonth.amount)}
              </span>
              <span className="font-['Cairo'] font-normal text-[12px] text-[#6b6a6a]">
                الايرادات
              </span>
              <span className="w-2 h-2 rounded-full bg-[#3B82F6]" />
            </div>
          </div>
        )}

        <svg
          className="w-full h-55"
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
          {points.map((p, idx) => (
            <line
              key={idx}
              x1={p.x}
              y1="0"
              x2={p.x}
              y2="240"
              stroke="#ECECEC"
              strokeDasharray="4 4"
              strokeWidth="1"
            />
          ))}

          {/* Y-Axis Labels */}
          {yAxisLabels.map((axis, idx) => (
            <text
              key={idx}
              x="745"
              y={axis.y}
              textAnchor="start"
              fill="#6B6A6A"
              className="font-sans text-[11px]"
            >
              {axis.val.toLocaleString('en-US')}
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
        <div className="absolute left-15 right-20 bottom-0 flex justify-between select-none">
          {points.map((p, idx) => (
            <div
              key={idx}
              className={`font-['Cairo'] text-[11px] font-medium transition duration-150 ${
                activeMonthIdx === idx
                  ? 'text-[#111111] font-bold'
                  : 'text-[#A0A0A0]'
              }`}
              style={{ width: '40px', textAlign: 'center' }}
            >
              {p.month}
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}
