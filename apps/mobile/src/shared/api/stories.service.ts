import {
  createUploadTask,
  FileSystemUploadType,
} from 'expo-file-system/legacy';

import type {
  AuthorStory,
  MyStories,
  StoryArchivePage,
  StoryAuthorStories,
  StoryAuthorType,
  StoryFeedPage,
  StoryHighlight,
  StoryHighlightInput,
  StoryHighlights,
  StoryUploadRequest,
  StoryUploadSlot,
  StoryUploadTarget,
  StoryViewersPage,
} from '@/features/stories/types';
import apiClient from '@/shared/api/api';

export const storiesService = {
  /** One page of the stories feed; pass the previous page's nextCursor. */
  /** `type`: only companies («شركات») or offices («مكاتب عقارية») */
  getFeed: async (
    cursor?: string,
    type?: StoryAuthorType,
  ): Promise<StoryFeedPage> => {
    const response = await apiClient.get<StoryFeedPage>('/stories/feed', {
      params: { ...(cursor ? { cursor } : {}), ...(type ? { type } : {}) },
    });
    return response.data;
  },

  /** One company's or office's live stories. */
  getByAuthor: async (identityId: string): Promise<StoryAuthorStories> => {
    const response = await apiClient.get<StoryAuthorStories>(
      `/stories/authors/${identityId}`,
    );
    return response.data;
  },

  /** Records that the current profile watched these stories (repeat-safe). */
  recordViews: async (storyIds: string[]): Promise<void> => {
    await apiClient.post('/stories/views', { storyIds });
  },

  /** Reports a story (a report against its author). */
  report: async (
    storyId: string,
    reason: string,
    description?: string,
  ): Promise<void> => {
    await apiClient.post(`/stories/${storyId}/reports`, {
      reason,
      ...(description ? { description } : {}),
    });
  },

  /** An upload slot for a photo of exactly `sizeBytes`. */
  createUpload: async (request: StoryUploadRequest): Promise<StoryUploadSlot> => {
    const response = await apiClient.post<StoryUploadSlot>(
      '/stories/uploads',
      request,
    );
    return response.data;
  },

  /**
   * PUTs the file straight to S3 with exactly the signed headers (a binary
   * body, not multipart). Resolves with the HTTP status.
   */
  uploadToSlot: async (
    target: StoryUploadTarget,
    fileUri: string,
    onProgress?: (fraction: number) => void,
  ): Promise<number> => {
    const task = createUploadTask(
      target.url,
      fileUri,
      {
        httpMethod: target.method,
        uploadType: FileSystemUploadType.BINARY_CONTENT,
        headers: target.headers,
      },
      ({ totalBytesSent, totalBytesExpectedToSend }) => {
        if (totalBytesExpectedToSend > 0) {
          onProgress?.(totalBytesSent / totalBytesExpectedToSend);
        }
      },
    );
    const result = await task.uploadAsync();
    return result?.status ?? 0;
  },

  /** Publishes an uploaded story once the server has checked the file. */
  publish: async (
    storyId: string,
    body: { caption?: string; propertyId?: string },
  ): Promise<AuthorStory> => {
    const response = await apiClient.post<AuthorStory>(
      `/stories/${storyId}/publish`,
      body,
    );
    return response.data;
  },

  /** The current profile's live stories, with view counts. */
  getMine: async (): Promise<MyStories> => {
    const response = await apiClient.get<MyStories>('/stories/me');
    return response.data;
  },

  /** Deletes one of the current profile's stories (repeat-safe). */
  remove: async (storyId: string): Promise<void> => {
    await apiClient.delete(`/stories/${storyId}`);
  },

  /** The current profile's stories of the last 30 days (its archive). */
  getArchive: async (cursor?: string): Promise<StoryArchivePage> => {
    const response = await apiClient.get<StoryArchivePage>(
      '/stories/me/archive',
      { params: cursor ? { cursor } : {} },
    );
    return response.data;
  },

  /** The current profile's highlights, empty ones too. */
  getMyHighlights: async (): Promise<StoryHighlights> => {
    const response = await apiClient.get<StoryHighlights>(
      '/stories/me/highlights',
    );
    return response.data;
  },

  /** A company's or office's highlights as shown on its profile. */
  getAuthorHighlights: async (identityId: string): Promise<StoryHighlights> => {
    const response = await apiClient.get<StoryHighlights>(
      `/stories/authors/${identityId}/highlights`,
    );
    return response.data;
  },

  createHighlight: async (
    input: Required<Pick<StoryHighlightInput, 'title' | 'storyIds'>>,
  ): Promise<StoryHighlight> => {
    const response = await apiClient.post<StoryHighlight>(
      '/stories/highlights',
      input,
    );
    return response.data;
  },

  updateHighlight: async (
    id: string,
    input: StoryHighlightInput,
  ): Promise<StoryHighlight> => {
    const response = await apiClient.patch<StoryHighlight>(
      `/stories/highlights/${id}`,
      input,
    );
    return response.data;
  },

  removeHighlight: async (id: string): Promise<void> => {
    await apiClient.delete(`/stories/highlights/${id}`);
  },

  /** Every one of the profile's highlights, in their new order. */
  reorderHighlights: async (ids: string[]): Promise<void> => {
    await apiClient.put('/stories/highlights/order', { ids });
  },

  /** Who viewed one of the current profile's stories, newest first. */
  getViewers: async (
    storyId: string,
    cursor?: string,
  ): Promise<StoryViewersPage> => {
    const response = await apiClient.get<StoryViewersPage>(
      `/stories/${storyId}/viewers`,
      { params: cursor ? { cursor } : {} },
    );
    return response.data;
  },
};
