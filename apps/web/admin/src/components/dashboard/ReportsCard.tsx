'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Card, Button } from '@buyootna/ui'

export interface ReportCardItem {
  id: string
  title: string
  reason: string
  timeAgo: string
  priority: 'عاجل' | 'متوسط' | 'منخفضة'
}

interface ReportsCardProps {
  reports: ReportCardItem[]
}

const PRIORITY_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  عاجل: { bg: 'bg-[#FEF3F2]', text: 'text-[#B42318]', dot: 'bg-[#F04438]' },
  متوسط: { bg: 'bg-[#FFFAEB]', text: 'text-[#B54708]', dot: 'bg-[#F79009]' },
  منخفضة: { bg: 'bg-[#ECFDF3]', text: 'text-[#027A48]', dot: 'bg-[#12B76A]' },
}

export default function ReportsCard({ reports }: ReportsCardProps) {
  const router = useRouter()

  return (
    <Card
      className="bg-white lg:col-span-1 border-[#ECECEC] p-5 flex flex-col gap-4 relative select-none"
      data-node-id="2734:152702"
    >
      <div className="flex items-start justify-between w-full pb-1">
        <div className="space-y-1 text-right">
          <h3 className="font-['Cairo'] font-bold text-[16px] text-[#111111] leading-none">
            البلاغات التي تحتاج مراجعة
          </h3>
          <p className="font-['Cairo'] font-medium text-[13px] text-[#6b6a6a] leading-none">
            آخر البلاغات التي لم يتم التعامل معها
          </p>
        </div>
        <Link href="/reports">
          <Button
            variant="ghost"
            className="text-[#15304d] font-['Cairo'] font-bold text-[13px] hover:bg-slate-50 h-7.5 px-3 rounded-xl cursor-pointer"
          >
            عرض الكل
          </Button>
        </Link>
      </div>

      {reports.length === 0 ? (
        <p className="py-6 text-center font-['Cairo'] text-[13px] text-[#6b6a6a]">
          لا توجد بلاغات تحتاج مراجعة حالياً.
        </p>
      ) : (
        <div className="flex flex-col w-full divide-y divide-[#ECECEC]">
          {reports.map((item) => {
            const style = PRIORITY_STYLES[item.priority] ?? PRIORITY_STYLES['متوسط']
            return (
              <div
                key={item.id}
                className="flex items-center justify-between py-3.5 hover:bg-[#F9FAFB]/50 transition duration-150"
              >
                <div className="flex flex-col gap-1 text-right">
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-['Cairo'] font-medium ${style.bg} ${style.text}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`} />
                      {item.priority}
                    </span>
                    <span className="font-['Cairo'] font-bold text-[13px] text-[#111111]">
                      {item.title}
                    </span>
                  </div>
                  <span className="font-['Cairo'] font-normal text-[12px] text-[#6b6a6a]">
                    {item.reason} · {item.timeAgo}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => router.push(`/reports?open=${item.id}`)}
                  className="text-[#15304d] font-['Cairo'] font-bold text-[13px] hover:underline cursor-pointer"
                >
                  التفاصيل
                </button>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}
