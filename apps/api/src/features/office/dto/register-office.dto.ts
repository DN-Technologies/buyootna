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
  KUWAIT_PHONE_MESSAGE,
  KUWAIT_PHONE_PATTERN,
  SIGNUP_CHANNELS,
  type SignupChannel,
} from '../../../core/validators/business-contact';
import { trim } from '../../../core/validators/trim.transform';
import { ABOUT_MAX_LENGTH } from '../../../common/utils/location.util';

export class RegisterOfficeDto {
  @Transform(trim)
  @IsString()
  @IsNotEmpty()
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
  hqLocation?: string;

  @IsString()
  @IsOptional()
  @MaxLength(ABOUT_MAX_LENGTH, {
    message: 'النبذة يجب ألا تتجاوز ' + ABOUT_MAX_LENGTH + ' حرف',
  })
  about?: string;

  @IsString()
  @IsOptional()
  services?: string;

  @IsString()
  @IsOptional()
  licenseActivity?: string;

  @IsString()
  @IsNotEmpty({ message: 'رقم الرخصة مطلوب' })
  licenseNumber: string;

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
