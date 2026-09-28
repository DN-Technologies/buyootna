import { ApiProperty } from '@nestjs/swagger';
import { ArrayMaxSize, IsArray, IsIn, IsString } from 'class-validator';

// Which favorites tab: saved ads, companies or offices
export const FAVORITE_TABS = ['properties', 'COMPANY', 'OFFICE'] as const;
export type FavoriteTab = (typeof FAVORITE_TABS)[number];

export class FavoriteTabQueryDto {
  @ApiProperty({ enum: FAVORITE_TABS })
  @IsIn(FAVORITE_TABS, { message: 'نوع المفضلة غير صالح' })
  type: FavoriteTab;
}

export class RestoreFavoritesDto {
  @ApiProperty({ enum: FAVORITE_TABS })
  @IsIn(FAVORITE_TABS, { message: 'نوع المفضلة غير صالح' })
  type: FavoriteTab;

  @ApiProperty({ type: [String], description: 'The ids "مسح الكل" returned' })
  @IsArray()
  @ArrayMaxSize(500)
  @IsString({ each: true })
  ids: string[];
}
