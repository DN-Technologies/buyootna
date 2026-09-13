'use client'

import React from 'react'

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

export default function MetricsGrid() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {metrics.map((metric) => (
        <div
          key={metric.id}
          className="bg-white border border-[#ECECEC] rounded-lg p-4 flex flex-col gap-2 relative overflow-hidden select-none"
          data-node-id={`card-${metric.id}`}
        >
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

          <div className="flex flex-col items-start  justify-center relative mt-1 select-text">
            <p className="font-['Cairo'] font-bold text-[24px] text-[#111111] leading-[1.4] text-right">
              {metric.value}
            </p>
          </div>

          {/* Sparkline */}
          <div className="h-[40px] w-full mt-2 relative -mb-4 overflow-hidden">
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
  )
}
