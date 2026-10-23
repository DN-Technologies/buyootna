import { useQueryClient } from '@tanstack/react-query';
import { useCallback } from 'react';

import { companyService, type ProjectUpdate } from '@/shared/api/company.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

/**
 * معرض الأعمال's changes. Each refreshes the list and the profile (whose
 * gallery shows the visible projects), as deleting did before.
 */
export function usePortfolioActions() {
  const queryClient = useQueryClient();
  const refreshProfile = useAuthStore((state) => state.refreshProfile);

  const refresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['companyProjects'] });
    refreshProfile();
  }, [queryClient, refreshProfile]);

  const updateProject = useCallback(
    async (id: string, patch: ProjectUpdate) => {
      await companyService.updateProject(id, patch);
      await refresh();
    },
    [refresh],
  );

  const setAllHidden = useCallback(
    async (isHidden: boolean) => {
      await companyService.setAllProjectsHidden(isHidden);
      await refresh();
    },
    [refresh],
  );

  const deleteProject = useCallback(
    async (id: string) => {
      await companyService.deleteProject(id);
      await refresh();
    },
    [refresh],
  );

  const deleteAll = useCallback(async () => {
    await companyService.deleteAllProjects();
    await refresh();
  }, [refresh]);

  return { updateProject, setAllHidden, deleteProject, deleteAll };
}
