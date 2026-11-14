import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
} from 'class-validator';

import {
  KUWAIT_PHONE_MESSAGE,
  KUWAIT_PHONE_PATTERN,
} from '../../../core/validators/business-contact';
import { TermsAcceptanceDto } from '../../auth/dto/terms-acceptance.dto';

/**
 * The code that completes a company/office sign-up, with the email or the
 * phone it was sent to (one of them; older apps send the email).
 */
export class VerifyProviderOtpDto extends TermsAcceptanceDto {
  @IsOptional()
  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  email?: string;

  @IsOptional()
  @IsString()
  @Matches(KUWAIT_PHONE_PATTERN, { message: KUWAIT_PHONE_MESSAGE })
  phone?: string;

  @IsString()
  @IsNotEmpty()
  otp: string;
}
