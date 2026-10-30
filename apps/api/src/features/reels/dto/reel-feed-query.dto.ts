import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString, MaxLength } from 'class-validator';

import {
  REEL_FILTER_LISTING_TYPES,
  type ReelListingType,
} from '../reels.constants';
import { ReelListQueryDto } from './reel-list-query.dto';

/**
 * The main feed's page, narrowed by where the reel's listing is and what kind
 * of deal it is. Only a listing knows these, so a filter leaves out reels
 * with none.
 */
export class ReelFeedQueryDto extends ReelListQueryDto {
  @ApiPropertyOptional({ description: "The listing's governorate" })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  governorateId?: string;

  @ApiPropertyOptional({ description: "The listing's area" })
  @IsOptional()
  @IsString()
  @MaxLength(64)
  areaId?: string;

  @ApiPropertyOptional({ enum: REEL_FILTER_LISTING_TYPES })
  @IsOptional()
  @IsIn(REEL_FILTER_LISTING_TYPES)
  listingType?: ReelListingType;
}
