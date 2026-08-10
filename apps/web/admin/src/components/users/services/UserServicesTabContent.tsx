'use client'

import { useState } from 'react'
import { Headphones } from 'lucide-react'
import UserServiceCard, { ServiceItem } from './UserServiceCard'
import ServiceActionModal, { ServiceActionMode } from './ServiceActionModal'
import ServiceDetailDrawer from './ServiceDetailDrawer'

const INITIAL_SERVICES: ServiceItem[] = [
  {
    id: 'SRV-001',
    title: 'تصميم داخلي',
    description: 'تصميم وتنفيذ الديكورات الداخلية لأي مكان بأعلى جودة.',
    status: 'active',
    category: 'تنفيذ وتصميم',
    ordersCount: 2,
    reportsCount: 1,
  },
  {
    id: 'SRV-002',
    title: 'الأثاث',
    description: 'أثاث منزلي ومكتبي بجودة عالية.',
    status: 'active',
    category: 'تنفيذ وتصميم',
    ordersCount: 2,
    reportsCount: 1,
  },
  {
    id: 'SRV-003',
    title: 'تصميم داخلي',
    description: 'تصميم وتنفيذ الديكورات الداخلية لأي مكان بأعلى جودة.',
    status: 'deleted',
    category: 'تنفيذ وتصميم',
    ordersCount: 2,
    reportsCount: 1,
  },
  {
    id: 'SRV-004',
    title: 'الأثاث',
    description: 'أثاث منزلي ومكتبي بجودة عالية.',
    status: 'hidden',
    category: 'تنفيذ وتصميم',
    ordersCount: 2,
    reportsCount: 1,
  },
  {
    id: 'SRV-005',
    title: 'تصميم داخلي',
    description: 'تصميم وتنفيذ الديكورات الداخلية لأي مكان بأعلى جودة.',
    status: 'hidden',
    category: 'تنفيذ وتصميم',
    ordersCount: 2,
    reportsCount: 1,
  },
  {
    id: 'SRV-006',
    title: 'تصميم داخلي',
    description: 'تصميم وتنفيذ الديكورات الداخلية لأي مكان بأعلى جودة.',
    status: 'deleted',
    category: 'تنفيذ وتصميم',
    ordersCount: 2,
    reportsCount: 1,
  },
]

export default function UserServicesTabContent() {
  const [services, setServices] = useState<ServiceItem[]>(INITIAL_SERVICES)
  const [selectedDetailService, setSelectedDetailService] =
    useState<ServiceItem | null>(null)
  const [activeModal, setActiveModal] = useState<{
    isOpen: boolean
    mode: ServiceActionMode
    service: ServiceItem | null
  }>({
    isOpen: false,
    mode: 'hide',
    service: null,
  })

  const handleOpenDetailDrawer = (service: ServiceItem) => {
    setSelectedDetailService(service)
  }

  const handleOpenHideOrRepublishModal = (service: ServiceItem) => {
    const mode: ServiceActionMode =
      service.status === 'hidden' ? 'republish' : 'hide'
    setActiveModal({
      isOpen: true,
      mode,
      service,
    })
  }

  const handleOpenDeleteModal = (service: ServiceItem) => {
    setActiveModal({
      isOpen: true,
      mode: 'delete',
      service,
    })
  }

  const handleModalSubmit = (data: {
    reason?: string
    notifyEmail: boolean
    notifyInApp: boolean
  }) => {
    const targetService = activeModal.service
    if (!targetService) return

    setServices((prev) =>
      prev.map((s) => {
        if (s.id !== targetService.id) return s
        if (activeModal.mode === 'delete') {
          return { ...s, status: 'deleted' }
        }
        if (activeModal.mode === 'hide') {
          return { ...s, status: 'hidden' }
        }
        if (activeModal.mode === 'republish') {
          return { ...s, status: 'active' }
        }
        return s
      }),
    )

    console.log('Action submitted:', {
      serviceId: targetService.id,
      mode: activeModal.mode,
      ...data,
    })

    setActiveModal({ isOpen: false, mode: 'hide', service: null })
  }

  return (
    <div className="w-full font-['Cairo']" dir="rtl">
      {services.length === 0 ? (
        /* Empty State */
        <div className="flex flex-col items-center justify-center text-center py-20 gap-3 bg-white border border-[#ECECEC] rounded-xl my-4">
          <div className="size-20 rounded-2xl bg-[#F8FAFC] border border-[#ECECEC] flex items-center justify-center text-primary">
            <Headphones className="w-10 h-10 stroke-[1.5]" />
          </div>
          <h3 className="font-bold text-[20px] text-[#111111] mt-2">
            لا توجد خدمات حتى الان
          </h3>
          <p className="text-[14px] text-[#6B6A6A] max-w-sm leading-relaxed">
            لا توجد خدمات حاليا، سوف تظهر الخدمات هنا فور اضافتها من المستخدم.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {services.map((service) => (
            <UserServiceCard
              key={service.id}
              service={service}
              onViewDetails={handleOpenDetailDrawer}
              onToggleHide={handleOpenHideOrRepublishModal}
              onDelete={handleOpenDeleteModal}
            />
          ))}
        </div>
      )}

      {/* Detail Drawer */}
      {selectedDetailService && (
        <ServiceDetailDrawer
          open={Boolean(selectedDetailService)}
          service={selectedDetailService}
          onClose={() => setSelectedDetailService(null)}
          onHideService={handleOpenHideOrRepublishModal}
          onDeleteService={handleOpenDeleteModal}
        />
      )}

      {/* Action Modal */}
      {activeModal.isOpen && activeModal.service && (
        <ServiceActionModal
          isOpen={activeModal.isOpen}
          mode={activeModal.mode}
          serviceTitle={activeModal.service.title}
          onClose={() =>
            setActiveModal({ isOpen: false, mode: 'hide', service: null })
          }
          onSubmit={handleModalSubmit}
        />
      )}
    </div>
  )
}
