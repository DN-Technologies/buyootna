import { ApiProperty } from '@nestjs/swagger';
import {
  ArrayMaxSize,
  ArrayNotEmpty,
  IsArray,
  IsIn,
  IsUUID,
} from 'class-validator';

export const BULK_PROPERTIES_MAX = 100;

export class BulkPropertiesDto {
  @ApiProperty({ enum: ['hide', 'show', 'delete'] })
  @IsIn(['hide', 'show', 'delete'])
  action: 'hide' | 'show' | 'delete';

  @ApiProperty({ type: [String], maxItems: BULK_PROPERTIES_MAX })
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMaxSize(BULK_PROPERTIES_MAX)
  @IsUUID('all', { each: true })
  ids: string[];
}

export class BulkPropertiesResponseDto {
  @ApiProperty({ description: 'How many of your ads were changed' })
  count: number;
}
