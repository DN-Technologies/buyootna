'use client'

export default function BillingMetrics() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 font-['Cairo'] text-right">
      {/* Box 1: Total Subscriptions */}
      <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-2xl p-5 flex flex-col justify-between gap-3">
        <span className="text-[13px] font-medium text-[#6B6A6A]">إجمالي الاشتراكات</span>
        <span className="text-[28px] font-bold text-[#111111]">500</span>
      </div>

      {/* Box 2: Active Subscriptions */}
      <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-2xl p-5 flex flex-col justify-between gap-3">
        <span className="text-[13px] font-medium text-[#6B6A6A]">نشطة</span>
        <span className="text-[28px] font-bold text-[#137333]">100</span>
      </div>

      {/* Box 3: Expired Subscriptions */}
      <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-2xl p-5 flex flex-col justify-between gap-3">
        <span className="text-[13px] font-medium text-[#6B6A6A]">منتهية</span>
        <span className="text-[28px] font-bold text-[#111111]">10</span>
      </div>

      {/* Box 4: Cancelled Subscriptions */}
      <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-2xl p-5 flex flex-col justify-between gap-3">
        <span className="text-[13px] font-medium text-[#6B6A6A]">ملغاة</span>
        <span className="text-[28px] font-bold text-[#9C1E28]">5</span>
      </div>
    </div>
  )
}
