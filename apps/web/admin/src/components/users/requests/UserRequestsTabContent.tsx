'use client'

import { useState } from 'react'
import type { RequestItem } from './requests.types'
import { MOCK_REQUESTS } from './requests.data'
import IndividualRequestsView from './IndividualRequestsView'
import CompanyRequestsView from './CompanyRequestsView'
import RequestDetailSheet from './RequestDetailSheet'

export type { RequestItem, UserRequestItem } from './requests.types'

export interface UserRequestsTabContentProps {
  userRole?: string
}

export default function UserRequestsTabContent({
  userRole = 'COMPANY',
}: UserRequestsTabContentProps) {
  const [requests] = useState<RequestItem[]>(MOCK_REQUESTS)
  const [selectedDetailRequest, setSelectedDetailRequest] =
    useState<RequestItem | null>(null)

  const isIndividual = userRole === 'INDIVIDUAL'

  return (
    <div className="w-full font-['Cairo'] text-right" dir="rtl">
      {isIndividual ? (
        <IndividualRequestsView
          requests={requests}
          onSelectRequest={setSelectedDetailRequest}
        />
      ) : (
        <CompanyRequestsView
          requests={requests}
          onSelectRequest={setSelectedDetailRequest}
        />
      )}

      {/* Request Detail Sheet Drawer */}
      {selectedDetailRequest && (
        <RequestDetailSheet
          request={selectedDetailRequest}
          onClose={() => setSelectedDetailRequest(null)}
        />
      )}
    </div>
  )
}
