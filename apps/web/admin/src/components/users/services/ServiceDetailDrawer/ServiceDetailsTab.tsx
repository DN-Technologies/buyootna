'use client'

interface ServiceDetailsTabProps {
  isHidden: boolean
  isDeleted: boolean
  reportsCount: number
}

export default function ServiceDetailsTab({
  isHidden,
  isDeleted,
  reportsCount,
}: ServiceDetailsTabProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Deactivation Info Box */}
      {(isHidden || isDeleted) && (
        <div className="bg-[#F8FAFC] border-r-4 border-r-[#9C1E28] border-y border-l border-[#ECECEC] rounded-xl p-4 flex flex-col gap-2">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-[#6B6A6A]">
              {isHidden ? 'تاريخ الاخفاء' : 'تاريخ الحذف'}
            </span>
            <span className="font-bold text-[#111111]">12 يوليو 2026</span>
          </div>
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-[#6B6A6A]">بواسطة</span>
            <span className="font-bold text-[#111111]">أحمد سالم (مشرف)</span>
          </div>
          <div className="flex flex-col gap-1 text-[13px] pt-1">
            <span className="text-[#6B6A6A]">السبب</span>
            <span className="font-medium text-[#111111]">
              الكثير من البلاغات بسبب سوء المعاملة.
            </span>
          </div>
        </div>
      )}

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#ECECEC] flex flex-col gap-1">
          <span className="text-[12px] text-[#6B6A6A]">التصنيف</span>
          <span className="font-bold text-[14px] text-[#111111]">
            تنفيذ وتصميم
          </span>
        </div>
        <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#ECECEC] flex flex-col gap-1">
          <span className="text-[12px] text-[#6B6A6A]">مرات الطلب</span>
          <span className="font-bold text-[14px] text-[#111111]">10</span>
        </div>
        <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#ECECEC] flex flex-col gap-1">
          <span className="text-[12px] text-[#6B6A6A]">تاريخ الإضافة</span>
          <span className="font-bold text-[14px] text-[#111111]">
            15 يناير 2024
          </span>
        </div>
        <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#ECECEC] flex flex-col gap-1">
          <span className="text-[12px] text-[#6B6A6A]">آخر تحديث</span>
          <span className="font-bold text-[14px] text-[#111111]">
            15 يناير 2024
          </span>
        </div>
      </div>

      {/* Reports Stat */}
      <div className="bg-[#F8FAFC] p-3.5 rounded-xl border border-[#ECECEC] flex items-center justify-between">
        <span className="text-[13px] text-[#6B6A6A]">البلاغات</span>
        <span className="font-bold text-[16px] text-[#9C1E28]">
          {reportsCount}
        </span>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-2">
        <h4 className="font-bold text-[15px] text-[#111111]">الوصف</h4>
        <p className="text-[13px] font-medium text-[#111111] leading-relaxed bg-[#F8FAFC] p-4 rounded-xl border border-[#ECECEC]">
          شقة فاخرة للبيع في قلب السالمية، تتميز بتصميم معماري حديث وتشطيبات
          سوبر لوكس. الشقة تقع في الدور الـ 4 مما يوفر إطلالة بانورامية على
          الخليج العربي، موقع البرج حيوي جداً وقريب من المجمعات التجارية
          والخدمات الرئيسية.
        </p>
      </div>
    </div>
  )
}
