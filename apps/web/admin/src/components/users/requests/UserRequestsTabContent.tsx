'use client'

import { useCallback, useEffect, useState } from 'react'
import type { RequestItem } from './requests.types'
import IndividualRequestsView from './IndividualRequestsView'
import CompanyRequestsView from './CompanyRequestsView'
import RequestDetailSheet from './RequestDetailSheet'
import { AdminRequestRow, fetchUserRequests } from '@/lib/admin-requests'
import { REQUEST_TYPE_LABEL } from '@/lib/request-labels'
import { formatArabicDate } from '@/lib/property-labels'

export type { RequestItem, UserRequestItem } from './requests.types'

function toRequestItem(row: AdminRequestRow): RequestItem {
  return {
    id: row.id,
    code: row.requestNumber,
    title: row.title,
    type: REQUEST_TYPE_LABEL[row.scope],
    clientName: row.clientName,
    submitter: row.clientName,
    status: row.status,
    date: formatArabicDate(row.createdAt),
    // No multi-offer entity exists on CompanyRequest -- it's a 1:1 relation,
    // so there's no real "number of offers" to show.
    offersCount: undefined,
    description: row.description,
    location: row.location,
    priceRange: row.priceRange,
    serviceType: row.category,
    images: row.images,
    client: {
      name: row.client.name,
      joinedDateLabel: formatArabicDate(row.client.joinedDate),
      previousOffers: row.client.previousOffers,
      rating: row.client.rating,
      avatarUrl: row.client.avatarUrl,
      phone: row.client.phone,
      whatsapp: row.client.whatsapp,
    },
  }
}

export interface UserRequestsTabContentProps {
  userId: string
  userRole?: string
}

export default function UserRequestsTabContent({
  userId,
  userRole = 'COMPANY',
}: UserRequestsTabContentProps) {
  const [requests, setRequests] = useState<RequestItem[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDetailRequest, setSelectedDetailRequest] =
    useState<RequestItem | null>(null)

  const isIndividual = userRole === 'INDIVIDUAL'

  const loadRequests = useCallback(async () => {
    try {
      setLoading(true)
      const rows = await fetchUserRequests(userId)
      setRequests(rows.map(toRequestItem))
    } catch (err) {
      console.error('Failed to load user requests:', err)
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => {
    loadRequests()
  }, [loadRequests])

  if (loading) {
    return (
      <div className="w-full py-16 text-center text-[#6B6A6A] font-['Cairo']">
        جاري التحميل...
      </div>
    )
  }

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
