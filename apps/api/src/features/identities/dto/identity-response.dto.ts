import { ApiProperty } from '@nestjs/swagger';

export class IndividualDataDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ nullable: true })
  name: string | null;

  @ApiProperty({ nullable: true })
  whatsapp: string | null;

  @ApiProperty({ nullable: true })
  avatarUrl: string | null;
}

export class CompanyDataDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: [String] })
  services: string[];

  @ApiProperty({ nullable: true })
  hqLocation: string | null;

  @ApiProperty({ type: [String] })
  serviceAreas: string[];

  @ApiProperty({ nullable: true })
  about: string | null;

  @ApiProperty({ nullable: true })
  licenseActivity: string | null;

  @ApiProperty()
  licenseNumber: string;

  @ApiProperty({ nullable: true })
  licenseExpiry: Date | null;

  @ApiProperty({ nullable: true })
  logoUrl: string | null;

  @ApiProperty({ nullable: true })
  licenseFileUrl: string | null;

  @ApiProperty({ nullable: true })
  latitude: number | null;

  @ApiProperty({ nullable: true })
  longitude: number | null;

  @ApiProperty({ nullable: true })
  specialty: string | null;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  status: string;
}

export class OfficeDataDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ type: [String] })
  services: string[];

  @ApiProperty({ nullable: true })
  hqLocation: string | null;

  @ApiProperty({ nullable: true })
  about: string | null;

  @ApiProperty({ nullable: true })
  licenseActivity: string | null;

  @ApiProperty()
  licenseNumber: string;

  @ApiProperty({ nullable: true })
  licenseExpiry: Date | null;

  @ApiProperty({ nullable: true })
  logoUrl: string | null;

  @ApiProperty({ nullable: true })
  licenseFileUrl: string | null;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  status: string;
}

export class IdentityResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty({ enum: ['INDIVIDUAL', 'COMPANY', 'OFFICE'] })
  type: string;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: IndividualDataDto, nullable: true })
  individualData: IndividualDataDto | null;

  @ApiProperty({ type: CompanyDataDto, nullable: true })
  companyData: CompanyDataDto | null;

  @ApiProperty({ type: OfficeDataDto, nullable: true })
  officeData: OfficeDataDto | null;
}

export class DeleteIdentityResponseDto {
  @ApiProperty()
  message: string;
}

class PublicIndividualDataDto {
  @ApiProperty({ nullable: true })
  name: string | null;

  @ApiProperty({ nullable: true })
  avatarUrl: string | null;
}

class PublicCompanyDataDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ type: [String] })
  services: string[];

  @ApiProperty({ nullable: true })
  hqLocation: string | null;

  @ApiProperty({ type: [String] })
  serviceAreas: string[];

  @ApiProperty({ nullable: true })
  about: string | null;

  @ApiProperty({ nullable: true })
  logoUrl: string | null;

  @ApiProperty({ nullable: true })
  specialty: string | null;

  @ApiProperty()
  isVerified: boolean;
}

class PublicOfficeDataDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ type: [String] })
  services: string[];

  @ApiProperty({ nullable: true })
  hqLocation: string | null;

  @ApiProperty({ nullable: true })
  about: string | null;

  @ApiProperty({ nullable: true })
  logoUrl: string | null;

  @ApiProperty()
  isVerified: boolean;
}

class PublicProfileCountsDto {
  @ApiProperty()
  properties: number;

  @ApiProperty()
  receivedReviews: number;
}

export class PublicProfileResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ['INDIVIDUAL', 'COMPANY', 'OFFICE'] })
  type: string;

  @ApiProperty({ type: PublicIndividualDataDto, nullable: true })
  individualData: PublicIndividualDataDto | null;

  @ApiProperty({ type: PublicCompanyDataDto, nullable: true })
  companyData: PublicCompanyDataDto | null;

  @ApiProperty({ type: PublicOfficeDataDto, nullable: true })
  officeData: PublicOfficeDataDto | null;

  @ApiProperty({ type: PublicProfileCountsDto })
  _count: PublicProfileCountsDto;
}
