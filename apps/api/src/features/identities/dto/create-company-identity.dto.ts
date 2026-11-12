import {
  IsNotEmpty,
  IsNumber,
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

export class CreateCompanyIdentityDto {
  // Agreed on the form's last step; recorded on the profile
  @RequireTermsAccepted()
  acceptTerms: boolean;

  @IsNotEmpty()
  @IsString()
  @Matches(BUSINESS_NAME_PATTERN, { message: BUSINESS_NAME_MESSAGE })
  name: string;

  // The licence comes with «طلب التوثيق» now; older builds still send it
  @IsOptional()
  @IsString()
  licenseNumber?: string;

  @IsOptional()
  @IsString()
  services?: string;

  @IsOptional()
  @IsString()
  hqLocation?: string;

  @IsOptional()
  @IsString()
  serviceAreas?: string;

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

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  specialty?: string;
}
