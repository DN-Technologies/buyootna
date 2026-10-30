import { ApiProperty } from '@nestjs/swagger';

export class ReelAvailabilityDto {
  @ApiProperty({ description: 'Whether reels are on for this caller' })
  enabled: boolean;
}

export class ReelUploadTargetDto {
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

export class ReelUploadSlotDto {
  @ApiProperty()
  reelId: string;

  @ApiProperty({ description: 'When the upload URLs stop working' })
  uploadUrlExpiresAt: string;

  @ApiProperty({ description: 'Publish before this, or the slot is abandoned' })
  publishBefore: string;

  @ApiProperty({ type: ReelUploadTargetDto })
  media: ReelUploadTargetDto;

  @ApiProperty({ type: ReelUploadTargetDto })
  poster: ReelUploadTargetDto;
}

export class ReelPropertyLinkDto {
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

/** A published reel as its author sees it. */
export class AuthorReelDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ description: 'Stable public link' })
  mediaUrl: string;

  @ApiProperty({ description: 'Stable public link' })
  posterUrl: string;

  @ApiProperty({ nullable: true })
  width: number | null;

  @ApiProperty({ nullable: true })
  height: number | null;

  @ApiProperty({ nullable: true })
  durationMs: number | null;

  @ApiProperty({ nullable: true })
  caption: string | null;

  @ApiProperty({
    type: ReelPropertyLinkDto,
    nullable: true,
    description: 'Only while the listing can be shown to the public',
  })
  property: ReelPropertyLinkDto | null;

  @ApiProperty()
  publishedAt: string;

  @ApiProperty()
  viewCount: number;

  @ApiProperty()
  likeCount: number;
}
