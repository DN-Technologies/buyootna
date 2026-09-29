import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  DocsCommentKind,
  DocsReleaseStatus,
  DocsResultStatus,
} from '@prisma/client';
import { Transform } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  MaxLength,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

// Screenshots are URLs returned by POST /qa-portal/attachments
class WithAttachments {
  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(6)
  @IsUrl({ protocols: ['https'], require_protocol: true }, { each: true })
  attachments?: string[];
}

export class CreateReleaseDto {
  @ApiProperty({ example: '1.4.0 OTA 2026-09-29' })
  @Transform(trim)
  @IsString()
  @Length(2, 80)
  name: string;

  @ApiPropertyOptional({ example: 'iOS + Android' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(60)
  platform?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class UpdateReleaseDto {
  @ApiPropertyOptional({ enum: DocsReleaseStatus })
  @IsOptional()
  @IsEnum(DocsReleaseStatus)
  status?: DocsReleaseStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @IsString()
  @Length(2, 80)
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  notes?: string;
}

export class RecordResultDto extends WithAttachments {
  @ApiProperty({ enum: DocsResultStatus })
  @IsEnum(DocsResultStatus)
  status: DocsResultStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(4000)
  note?: string;

  @ApiPropertyOptional({ example: 'https://github.com/…/issues/12' })
  @IsOptional()
  @IsUrl({ protocols: ['https', 'http'], require_protocol: true })
  @MaxLength(500)
  bugUrl?: string;
}

export class CreateCommentDto extends WithAttachments {
  @ApiProperty({ enum: DocsCommentKind, default: DocsCommentKind.COMMENT })
  @IsOptional()
  @IsEnum(DocsCommentKind)
  kind?: DocsCommentKind;

  @ApiProperty()
  @Transform(trim)
  @IsString()
  @Length(1, 4000)
  body: string;

  @ApiPropertyOptional({ description: 'Release the comment is about' })
  @IsOptional()
  @IsString()
  releaseId?: string;
}
