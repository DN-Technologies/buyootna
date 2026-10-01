import { ApiProperty } from '@nestjs/swagger';
import { IsIn, IsString, Length, Matches } from 'class-validator';

// BOTH = no restriction (email or phone), the default for every account
export const LOGIN_METHOD_CHOICES = ['BOTH', 'EMAIL', 'PHONE'] as const;
export type LoginMethodChoice = (typeof LOGIN_METHOD_CHOICES)[number];

export class SetLoginMethodDto {
  @ApiProperty({ enum: LOGIN_METHOD_CHOICES })
  @IsIn(LOGIN_METHOD_CHOICES, { message: 'طريقة تسجيل الدخول غير صالحة' })
  method: LoginMethodChoice;
}

export class RequestPhoneOtpDto {
  @ApiProperty({ example: '99998888' })
  @IsString({ message: 'رقم الهاتف مطلوب' })
  phone: string;
}

export class VerifyPhoneDto extends RequestPhoneOtpDto {
  @ApiProperty({ example: '123456' })
  @IsString({ message: 'رمز التحقق مطلوب' })
  @Length(6, 6, { message: 'رمز التحقق يجب أن يكون 6 أرقام' })
  @Matches(/^\d{6}$/, { message: 'رمز التحقق يجب أن يكون 6 أرقام' })
  otp: string;
}
