'use client'

import { useEffect, useState } from 'react'
import { Headphones } from 'lucide-react'
import UserServiceCard from './UserServiceCard'
import { AdminUserServices, fetchUserServices } from '@/lib/admin-services'

/** الخدمات: a company's services, or an office's listed ones (read-only). */
export default function UserServicesTabContent({
  userId,
  identityId,
  userRole,
}: {
  userId: string
  identityId?: string
  userRole?: 'INDIVIDUAL' | 'OFFICE' | 'COMPANY'
}) {
  const [data, setData] = useState<AdminUserServices | null>(null)
  const [error, setError] = useState(false)

  useEffect(() => {
    let cancelled = false
    setData(null)
    setError(false)
    fetchUserServices(userId, identityId)
      .then((res) => !cancelled && setData(res))
      .catch(() => !cancelled && setError(true))
    return () => {
      cancelled = true
    }
  }, [userId, identityId])

  if (error) {
    return (
      <div className="py-16 text-center text-[13px] text-[#9C1E28] font-['Cairo']">
        تعذر تحميل الخدمات.
      </div>
    )
  }
  if (!data) {
    return (
      <div className="py-16 text-center text-[13px] text-[#6B6A6A] font-['Cairo']">
        جاري التحميل...
      </div>
    )
  }

  return (
    <div className="w-full font-['Cairo'] flex flex-col gap-4" dir="rtl">
      {data.servicesHidden && (
        <div className="bg-[#FFFBEB] border border-[#FDE68A] text-[#92400E] text-[13px] rounded-lg px-4 py-3">
          الخدمات مخفية من الملف الشخصي (اخفاء الخدمة).
        </div>
      )}
      {data.services.length === 0 ? (
        <div className="flex flex-col items-center justify-center text-center py-20 gap-3 bg-white border border-[#ECECEC] rounded-xl">
          <div className="size-20 rounded-2xl bg-[#F8FAFC] border border-[#ECECEC] flex items-center justify-center text-primary">
            <Headphones className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h3 className="font-bold text-[20px] text-[#111111] mt-2">
            لا توجد خدمات حتى الان
          </h3>
          <p className="text-[14px] text-[#6B6A6A] max-w-sm leading-relaxed">
            سوف تظهر الخدمات هنا فور اضافتها من المستخدم.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {data.services.map((service) => (
            <UserServiceCard
              key={service.id}
              service={service}
              showDate={userRole !== 'OFFICE'}
            />
          ))}
        </div>
      )}
    </div>
  )
}
