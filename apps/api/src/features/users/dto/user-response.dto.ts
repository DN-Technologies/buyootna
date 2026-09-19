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

export class RegisterIndividualResponseDto {
  @ApiProperty({
    type: UserSafeDto,
    required: false,
    description: 'Absent when identifier was an email — see otpRequired',
  })
  user?: UserSafeDto;

  @ApiProperty({ type: IndividualProfileDto, required: false })
  profile?: IndividualProfileDto;

  @ApiProperty({
    required: false,
    description:
      'True when identifier was an email: an OTP was sent and the account has not been created yet. Complete signup via POST /auth/register/verify-email-otp.',
  })
  otpRequired?: boolean;

  @ApiProperty({ required: false })
  identifier?: string;

  @ApiProperty({ required: false })
  message?: string;
}

// RegisterCompanyResponseDto / RegisterOfficeResponseDto now live in
// features/company/dto/company-response.dto.ts and
// features/office/dto/office-response.dto.ts.

export class UpdateProfileResponseDto {
  @ApiProperty({ type: UserSafeDto })
  user: UserSafeDto;

  @ApiProperty({
    description:
      'The updated profile data for the identity type being edited (individual/company/office fields vary)',
  })
  profile: Record<string, unknown>;
}

// CompanyListItemDto / CompanyListResponseDto / CompanyDetailsResponseDto now
// live in features/company/dto/company-response.dto.ts; the Office
// equivalents live in features/office/dto/office-response.dto.ts.

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
