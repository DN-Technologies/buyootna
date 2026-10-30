import type { ReelWatch } from '@/features/reels/reelWatchQueue';
import type {
  AuthorReel,
  MyReelsPage,
  ReelComment,
  ReelCommentsPage,
  ReelFilters,
  ReelLikeState,
  ReelPage,
  ReelUploadRequest,
  ReelUploadSlot,
  ViewerReel,
} from '@/features/reels/types';
import apiClient from '@/shared/api/api';
import { storiesService } from '@/shared/api/stories.service';

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
  getFeed: async (
    cursor?: string,
    limit?: number,
    filters?: ReelFilters,
  ): Promise<ReelPage> => {
    const response = await apiClient.get<ReelPage>('/reels/feed', {
      params: { ...pageParams(cursor, limit), ...filters },
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

  /** How much of each reel was watched, for ranking (keeps the highest). */
  recordWatches: async (watches: ReelWatch[]): Promise<void> => {
    await apiClient.post('/reels/watches', { watches });
  },

  like: async (id: string): Promise<ReelLikeState> => {
    const response = await apiClient.put<ReelLikeState>(`/reels/${id}/like`);
    return response.data;
  },

  unlike: async (id: string): Promise<ReelLikeState> => {
    const response = await apiClient.delete<ReelLikeState>(`/reels/${id}/like`);
    return response.data;
  },

  getComments: async (id: string, cursor?: string): Promise<ReelCommentsPage> => {
    const response = await apiClient.get<ReelCommentsPage>(
      `/reels/${id}/comments`,
      { params: pageParams(cursor) },
    );
    return response.data;
  },

  addComment: async (id: string, body: string): Promise<ReelComment> => {
    const response = await apiClient.post<ReelComment>(
      `/reels/${id}/comments`,
      { body },
    );
    return response.data;
  },

  /** Your own, or any on your reel (repeat-safe). */
  removeComment: async (commentId: string): Promise<void> => {
    await apiClient.delete(`/reels/comments/${commentId}`);
  },

  /** Reports a comment (a report against its author). */
  reportComment: async (
    commentId: string,
    reason: string,
    description?: string,
  ): Promise<void> => {
    await apiClient.post(`/reels/comments/${commentId}/reports`, {
      reason,
      ...(description ? { description } : {}),
    });
  },

  /** The author turns comments on or off for its reel. */
  setCommentsEnabled: async (
    id: string,
    commentsEnabled: boolean,
  ): Promise<void> => {
    await apiClient.patch(`/reels/${id}`, { commentsEnabled });
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

  /** The current profile's published reels, with their counts. */
  getMine: async (cursor?: string, limit?: number): Promise<MyReelsPage> => {
    const response = await apiClient.get<MyReelsPage>('/reels/me', {
      params: pageParams(cursor, limit),
    });
    return response.data;
  },

  /** An upload slot for a video of exactly `sizeBytes`, and its poster. */
  createUpload: async (request: ReelUploadRequest): Promise<ReelUploadSlot> => {
    const response = await apiClient.post<ReelUploadSlot>(
      '/reels/uploads',
      request,
    );
    return response.data;
  },

  /** PUTs a file straight to S3, the same way a story's file goes. */
  uploadToSlot: storiesService.uploadToSlot,

  /** Publishes an uploaded reel once the server has checked the file. */
  publish: async (
    id: string,
    body: { caption?: string; propertyId?: string },
  ): Promise<AuthorReel> => {
    const response = await apiClient.post<AuthorReel>(
      `/reels/${id}/publish`,
      body,
    );
    return response.data;
  },

  /** Deletes one of the current profile's reels (repeat-safe). */
  remove: async (id: string): Promise<void> => {
    await apiClient.delete(`/reels/${id}`);
  },
};
