import { useQuery } from '@tanstack/react-query';

import { reelsService } from '@/shared/api/reels.service';
import { useAuthStore } from '@/shared/store/useAuthStore';

// How many reels a row on the home or a profile shows
const RAIL_SIZE = 12;

/**
 * Every Reels query key starts with the active profile (null for a guest):
 * one profile's seen and liked state must never show for another.
 */
const useReelsKey = () => {
  const identityId = useAuthStore((s) => s.activeIdentity?.id ?? null);
  return ['reels', identityId] as const;
};

/**
 * The server's hidden switch. Off until it answers, and off on any error, so
 * reels never flash up for someone they're hidden from.
 */
export function useReelsAvailable(): boolean {
  const key = useReelsKey();
  const { data } = useQuery({
    queryKey: [...key, 'availability'],
    queryFn: reelsService.getAvailability,
    retry: false,
  });
  return data === true;
}

/** The start of the main feed, for the row on the home. */
export function useReelsRail(enabled: boolean) {
  const key = useReelsKey();
  return useQuery({
    queryKey: [...key, 'rail'],
    queryFn: () => reelsService.getFeed(undefined, RAIL_SIZE),
    enabled,
  });
}

/** The current profile's newest reels with their counts, for its studio. */
export function useMyReels(enabled: boolean) {
  const key = useReelsKey();
  return useQuery({
    queryKey: [...key, 'mine'],
    queryFn: () => reelsService.getMine(undefined, RAIL_SIZE),
    enabled,
  });
}

/** A company's or office's newest reels, for the row on its profile. */
export function useAuthorReelsRail(authorId: string | undefined, enabled: boolean) {
  const key = useReelsKey();
  return useQuery({
    queryKey: [...key, 'author', authorId],
    queryFn: () => reelsService.getByAuthor(authorId ?? '', undefined, RAIL_SIZE),
    enabled: enabled && !!authorId,
  });
}
