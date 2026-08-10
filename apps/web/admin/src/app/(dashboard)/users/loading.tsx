import PageHeader from '@/components/PageHeader'
import Skeleton from '@/components/ui/Skeleton'

export default function Loading() {
  return (
    <div className="space-y-6 text-right pb-10 font-['Cairo']" dir="rtl">
      <PageHeader
        breadcrumbs={['الرئيسية', 'إدارة الحسابات', 'المستخدمون']}
        title="المستخدمون"
        subtitle="إدارة جميع حسابات المنصة، ومتابعة الاشتراكات والحالة والنشاط."
      />

      {/* Stats Grid Skeletons */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white border border-[#ECECEC] rounded-lg p-5 flex flex-col gap-2">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3 w-16" />
          </div>
        ))}
      </div>

      {/* Main Table Shell Skeleton */}
      <div className="bg-white border border-[#ECECEC] rounded-lg flex flex-col gap-4 p-5">
        <div className="flex items-center justify-between border-b border-[#ECECEC] pb-4">
          <Skeleton className="h-6 w-64" />
          <Skeleton className="h-9 w-48 rounded-full" />
        </div>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-md" />
          ))}
        </div>
      </div>
    </div>
  )
}
