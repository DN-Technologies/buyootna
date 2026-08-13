import { ApiProperty } from '@nestjs/swagger';

export class ReviewItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userName: string;

  @ApiProperty({ nullable: true })
  avatarUrl: string | null;

  @ApiProperty()
  timeAgo: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  rating: number;

  @ApiProperty({ nullable: true })
  comment: string | null;

  @ApiProperty()
  likes: number;

  @ApiProperty()
  dislikes: number;

  @ApiProperty()
  userLiked: boolean;

  @ApiProperty()
  userDisliked: boolean;
}

class ReviewListMetaDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class ReviewListResponseDto {
  @ApiProperty({ type: [ReviewItemDto] })
  data: ReviewItemDto[];

  @ApiProperty({ type: ReviewListMetaDto })
  meta: ReviewListMetaDto;
}

class RatingBreakdownDto {
  @ApiProperty()
  star: number;

  @ApiProperty()
  pct: string;
}

export class ReviewSummaryResponseDto {
  @ApiProperty()
  averageRating: number;

  @ApiProperty()
  totalRatingsCount: number;

  @ApiProperty({ type: [RatingBreakdownDto] })
  ratingBreakdown: RatingBreakdownDto[];
}

export class CreateReviewResponseDto {
  @ApiProperty()
  message: string;

  @ApiProperty({ type: 'object', additionalProperties: true })
  data: Record<string, unknown>;
}

export class ReviewMessageResponseDto {
  @ApiProperty()
  message: string;
}
