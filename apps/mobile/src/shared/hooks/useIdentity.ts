import { useCallback, useMemo } from 'react';

import {
  getIdentityAvatarUrl,
  getIdentityDisplayName,
  Identity,
  IdentityType,
  isVerifiedIdentity,
  useAuthStore,
} from '@/shared/store/useAuthStore';

export function useIdentity() {
  const {
    activeIdentity,
    identities,
    switchIdentity,
    addIdentity,
    removeIdentity,
    updateActiveIdentity,
  } = useAuthStore();

  // Computed values
  const displayName = useMemo(
    () => getIdentityDisplayName(activeIdentity),
    [activeIdentity]
  );

  const avatarUrl = useMemo(
    () => getIdentityAvatarUrl(activeIdentity),
    [activeIdentity]
  );

  const isVerified = useMemo(
    () => isVerifiedIdentity(activeIdentity),
    [activeIdentity]
  );

  // Type checks
  const isIndividual = activeIdentity?.type === 'INDIVIDUAL';
  const isCompany = activeIdentity?.type === 'COMPANY';
  const isOffice = activeIdentity?.type === 'OFFICE';
  const isBusiness = isCompany || isOffice;

  // Identity counts by type
  const identityCounts = useMemo(() => {
    const counts = {
      individual: 0,
      company: 0,
      office: 0,
      total: identities.length,
    };

    identities.forEach((identity) => {
      switch (identity.type) {
        case 'INDIVIDUAL':
          counts.individual++;
          break;
        case 'COMPANY':
          counts.company++;
          break;
        case 'OFFICE':
          counts.office++;
          break;
      }
    });

    return counts;
  }, [identities]);

  // Check if user can create more identities of a specific type
  const canCreateIdentity = useCallback(
    (type: IdentityType) => {
      // Individual identity is limited to 1
      if (type === 'INDIVIDUAL' && identityCounts.individual >= 1) {
        return false;
      }
      // No limit on company/office identities for now
      return true;
    },
    [identityCounts]
  );

  // Get identities grouped by type
  const identitiesByType = useMemo(() => {
    const grouped: Record<IdentityType, Identity[]> = {
      INDIVIDUAL: [],
      COMPANY: [],
      OFFICE: [],
    };

    identities.forEach((identity) => {
      grouped[identity.type].push(identity);
    });

    return grouped;
  }, [identities]);

  // Get identity display name helper
  const getDisplayName = useCallback(
    (identity: Identity) => getIdentityDisplayName(identity),
    []
  );

  // Get identity avatar URL helper
  const getAvatarUrl = useCallback(
    (identity: Identity) => getIdentityAvatarUrl(identity),
    []
  );

  // Get identity type label in Arabic
  const getTypeLabel = useCallback((type: IdentityType) => {
    switch (type) {
      case 'INDIVIDUAL':
        return 'فرد';
      case 'COMPANY':
        return 'شركة';
      case 'OFFICE':
        return 'مكتب';
      default:
        return '';
    }
  }, []);

  // Get identity type badge color
  const getTypeBadgeColor = useCallback((type: IdentityType) => {
    switch (type) {
      case 'INDIVIDUAL':
        return '#6B7280'; // gray
      case 'COMPANY':
        return '#2563EB'; // blue
      case 'OFFICE':
        return '#059669'; // green
      default:
        return '#6B7280';
    }
  }, []);

  return {
    // State
    activeIdentity,
    identities,
    displayName,
    avatarUrl,
    isVerified,

    // Type checks
    isIndividual,
    isCompany,
    isOffice,
    isBusiness,

    // Counts
    identityCounts,
    hasMultipleIdentities: identities.length > 1,

    // Grouped identities
    identitiesByType,

    // Actions
    switchIdentity,
    addIdentity,
    removeIdentity,
    updateActiveIdentity,
    canCreateIdentity,

    // Helpers
    getDisplayName,
    getAvatarUrl,
    getTypeLabel,
    getTypeBadgeColor,
  };
}
