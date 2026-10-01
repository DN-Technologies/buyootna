import { useQuery, useQueryClient } from '@tanstack/react-query';

import {
  savedLocationsService,
  type SaveLocationPayload,
} from '@/shared/api/savedLocations.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

const KEY = ['saved-locations'];

/** The account's saved places; nothing for guests. */
export function useSavedPlaces() {
  const queryClient = useQueryClient();
  const isSignedIn = useAuthStore((state) => !!state.token);

  const query = useQuery({
    queryKey: KEY,
    queryFn: savedLocationsService.list,
    enabled: isSignedIn,
  });

  const save = async (payload: SaveLocationPayload) => {
    const saved = await savedLocationsService.save(payload);
    await queryClient.invalidateQueries({ queryKey: KEY });
    return saved;
  };

  const remove = async (id: string) => {
    await savedLocationsService.remove(id);
    await queryClient.invalidateQueries({ queryKey: KEY });
  };

  return {
    saved: isSignedIn ? (query.data ?? []) : [],
    canSave: isSignedIn,
    save,
    remove,
  };
}
