import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { companyService, type ServicesUpdate } from '@/shared/api/company.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

/**
 * الخدمات's changes. Each refreshes the list and the profile (which carries
 * the services' names), as adding and deleting did before.
 */
export function useServicesActions() {
  const queryClient = useQueryClient();
  const refreshProfile = useAuthStore((state) => state.refreshProfile);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['companyServices'] });
    refreshProfile();
  }, [queryClient, refreshProfile]);

  const setServiceHidden = useCallback(
    async (id: string, isHidden: boolean) => {
      await companyService.setServiceHidden(id, isHidden);
      await refresh();
    },
    [refresh],
  );

  const updateServices = useCallback(
    async (patch: ServicesUpdate) => {
      await companyService.updateServices(patch);
      await refresh();
    },
    [refresh],
  );

  const deleteService = useCallback(
    async (id: string) => {
      await companyService.deleteService(id);
      await refresh();
    },
    [refresh],
  );

  const deleteAll = useCallback(async () => {
    await companyService.deleteAllServices();
    await refresh();
  }, [refresh]);

  return { refresh, setServiceHidden, updateServices, deleteService, deleteAll };
}
