import { ApiProperty } from '@nestjs/swagger';
import { IdentityResponseDto } from '../../identities/dto/identity-response.dto';

/** Safe User projection — never includes `password`. */
export class UserSafeDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ nullable: true })
  email: string | null;

  @ApiProperty({ nullable: true })
  phone: string | null;

  @ApiProperty({ nullable: true })
  role?: string;

  @ApiProperty({ nullable: true })
  name?: string | null;

  @ApiProperty({ nullable: true })
  whatsapp?: string | null;

  @ApiProperty({ nullable: true })
  avatarUrl?: string | null;

  @ApiProperty({ required: false })
  freeAdsRemaining?: number;

  @ApiProperty()
  isDisabled: boolean;

  @ApiProperty()
  isAdmin: boolean;
}

class IndividualProfileDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}

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

export class RegisterIndividualResponseDto {
  @ApiProperty({ type: UserSafeDto })
  user: UserSafeDto;

  @ApiProperty({ type: IndividualProfileDto })
  profile: IndividualProfileDto;
}

export class RegisterCompanyResponseDto {
  @ApiProperty({ type: UserSafeDto })
  user: UserSafeDto;

  @ApiProperty({ type: CompanyProfileDto })
  profile: CompanyProfileDto;
}

export class RegisterOfficeResponseDto {
  @ApiProperty({ type: UserSafeDto })
  user: UserSafeDto;

  @ApiProperty({ type: OfficeProfileDto })
  profile: OfficeProfileDto;
}

export class UpdateProfileResponseDto {
  @ApiProperty({ type: UserSafeDto })
  user: UserSafeDto;

  @ApiProperty({
    description:
      'The updated profile data for the identity type being edited (individual/company/office fields vary)',
  })
  profile: Record<string, unknown>;
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

export class MeResponseDto {
  @ApiProperty({ type: UserSafeDto })
  user: UserSafeDto;

  @ApiProperty({ type: IdentityResponseDto, nullable: true })
  activeIdentity: IdentityResponseDto | null;

  @ApiProperty({ type: [IdentityResponseDto] })
  identities: IdentityResponseDto[];
}

export class FindUserResponseDto extends UserSafeDto {
  @ApiProperty({ type: [IdentityResponseDto] })
  identities: IdentityResponseDto[];
}

export class SimpleMessageResponseDto {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  message: string;
}
