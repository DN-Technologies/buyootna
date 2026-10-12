import { ApiProperty } from '@nestjs/swagger';
import { UserSafeDto } from '../../users/dto/user-response.dto';

class CompanyProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  services: string | null;

  @ApiProperty({ nullable: true })
  hqLocation: string | null;

  @ApiProperty({ nullable: true })
  serviceAreas: string | null;

  @ApiProperty({ nullable: true })
  about: string | null;

  @ApiProperty({ nullable: true })
  logoUrl: string | null;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  status: string;
}

export class RegisterCompanyResponseDto {
  @ApiProperty({ type: UserSafeDto })
  user: UserSafeDto;

  @ApiProperty({ type: CompanyProfileDto })
  profile: CompanyProfileDto;
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

export class CompanyListItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  reviewsCount: number;

  @ApiProperty()
  projectsCount: string;

  @ApiProperty({ nullable: true })
  serviceArea: string | null;

  @ApiProperty({ nullable: true })
  logoUrl: string | null;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  lastActivityAt: string;
}

export class CompanyListResponseDto {
  @ApiProperty({ type: [CompanyListItemDto] })
  data: CompanyListItemDto[];

  @ApiProperty({ type: DirectoryListMetaDto })
  meta: DirectoryListMetaDto;
}

export class CompanyDetailsResponseDto {
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

  @ApiProperty({
    description: 'False while the company has no active subscription',
  })
  acceptsRequests: boolean;

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
  servicesCount: number;

  @ApiProperty()
  projectsCount: number;

  @ApiProperty({ nullable: true })
  phone?: string | null;

  @ApiProperty({ nullable: true })
  whatsapp?: string | null;

  @ApiProperty({ type: [String] })
  services: string[];

  @ApiProperty({ type: 'array', items: { type: 'object' } })
  projects: Record<string, unknown>[];
}
