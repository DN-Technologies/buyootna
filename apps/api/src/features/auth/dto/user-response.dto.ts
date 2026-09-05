import { ApiProperty } from '@nestjs/swagger';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ nullable: true })
  email: string | null;

  @ApiProperty({ nullable: true })
  phone: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  isDisabled: boolean;

  @ApiProperty()
  isBlocked: boolean;

  @ApiProperty()
  isAdmin: boolean;
}

export class IndividualIdentityDataDto {
  @ApiProperty({ nullable: true })
  name: string | null;

  @ApiProperty({ nullable: true })
  whatsapp: string | null;

  @ApiProperty({ nullable: true })
  avatarUrl: string | null;
}

export class CompanyIdentitySlimDataDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  logoUrl: string | null;
}

export class OfficeIdentitySlimDataDto {
  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  logoUrl: string | null;
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

  @ApiProperty({
    type: IndividualIdentityDataDto,
    required: false,
    nullable: true,
  })
  individualData?: IndividualIdentityDataDto | null;

  @ApiProperty({
    type: CompanyIdentitySlimDataDto,
    required: false,
    nullable: true,
  })
  companyData?: CompanyIdentitySlimDataDto | null;

  @ApiProperty({
    type: OfficeIdentitySlimDataDto,
    required: false,
    nullable: true,
  })
  officeData?: OfficeIdentitySlimDataDto | null;
}

export class LoginResponseDto {
  @ApiProperty({
    description: 'JWT bearer token to use as Authorization: Bearer <token>',
  })
  access_token: string;

  @ApiProperty({
    description:
      'The Session row id for this login — store it to later identify/revoke this specific device',
  })
  sessionId: string;

  @ApiProperty({ type: UserResponseDto })
  user: UserResponseDto;

  @ApiProperty({ type: IdentityResponseDto })
  activeIdentity: IdentityResponseDto;

  @ApiProperty({ type: [IdentityResponseDto] })
  identities: IdentityResponseDto[];
}

export class MessageResponseDto {
  @ApiProperty()
  message: string;
}
