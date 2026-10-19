// The Stories API's shapes (apps/api/src/features/stories/dto)

export type StoryAuthorType = 'COMPANY' | 'OFFICE';

export interface StoryAuthor {
  identityId: string;
  type: StoryAuthorType;
  name: string;
  logoUrl: string | null;
  isVerified: boolean;
}

export interface StoryPropertyLink {
  id: string;
  type: string;
  category: string;
  location: string;
  coverUrl: string | null;
}

export interface ViewerStory {
  id: string;
  mediaType: 'IMAGE' | 'VIDEO';
  // Signed, short-lived (15 minutes at most)
  mediaUrl: string;
  posterUrl: string | null;
  urlExpiresAt: string;
  width: number | null;
  height: number | null;
  durationMs: number | null;
  caption: string | null;
  property: StoryPropertyLink | null;
  publishedAt: string;
  expiresAt: string;
  viewed: boolean;
}

export interface StoryAuthorStories {
  author: StoryAuthor;
  followed: boolean;
  hasUnseen: boolean;
  firstUnseenIndex: number;
  stories: ViewerStory[];
}

export interface FeedAuthor extends StoryAuthorStories {
  latestPublishedAt: string;
}

export interface StoryFeedPage {
  snapshotAt: string;
  authors: FeedAuthor[];
  nextCursor: string | null;
}
