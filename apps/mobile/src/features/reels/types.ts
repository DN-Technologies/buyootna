/** What the API answers for reels (apps/api/src/features/reels). */

export interface ReelAuthor {
  identityId: string;
  type: 'COMPANY' | 'OFFICE';
  name: string;
  logoUrl: string | null;
  isVerified: boolean;
  subtitle: string | null;
}

export interface ReelPropertyLink {
  id: string;
  type: string;
  category: string;
  location: string;
  coverUrl: string | null;
}

export interface AuthorReel {
  id: string;
  mediaUrl: string;
  posterUrl: string;
  width: number | null;
  height: number | null;
  durationMs: number | null;
  caption: string | null;
  property: ReelPropertyLink | null;
  publishedAt: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  commentsEnabled: boolean;
}

export interface ViewerReel extends AuthorReel {
  author: ReelAuthor;
  liked: boolean;
  viewed: boolean;
  followed: boolean;
}

export interface ReelPage {
  snapshotAt: string;
  reels: ViewerReel[];
  nextCursor: string | null;
}

/** What the main feed can be narrowed to, by the reel's listing. */
export interface ReelFilters {
  governorateId?: string;
  areaId?: string;
  listingType?: 'SALE' | 'RENT' | 'EXCHANGE';
}

export interface ReelLikeState {
  liked: boolean;
  likeCount: number;
}

export interface ReelComment {
  id: string;
  body: string;
  createdAt: string;
  author: {
    identityId: string;
    type: string;
    name: string;
    avatarUrl: string | null;
    isVerified: boolean;
  };
  // Written by the current profile
  mine: boolean;
  // Its own, or any on the current profile's reel
  canDelete: boolean;
}

export interface ReelCommentsPage {
  comments: ReelComment[];
  nextCursor: string | null;
}

export interface MyReelsPage {
  reels: AuthorReel[];
  nextCursor: string | null;
}

export interface ReelUploadTarget {
  method: 'PUT';
  url: string;
  headers: Record<string, string>;
}

export interface ReelUploadSlot {
  reelId: string;
  uploadUrlExpiresAt: string;
  publishBefore: string;
  media: ReelUploadTarget;
  poster: ReelUploadTarget;
}

/** What POST /reels/uploads is told about the files. */
export interface ReelUploadRequest {
  contentType: 'video/mp4';
  sizeBytes: number;
  poster: { contentType: 'image/jpeg'; sizeBytes: number };
}
