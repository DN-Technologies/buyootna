import type { CompanyRequestItem } from '@/features/company/components/requests/types';

export type MyRequestStatus = CompanyRequestItem['status'];

// Order of the عروضي status pills
export const MY_REQUEST_STATUSES: { id: MyRequestStatus; label: string }[] = [
  { id: 'pending', label: 'قيد الانتظار' },
  { id: 'responded', label: 'تم الرد' },
  { id: 'accepted', label: 'المقبولة' },
  { id: 'rejected', label: 'مرفوضة' },
];

export function countByStatus(
  requests: CompanyRequestItem[],
): Record<MyRequestStatus, number> {
  const counts: Record<MyRequestStatus, number> = {
    pending: 0,
    responded: 0,
    accepted: 0,
    rejected: 0,
  };
  for (const r of requests) if (r.status in counts) counts[r.status] += 1;
  return counts;
}

export function myRequestPills(requests: CompanyRequestItem[]) {
  const counts = countByStatus(requests);
  return MY_REQUEST_STATUSES.map(({ id, label }) => ({
    id,
    label: `${label} (${counts[id]})`,
  }));
}
