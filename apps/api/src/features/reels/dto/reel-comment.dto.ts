import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsNotEmpty, IsString, MaxLength } from 'class-validator';

import { REEL_COMMENT_MAX } from '../reels.constants';

export class CreateReelCommentDto {
  @ApiProperty({ maxLength: REEL_COMMENT_MAX })
  @Transform(({ value }: { value: unknown }) =>
    typeof value === 'string' ? value.trim() : value,
  )
  @IsString()
  @IsNotEmpty({ message: 'اكتب تعليقاً' })
  @MaxLength(REEL_COMMENT_MAX, { message: 'التعليق لا يتجاوز 500 حرف' })
  body: string;
}

export class UpdateReelDto {
  @ApiProperty({ description: 'Whether people can see and add comments' })
  @IsBoolean()
  commentsEnabled: boolean;
}

export class ReelCommentAuthorDto {
  @ApiProperty()
  identityId: string;

  @ApiProperty({ enum: ['INDIVIDUAL', 'COMPANY', 'OFFICE'] })
  type: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  avatarUrl: string | null;

  @ApiProperty()
  isVerified: boolean;
}

export class ReelCommentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  body: string;

  @ApiProperty()
  createdAt: string;

  @ApiProperty({ type: ReelCommentAuthorDto })
  author: ReelCommentAuthorDto;

  @ApiProperty({
    description: "The caller's own comment, or on the caller's reel",
  })
  canDelete: boolean;

  @ApiProperty({ description: 'Written by the current profile' })
  mine: boolean;
}

export class ReelCommentsDto {
  @ApiProperty({ type: [ReelCommentDto] })
  comments: ReelCommentDto[];

  @ApiProperty({ type: String, nullable: true })
  nextCursor: string | null;
}
