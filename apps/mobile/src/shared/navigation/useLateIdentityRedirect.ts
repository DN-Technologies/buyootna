import { useSegments } from 'expo-router';
import { useEffect, useRef } from 'react';

import { useAuthStore } from '@/shared/store/useAuthStore';

import { resetToIdentityHome } from './getIdentityHomeRoute';

/**
 * Launch picks the home from the active profile; when its profile request
 * fails (the API restarting, a dead network) there is none yet and the app
 * lands on the individual home. Once the profile does load as a company or
 * office, this moves to its home. Only that first unknown → known moment
 * counts: shared screens kept in the (individual) group (notifications)
 * stay reachable from a business profile, and a profile switch navigates
 * on its own.
 */
export function useLateIdentityRedirect() {
  const type = useAuthStore((s) => s.activeIdentity?.type);
  const segments = useSegments();
  const known = useRef(false);

  useEffect(() => {
    if (!type) {
      known.current = false;
      return;
    }
    if (known.current) return;
    known.current = true;
    const inIndividual = segments[0] === '(individual)';
    if (inIndividual && (type === 'COMPANY' || type === 'OFFICE')) {
      resetToIdentityHome(type);
    }
  }, [type, segments]);
}
