import { Transform } from 'class-transformer';
import {
  IsIn,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MaxLength,
  MinLength,
} from 'class-validator';
import {
  BUSINESS_NAME_MESSAGE,
  BUSINESS_NAME_PATTERN,
} from '../../../core/validators/business-name';
import {
  KUWAIT_PHONE_MESSAGE,
  KUWAIT_PHONE_PATTERN,
  SIGNUP_CHANNELS,
  type SignupChannel,
} from '../../../core/validators/business-contact';
import { trim } from '../../../core/validators/trim.transform';
import { ABOUT_MAX_LENGTH } from '../../../common/utils/location.util';

export class RegisterCompanyDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
  @Matches(BUSINESS_NAME_PATTERN, { message: BUSINESS_NAME_MESSAGE })
  name: string;

  // An email, a phone, or both: the code goes to «verification»'s one
  @IsOptional()
  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(KUWAIT_PHONE_PATTERN, { message: KUWAIT_PHONE_MESSAGE })
  phone?: string;

  @IsString()
  @MinLength(8)
  password: string;

  @IsString()
  @IsOptional()
  services?: string;

  @IsString()
  @IsOptional()
  hqLocation?: string;

  @IsString()
  @IsOptional()
  serviceAreas?: string;

  @IsString()
  @IsOptional()
  @MaxLength(ABOUT_MAX_LENGTH, {
    message: 'النبذة يجب ألا تتجاوز ' + ABOUT_MAX_LENGTH + ' حرف',
  })
  about?: string;

  // Older app builds still send it; newer ones send specialty instead
  @IsString()
  @IsOptional()
  licenseActivity?: string;

  // «التخصص»: the services catalogue's مجال التخصص (required by the
  // service; older builds fall back to licenseActivity)
  @IsString()
  @IsOptional()
  @MaxLength(100)
  specialty?: string;

  // The licence comes with «طلب التوثيق» now; older builds still send it
  @IsString()
  @IsOptional()
  licenseNumber?: string;

  @IsString()
  @IsOptional()
  licenseExpiry?: string;
  // «verification: email» from apps that enter the emailed code next. Older
  // ones don't send it and are told to update: the account is created only
  // after the code (QA)
  // 'email' or, for a sign-up by phone, 'phone' (the code by SMS)
  @IsOptional()
  @IsIn(SIGNUP_CHANNELS)
  verification?: SignupChannel;
}
