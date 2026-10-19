import type {
  StoryAuthorStories,
  StoryFeedPage,
} from '@/features/stories/types';
import apiClient from '@/shared/api/api';

export const storiesService = {
  /** One page of the stories feed; pass the previous page's nextCursor. */
  getFeed: async (cursor?: string): Promise<StoryFeedPage> => {
    const response = await apiClient.get<StoryFeedPage>('/stories/feed', {
      params: cursor ? { cursor } : {},
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
};
