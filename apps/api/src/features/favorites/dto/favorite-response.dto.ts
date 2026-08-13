import { ApiProperty } from '@nestjs/swagger';

export class FavoritePropertyHostDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  avatarUrl: string;

  @ApiProperty({ enum: ['INDIVIDUAL', 'COMPANY', 'OFFICE'] })
  role: string;
}

export class FavoritePropertyItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  type: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  isFeatured: boolean;

  @ApiProperty({ nullable: true })
  price: number | null;

  @ApiProperty()
  location: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  views: number;

  @ApiProperty()
  area: number;

  @ApiProperty()
  beds: number;

  @ApiProperty()
  baths: number;

  @ApiProperty({ nullable: true })
  floors: number | null;

  @ApiProperty({ type: FavoritePropertyHostDto })
  host: FavoritePropertyHostDto;
}

export class FavoritesListMetaDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  hasNextPage: boolean;
}

export class FavoritesListResponseDto {
  @ApiProperty({ type: [FavoritePropertyItemDto] })
  data: FavoritePropertyItemDto[];

  @ApiProperty({ type: FavoritesListMetaDto })
  meta: FavoritesListMetaDto;
}

export class ToggleFavoriteResponseDto {
  @ApiProperty()
  favorited: boolean;

  @ApiProperty()
  message: string;
}

export class CheckFavoriteResponseDto {
  @ApiProperty()
  isFavorited: boolean;
}

export class FavoriteIdsResponseDto {
  @ApiProperty({ type: [String] })
  ids: string[];
}
