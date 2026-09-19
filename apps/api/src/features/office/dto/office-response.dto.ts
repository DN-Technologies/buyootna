import { ApiProperty } from '@nestjs/swagger';
import { UserSafeDto } from '../../users/dto/user-response.dto';

class OfficeProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  services: string | null;

  @ApiProperty({ nullable: true })
  hqLocation: string | null;

  @ApiProperty({ nullable: true })
  about: string | null;

  @ApiProperty({ nullable: true })
  logoUrl: string | null;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  status: string;
}

export class RegisterOfficeResponseDto {
  @ApiProperty({ type: UserSafeDto })
  user: UserSafeDto;

  @ApiProperty({ type: OfficeProfileDto })
  profile: OfficeProfileDto;
}

class DirectoryListMetaDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  current: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasNextPage: boolean;
}

export class OfficeListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  logoUrl: string | null;

  @ApiProperty()
  isVerified: boolean;
}

export class OfficeListResponseDto {
  @ApiProperty({ type: [OfficeListItemDto] })
  data: OfficeListItemDto[];

  @ApiProperty({ type: DirectoryListMetaDto })
  meta: DirectoryListMetaDto;
}

export class OfficeDetailsResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  logoUrl: string | null;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  isActiveNow: boolean;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  reviewsCount: number;

  @ApiProperty({ nullable: true })
  bio: string | null;

  @ApiProperty({ nullable: true })
  location: string | null;

  @ApiProperty()
  licenseNumber: string;

  @ApiProperty()
  listingsCount: number;

  @ApiProperty()
  servicesCount: number;

  @ApiProperty({ nullable: true })
  phone?: string | null;

  @ApiProperty({ nullable: true })
  whatsapp?: string | null;

  @ApiProperty({ type: [String] })
  services: string[];

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  properties: Record<string, unknown>[];
}
