import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
} from 'class-validator';

const LOG_LEVELS = [
  'log',
  'error',
  'warn',
  'debug',
  'verbose',
  'fatal',
] as const;

export class TestingMetricsQueryDto {
  @ApiPropertyOptional({
    default: 60,
    description: 'Minutes of traffic to sum (max 1440)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(5)
  @Max(1440)
  minutes?: number = 60;
}

export class TestingLogsQueryDto {
  @ApiPropertyOptional({ enum: LOG_LEVELS })
  @IsOptional()
  @IsIn(LOG_LEVELS)
  level?: (typeof LOG_LEVELS)[number];

  @ApiPropertyOptional({ description: 'The logger context, e.g. AuthService' })
  @IsOptional()
  @IsString()
  @MaxLength(80)
  context?: string;

  @ApiPropertyOptional({ description: 'Text, or a request id' })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;

  @ApiPropertyOptional({
    description: 'Only entries newer than this id (tail mode)',
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  after?: number;

  @ApiPropertyOptional({ default: 200 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(500)
  limit?: number = 200;
}

export class TestingPageQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ default: 30 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 30;
}
