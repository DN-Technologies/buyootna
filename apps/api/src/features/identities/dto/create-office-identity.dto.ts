import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
} from 'class-validator';
import {
  BUSINESS_NAME_MESSAGE,
  BUSINESS_NAME_PATTERN,
} from '../../../core/validators/business-name';
import { ABOUT_MAX_LENGTH } from '../../../common/utils/location.util';
import { RequireTermsAccepted } from '../../auth/dto/terms-acceptance.dto';

export class CreateOfficeIdentityDto {
  // Agreed on the form's last step; recorded on the profile
  @RequireTermsAccepted()
  acceptTerms: boolean;

  @IsNotEmpty()
  @IsString()
  @Matches(BUSINESS_NAME_PATTERN, { message: BUSINESS_NAME_MESSAGE })
  name: string;

  @IsNotEmpty()
  @IsString()
  licenseNumber: string;

  @IsOptional()
  @IsString()
  services?: string;

  @IsOptional()
  @IsString()
  hqLocation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(ABOUT_MAX_LENGTH, {
    message: 'النبذة يجب ألا تتجاوز ' + ABOUT_MAX_LENGTH + ' حرف',
  })
  about?: string;

  @IsOptional()
  @IsString()
  licenseActivity?: string;

  @IsOptional()
  @IsString()
  licenseExpiry?: string;

  @IsOptional()
  @IsString()
  logoUrl?: string;

  @IsOptional()
  @IsString()
  licenseFileUrl?: string;
}
