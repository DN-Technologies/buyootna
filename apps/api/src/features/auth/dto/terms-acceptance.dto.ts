import { applyDecorators } from '@nestjs/common';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
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

/**
 * «شروط الاستخدام و سياسة الخصوصية» where they must be agreed to, with no
 * older-build allowance: adding a company or office to an account (it was
 * created with the box unticked, QA). Multipart sends it as the string
 * "true"; anything else, or nothing, is refused.
 */
export function RequireTermsAccepted() {
  return applyDecorators(
    ApiProperty({
      description:
        'Must be true: the user ticked «شروط الاستخدام و سياسة الخصوصية». Recorded on the new profile with the terms version',
      example: true,
    }),
    Transform(({ value }) => value === true || value === 'true'),
    Equals(true, {
      message: 'يجب الموافقة على شروط الاستخدام وسياسة الخصوصية للمتابعة',
    }),
  );
}
