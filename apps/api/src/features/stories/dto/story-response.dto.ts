import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class StoryUploadTargetDto {
  @ApiProperty({ enum: ['PUT'] })
  method: 'PUT';

  @ApiProperty({ description: 'Presigned S3 URL (short-lived)' })
  url: string;

  @ApiProperty({
    description: 'Send exactly these headers; they are part of the signature',
    type: 'object',
    additionalProperties: { type: 'string' },
  })
  headers: Record<string, string>;
}

export class StoryUploadSlotDto {
  @ApiProperty()
  storyId: string;

  @ApiProperty({ description: 'When the upload URL stops working' })
  uploadUrlExpiresAt: string;

  @ApiProperty({ description: 'Publish before this, or the slot is abandoned' })
  publishBefore: string;

  @ApiProperty({ type: StoryUploadTargetDto })
  media: StoryUploadTargetDto;

  @ApiPropertyOptional({
    type: StoryUploadTargetDto,
    description: 'Video only: where the poster goes',
  })
  poster?: StoryUploadTargetDto;
}

export class StoryPropertyLinkDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  location: string;

  @ApiProperty({ nullable: true })
  coverUrl: string | null;
}

export class StoryAuthorDto {
  @ApiProperty()
  identityId: string;

  @ApiProperty({ enum: ['COMPANY', 'OFFICE'] })
  type: 'COMPANY' | 'OFFICE';

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  logoUrl: string | null;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty({
    nullable: true,
    description: "A company's specialty, or «مكتب عقاري» for an office",
  })
  subtitle: string | null;
}

export class ViewerStoryDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ['IMAGE', 'VIDEO'] })
  mediaType: 'IMAGE' | 'VIDEO';

  @ApiProperty({ description: 'Signed, short-lived link' })
  mediaUrl: string;

  @ApiProperty({ nullable: true })
  posterUrl: string | null;

  @ApiProperty({ description: 'When mediaUrl / posterUrl stop working' })
  urlExpiresAt: string;

  @ApiProperty({ nullable: true })
  width: number | null;

  @ApiProperty({ nullable: true })
  height: number | null;

  @ApiProperty({ nullable: true })
  durationMs: number | null;

  @ApiProperty({ nullable: true })
  caption: string | null;

  @ApiProperty({ type: StoryPropertyLinkDto, nullable: true })
  property: StoryPropertyLinkDto | null;

  @ApiProperty()
  publishedAt: string;

  @ApiProperty()
  expiresAt: string;

  @ApiProperty({ description: 'The viewing profile has seen it' })
  viewed: boolean;
}

export class AuthorStoryDto extends ViewerStoryDto {
  @ApiProperty({
    description: 'Distinct viewer profiles (recorded from phase 2)',
  })
  viewCount: number;
}

export class StoryAuthorStoriesDto {
  @ApiProperty({ type: StoryAuthorDto })
  author: StoryAuthorDto;

  @ApiProperty()
  followed: boolean;

  @ApiProperty()
  hasUnseen: boolean;

  @ApiProperty({ description: 'Open the viewer here (0 when all are seen)' })
  firstUnseenIndex: number;

  @ApiProperty({ type: [ViewerStoryDto], description: 'Oldest first' })
  stories: ViewerStoryDto[];
}

export class FeedAuthorDto extends StoryAuthorStoriesDto {
  @ApiProperty()
  latestPublishedAt: string;
}

export class StoryFeedDto {
  @ApiProperty({
    description:
      'Shared by every page of one scroll: "seen" is judged as of this time',
  })
  snapshotAt: string;

  @ApiProperty({ type: [FeedAuthorDto] })
  authors: FeedAuthorDto[];

  @ApiPropertyOptional({ nullable: true })
  nextCursor: string | null;
}

export class MyStoriesDto {
  @ApiProperty({ type: [AuthorStoryDto] })
  stories: AuthorStoryDto[];
}

export class StoryViewerDto {
  @ApiProperty()
  identityId: string;

  @ApiProperty({ enum: ['INDIVIDUAL', 'COMPANY', 'OFFICE'] })
  type: 'INDIVIDUAL' | 'COMPANY' | 'OFFICE';

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  avatarUrl: string | null;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty({ description: 'When this profile first viewed the story' })
  viewedAt: string;
}

export class StoryViewersDto {
  @ApiProperty({
    description:
      'Distinct viewer profiles, without disabled or blocked accounts',
  })
  total: number;

  @ApiProperty({ type: [StoryViewerDto], description: 'Newest first' })
  viewers: StoryViewerDto[];

  @ApiPropertyOptional({ nullable: true })
  nextCursor: string | null;
}
