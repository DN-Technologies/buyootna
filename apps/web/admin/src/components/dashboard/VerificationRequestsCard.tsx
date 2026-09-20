'use client'

import { Card, Button } from '@buyootna/ui'
import { AdminDashboardPendingVerification } from '@/lib/admin-dashboard'

export interface VerificationRequestsCardProps {
  requests: AdminDashboardPendingVerification[]
  onReview?: (request: AdminDashboardPendingVerification) => void
}

const TYPE_STYLES: Record<string, { color: string; bg: string }> = {
  شركة: { color: 'text-[#93370d]', bg: 'bg-[#fffaeb]' },
  'مكتب عقاري': { color: 'text-[#344054]', bg: 'bg-[#f2f4f7]' },
}

export default function VerificationRequestsCard({
  requests,
  onReview,
}: VerificationRequestsCardProps) {
  return (
    <Card
      className="bg-white lg:col-span-1 border-[#ECECEC] py-5 flex flex-col gap-4 relative select-none"
      data-node-id="2376:5816"
    >
      <div className="flex items-start justify-between w-full px-4.5">
        <div className="space-y-1 text-right">
          <h3 className="font-['Cairo'] font-bold text-[16px] text-[#111111] leading-none">
            طلبات التحقق
          </h3>
          <p className="font-['Cairo'] font-medium text-[13px] text-[#6b6a6a] leading-none">
            حسابات تنتظر مراجعة مستندات التوثيق
          </p>
        </div>
        <Button
          variant="ghost"
          className="text-[#15304d] font-['Cairo'] font-bold text-[13px] hover:bg-slate-50 h-7.5 px-3 rounded-xl"
        >
          عرض الكل
        </Button>
      </div>

      {requests.length === 0 ? (
        <p className="px-4.5 py-6 text-center font-['Cairo'] text-[13px] text-[#6b6a6a]">
          لا توجد طلبات تحقق قيد الانتظار
        </p>
      ) : (
        <div className="flex flex-col w-full">
          <div className="border-b border-[#ECECEC] pb-3 pt-2 w-full px-4.5">
            <div className="flex items-center justify-between w-full text-right">
              <span className="font-['Cairo'] font-semibold text-[12px] text-[#6b6a6a] w-35 text-right">
                المستخدم
              </span>
              <span className="font-['Cairo'] font-semibold text-[12px] text-[#6b6a6a] w-25 text-center">
                النوع
              </span>
              <span className="font-['Cairo'] font-semibold text-[12px] text-[#6b6a6a] w-20">
                الاجراءات
              </span>
            </div>
          </div>

          <div className="flex flex-col w-full divide-y divide-[#ECECEC]">
            {requests.map((req) => {
              const style = TYPE_STYLES[req.type] ?? TYPE_STYLES['مكتب عقاري']
              return (
                <div
                  key={req.identityId}
                  className="flex items-center justify-between py-3 px-4.5 w-full hover:bg-[#F9FAFB]/50 transition duration-150 h-12"
                >
                  <span className="font-['Cairo'] font-semibold text-[13px] text-[#111111] text-right w-35 truncate">
                    {req.name}
                  </span>
                  <div className="w-25 flex justify-center">
                    <span
                      className={`px-2 py-0.5 rounded-[99px] text-[11px] font-['Cairo'] font-medium ${style.bg} ${style.color}`}
                    >
                      {req.type}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onReview?.(req)}
                    className="text-[#15304d] font-['Cairo'] font-bold text-[13px] hover:underline cursor-pointer text-left w-20"
                  >
                    مراجعة
                  </button>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </Card>
  )
}
