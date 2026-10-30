import type {
  ReelLikeState,
  ReelPage,
  ViewerReel,
} from '@/features/reels/types';
import apiClient from '@/shared/api/api';

const pageParams = (cursor?: string, limit?: number) => ({
  ...(cursor ? { cursor } : {}),
  ...(limit ? { limit } : {}),
});

export const reelsService = {
  /** Whether reels are on for this caller (the server's hidden switch). */
  getAvailability: async (): Promise<boolean> => {
    const response = await apiClient.get<{ enabled: boolean }>(
      '/reels/availability',
    );
    return response.data.enabled;
  },

  /** One page of the main feed; pass the previous page's nextCursor. */
  getFeed: async (cursor?: string, limit?: number): Promise<ReelPage> => {
    const response = await apiClient.get<ReelPage>('/reels/feed', {
      params: pageParams(cursor, limit),
    });
    return response.data;
  },

  /** One company's or office's reels, as shown on its profile. */
  getByAuthor: async (
    identityId: string,
    cursor?: string,
    limit?: number,
  ): Promise<ReelPage> => {
    const response = await apiClient.get<ReelPage>(
      `/reels/authors/${identityId}`,
      { params: pageParams(cursor, limit) },
    );
    return response.data;
  },

  getOne: async (id: string): Promise<ViewerReel> => {
    const response = await apiClient.get<ViewerReel>(`/reels/${id}`);
    return response.data;
  },

  /** Records that the current profile watched these reels (repeat-safe). */
  recordViews: async (reelIds: string[]): Promise<void> => {
    await apiClient.post('/reels/views', { reelIds });
  },

  like: async (id: string): Promise<ReelLikeState> => {
    const response = await apiClient.put<ReelLikeState>(`/reels/${id}/like`);
    return response.data;
  },

  unlike: async (id: string): Promise<ReelLikeState> => {
    const response = await apiClient.delete<ReelLikeState>(`/reels/${id}/like`);
    return response.data;
  },

  /** Reports a reel (a report against its author). */
  report: async (
    id: string,
    reason: string,
    description?: string,
  ): Promise<void> => {
    await apiClient.post(`/reels/${id}/reports`, {
      reason,
      ...(description ? { description } : {}),
    });
  },

  /** Deletes one of the current profile's reels (repeat-safe). */
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/reels/${id}`);
  },
};
