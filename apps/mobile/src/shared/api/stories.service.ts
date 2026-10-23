import {
  createUploadTask,
  FileSystemUploadType,
} from 'expo-file-system/legacy';

import type {
  AuthorStory,
  MyStories,
  StoryAuthorStories,
  StoryAuthorType,
  StoryFeedPage,
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
