import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { TestingBugSeverity, TestingBugStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMaxSize,
  IsArray,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Length,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export const BUG_AREAS = [
  'app',
  'admin',
  'companies',
  'offices',
  'management',
  'landing',
  'api',
  'other',
] as const;

export class TestingCreateBugDto {
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @Length(3, 140)
  title: string;

  @ApiProperty({ enum: BUG_AREAS })
  @IsIn(BUG_AREAS)
  area: string;

  @ApiPropertyOptional({ enum: TestingBugSeverity })
  @IsOptional()
  @IsEnum(TestingBugSeverity)
  severity?: TestingBugSeverity;

  @ApiProperty({ description: 'How to make it happen, step by step' })
  @Transform(trim)
  @IsString()
  @Length(3, 4000)
  steps: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(2000)
  expected?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(2000)
  actual?: string;

  @ApiPropertyOptional({ example: 'ios' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  platform?: string;

  @ApiPropertyOptional({ example: 'iPhone 15 Pro, iOS 18.1' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  device?: string;

  @ApiPropertyOptional({ example: '1.7.0' })
  @IsOptional()
  @IsString()
  @MaxLength(40)
  appVersion?: string;

  @ApiPropertyOptional({
    type: [String],
    description: 'URLs from POST /bugs/attachments',
  })
  @IsOptional()
  @IsArray()
  @ArrayMaxSize(8)
  @IsUrl({ protocols: ['https', 'http'], require_tld: false }, { each: true })
  screenshots?: string[];
}

export class TestingUpdateBugDto {
  @ApiPropertyOptional({ enum: TestingBugStatus })
  @IsOptional()
  @IsEnum(TestingBugStatus)
  status?: TestingBugStatus;

  @ApiPropertyOptional({ enum: TestingBugSeverity })
  @IsOptional()
  @IsEnum(TestingBugSeverity)
  severity?: TestingBugSeverity;
}

export class TestingBugCommentDto {
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @Length(1, 2000)
  body: string;
}

export class TestingBugQueryDto {
  @ApiPropertyOptional({ enum: TestingBugStatus })
  @IsOptional()
  @IsEnum(TestingBugStatus)
  status?: TestingBugStatus;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(50)
  limit?: number = 20;
}
