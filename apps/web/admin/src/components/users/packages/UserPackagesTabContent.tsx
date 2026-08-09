'use client'

import { useState } from 'react'
import { ArrowUpRight, CheckCircle2, Download } from 'lucide-react'
import UpgradePackageDialog from './UpgradePackageDialog'

export interface PackageHistoryItem {
  id: string
  packageName: string
  packageId: string
  expiryDate: string
  adBalance: string
  isExpired: boolean
}

const mockPackageHistory: PackageHistoryItem[] = [
  {
    id: '1',
    packageName: 'الباقة الفضية',
    packageId: 'ID:13940453',
    expiryDate: 'تاريخ الانتهاء: 12 يوليو 2027',
    adBalance: '20/5',
    isExpired: false,
  },
  {
    id: '2',
    packageName: 'الباقة الفضية',
    packageId: 'ID:13940453',
    expiryDate: 'تاريخ الانتهاء: 12 يوليو 2027',
    adBalance: '20/5',
    isExpired: false,
  },
  {
    id: '3',
    packageName: 'الباقة الفضية',
    packageId: 'ID:13940453',
    expiryDate: 'منتهية في: 12 يوليو 2027',
    adBalance: '5/5',
    isExpired: true,
  },
  {
    id: '4',
    packageName: 'الباقة الفضية',
    packageId: 'ID:13940453',
    expiryDate: 'منتهية في: 12 يوليو 2027',
    adBalance: '5/5',
    isExpired: true,
  },
]

export default function UserPackagesTabContent() {
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)

  return (
    <div className="flex flex-col gap-6 w-full font-['Cairo']" dir="rtl">
      {/* Section 1: Ads Balance */}
      <div className="bg-white border border-[#ECECEC] rounded-xl p-5 flex flex-col gap-5 w-full">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 w-full">
          <h3 className="text-[16px] font-bold text-[#111111]">
            رصيد الاعلانات
          </h3>
          <button
            type="button"
            onClick={() => setUpgradeDialogOpen(true)}
            className="text-primary text-[13px] font-bold flex items-center gap-1 hover:underline cursor-pointer"
          >
            <ArrowUpRight className="w-4 h-4" />
            <span>ترقية الباقة</span>
          </button>
        </div>

        {/* Balance Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full">
          {/* Card 1: Normal */}
          <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-xl p-4 flex flex-col justify-between h-24 text-right">
            <span className="text-[20px] font-bold text-[#111111]">20/5</span>
            <span className="text-[14px] font-medium text-[#6B6A6A]">
              اعلان عادي
            </span>
          </div>

          {/* Card 2: Silver */}
          <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-xl p-4 flex flex-col justify-between h-24 text-right">
            <span className="text-[20px] font-bold text-[#111111]">20/5</span>
            <span className="text-[14px] font-medium text-[#6B6A6A]">
              اعلان فضي
            </span>
          </div>

          {/* Card 3: Gold */}
          <div className="bg-[#FFB81C] rounded-xl p-4 flex flex-col justify-between h-24 text-right shadow-sm">
            <span className="text-[20px] font-bold text-[#111111]">20/5</span>
            <span className="text-[14px] font-bold text-[#111111]">
              اعلان ذهبي
            </span>
          </div>
        </div>

        {/* Free Ad status */}
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#111111] pt-1">
          <CheckCircle2 className="w-4 h-4 text-[#018B1B] shrink-0" />
          <span>الاعلان المجاني مستخدم.</span>
        </div>
      </div>

      {/* Section 2: Package History */}
      <div className="bg-white border border-[#ECECEC] rounded-xl p-5 flex flex-col gap-5 w-full">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 w-full">
          <h3 className="text-[16px] font-bold text-[#111111]">سجل الباقات</h3>
          <button
            type="button"
            onClick={() => alert('"تصدير الكل" — تم تجهيز التصدير.')}
            className="h-9 px-3.5 flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[13px] font-semibold text-[#111111] hover:bg-[#F8FAFC] cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#111111]" />
            <span>تصدير الكل</span>
          </button>
        </div>

        {/* History Items List */}
        <div className="flex flex-col gap-3 w-full">
          {mockPackageHistory.map((item) => (
            <div
              key={item.id}
              className="bg-[#F8FAFC] border border-[#ECECEC] rounded-xl p-4 flex flex-col gap-3 w-full"
            >
              <div className="flex items-start justify-between gap-4 w-full flex-wrap">
                {/* Right Info */}
                <div className="flex flex-col gap-1 text-right">
                  <div className="flex items-center gap-2">
                    <span
                      className={`size-2 rounded-full ${
                        item.isExpired ? 'bg-[#DC2626]' : 'bg-[#018B1B]'
                      }`}
                    />
                    <span className="text-[15px] font-bold text-[#111111]">
                      {item.packageName}
                    </span>
                  </div>
                  <span className="text-[12px] font-medium text-[#6B6A6A] pr-4">
                    {item.expiryDate}
                  </span>
                </div>

                {/* Left Info */}
                <div className="flex flex-col items-end gap-1 text-left">
                  <span className="text-[12px] font-medium text-[#6B6A6A]">
                    {item.packageId}
                  </span>
                  <span className="text-[12px] font-medium text-[#6B6A6A]">
                    رصيد الاعلانات {item.adBalance}
                  </span>
                </div>
              </div>

              {/* Progress Indicator Bar */}
              <div
                className={`h-1 w-full rounded-full ${
                  item.isExpired ? 'bg-[#DC2626]' : 'bg-[#2563EB]'
                }`}
              />
            </div>
          ))}
        </div>
      </div>

      <UpgradePackageDialog
        open={upgradeDialogOpen}
        onClose={() => setUpgradeDialogOpen(false)}
      />
    </div>
  )
}
