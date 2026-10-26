'use client'

import { useCallback, useEffect, useState } from 'react'
import { ArrowUpRight, CheckCircle2, Download } from 'lucide-react'
import UpgradePackageDialog from './UpgradePackageDialog'
import { AdminUserWallet, fetchUserWallet } from '@/lib/admin-plans'

function exportHistoryCsv(wallet: AdminUserWallet) {
  const header = 'الباقة,رقم المعرف,الحالة,رصيد الاعلانات,التاريخ'
  const rows = wallet.history.map((item) =>
    [
      item.planName,
      item.displayId,
      item.status,
      item.adsRemaining,
      item.dateText,
    ].join(','),
  )
  const csv = [header, ...rows].join('\n')
  const blob = new Blob([`﻿${csv}`], { type: 'text/csv;charset=utf-8' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = 'package-history.csv'
  link.click()
  URL.revokeObjectURL(url)
}

export default function UserPackagesTabContent({
  userId,
  identityId,
}: {
  userId: string
  identityId?: string
}) {
  const [upgradeDialogOpen, setUpgradeDialogOpen] = useState(false)
  const [wallet, setWallet] = useState<AdminUserWallet | null>(null)
  const [loading, setLoading] = useState(true)

  const loadWallet = useCallback(async () => {
    try {
      setLoading(true)
      const data = await fetchUserWallet(userId, identityId)
      setWallet(data)
    } catch (err) {
      console.error('Failed to load user wallet:', err)
    } finally {
      setLoading(false)
    }
  }, [userId, identityId])

  useEffect(() => {
    loadWallet()
  }, [loadWallet])

  if (loading || !wallet) {
    return (
      <div className="w-full py-16 text-center text-[#6B6A6A] font-['Cairo']">
        جاري التحميل...
      </div>
    )
  }

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
            <span className="text-[20px] font-bold text-[#111111]">
              {wallet.balanceCounts.regular}
            </span>
            <span className="text-[14px] font-medium text-[#6B6A6A]">
              اعلان عادي
            </span>
          </div>

          {/* Card 2: Silver */}
          <div className="bg-[#F8FAFC] border border-[#ECECEC] rounded-xl p-4 flex flex-col justify-between h-24 text-right">
            <span className="text-[20px] font-bold text-[#111111]">
              {wallet.balanceCounts.silver}
            </span>
            <span className="text-[14px] font-medium text-[#6B6A6A]">
              اعلان فضي
            </span>
          </div>

          {/* Card 3: Gold */}
          <div className="bg-[#FFB81C] rounded-xl p-4 flex flex-col justify-between h-24 text-right shadow-sm">
            <span className="text-[20px] font-bold text-[#111111]">
              {wallet.balanceCounts.gold}
            </span>
            <span className="text-[14px] font-bold text-[#111111]">
              اعلان ذهبي
            </span>
          </div>
        </div>

        {/* Free Ad status */}
        <div className="flex items-center gap-2 text-[13px] font-medium text-[#111111] pt-1">
          <CheckCircle2
            className={`w-4 h-4 shrink-0 ${
              wallet.freeAdsRemaining > 0 ? 'text-[#018B1B]' : 'text-[#6B6A6A]'
            }`}
          />
          <span>
            {wallet.freeAdsRemaining > 0
              ? `الاعلان المجاني متاح (${wallet.freeAdsRemaining}).`
              : 'الاعلان المجاني مستخدم.'}
          </span>
        </div>
      </div>

      {/* Section 2: Package History */}
      <div className="bg-white border border-[#ECECEC] rounded-xl p-5 flex flex-col gap-5 w-full">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 w-full">
          <h3 className="text-[16px] font-bold text-[#111111]">سجل الباقات</h3>
          <button
            type="button"
            onClick={() => exportHistoryCsv(wallet)}
            disabled={wallet.history.length === 0}
            className="h-9 px-3.5 flex items-center gap-1.5 rounded-lg border border-[#E2E8F0] bg-white text-[13px] font-semibold text-[#111111] hover:bg-[#F8FAFC] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#111111]" />
            <span>تصدير الكل</span>
          </button>
        </div>

        {/* History Items List */}
        {wallet.history.length === 0 ? (
          <p className="text-[13px] text-[#6B6A6A] text-center py-6">
            لا يوجد سجل باقات لهذا المستخدم.
          </p>
        ) : (
          <div className="flex flex-col gap-3 w-full">
            {wallet.history.map((item) => {
              const isExpired = item.status === 'EXPIRED'
              return (
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
                            isExpired ? 'bg-[#DC2626]' : 'bg-[#018B1B]'
                          }`}
                        />
                        <span className="text-[15px] font-bold text-[#111111]">
                          {item.planName}
                        </span>
                      </div>
                      <span className="text-[12px] font-medium text-[#6B6A6A] pr-4">
                        {item.dateText}
                      </span>
                    </div>

                    {/* Left Info */}
                    <div className="flex flex-col items-end gap-1 text-left">
                      <span className="text-[12px] font-medium text-[#6B6A6A]">
                        {item.displayId}
                      </span>
                      <span className="text-[12px] font-medium text-[#6B6A6A]">
                        رصيد الاعلانات {item.adsRemaining}
                      </span>
                    </div>
                  </div>

                  {/* Progress Indicator Bar */}
                  <div
                    className={`h-1 w-full rounded-full ${
                      isExpired ? 'bg-[#DC2626]' : 'bg-[#2563EB]'
                    }`}
                  />
                </div>
              )
            })}
          </div>
        )}
      </div>

      <UpgradePackageDialog
        open={upgradeDialogOpen}
        onClose={() => setUpgradeDialogOpen(false)}
        userId={userId}
        identityId={identityId}
        onSuccess={loadWallet}
      />
    </div>
  )
}
