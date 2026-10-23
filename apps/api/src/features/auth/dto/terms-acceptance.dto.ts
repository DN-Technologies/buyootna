import { ApiPropertyOptional } from '@nestjs/swagger';
import { Equals, IsOptional } from 'class-validator';

/** The terms of use (EULA) version the app shows at sign-in and sign-up. */
export const TERMS_VERSION = '2026-10-23';

/**
 * The sign-in/sign-up screens' «أوافق على شروط الاستخدام» (Guideline 1.2).
 * Optional so older app builds, which never send it, still sign in; when
 * sent it must be true and is recorded on the account.
 */
export class TermsAcceptanceDto {
  @ApiPropertyOptional({
    description:
      'true when the user ticked «أوافق على شروط الاستخدام وسياسة الخصوصية»; recorded on the account with the terms version',
  })
  @IsOptional()
  @Equals(true, { message: 'يجب الموافقة على شروط الاستخدام' })
  acceptTerms?: boolean;
}
