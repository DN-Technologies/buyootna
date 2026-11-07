import { useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuthStore } from '@/shared/store/useAuthStore';

import { MyVerification, verificationService } from './verification.service';

/** What the card's second button shows. */
export type VerificationState =
  | 'none'
  | 'pending'
  | 'changes-requested'
  | 'verified';

export const verificationQueryKey = (identityId?: string) => [
  'company-verification',
  identityId,
];

export function verificationStateOf(
  data: MyVerification | undefined,
): VerificationState {
  if (data?.isVerified) return 'verified';
  switch (data?.request?.status) {
    case 'PENDING':
      return 'pending';
    case 'CHANGES_REQUESTED':
      return 'changes-requested';
    default:
      return 'none';
  }
}

/** The active company's «طلب التوثيق» and the badge. */
export function useCompanyVerification() {
  const activeIdentity = useAuthStore((state) => state.activeIdentity);
  const identityId =
    activeIdentity?.type === 'COMPANY' ? activeIdentity.id : undefined;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: verificationQueryKey(identityId),
    queryFn: () => verificationService.get(String(identityId)),
    enabled: Boolean(identityId),
  });

  return {
    identityId,
    data: query.data,
    request: query.data?.request ?? null,
    state: verificationStateOf(query.data),
    isLoading: query.isLoading,
    refetch: query.refetch,
    invalidate: () =>
      queryClient.invalidateQueries({
        queryKey: verificationQueryKey(identityId),
      }),
  };
}
