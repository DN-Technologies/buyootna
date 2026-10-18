import { ApiPropertyOptional } from '@nestjs/swagger';
import { IdentityType } from '@prisma/client';
import {
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class LoginDto {
  @IsString()
  @IsNotEmpty({ message: 'هذا الحقل مطلوب' })
  identifier: string; // Can be email OR phone

  @IsString()
  @MinLength(6, { message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' })
  password: string;

  @ApiPropertyOptional({
    enum: IdentityType,
    description:
      "The persona to open (the login screen's فرد / مكتب / شركة). Omitted: the one this device or account used last. Asking for a type the account doesn't have returns 403 IDENTITY_TYPE_NOT_FOUND with availableTypes.",
  })
  @IsOptional()
  @IsEnum(IdentityType, { message: 'نوع الحساب غير صالح' })
  identityType?: IdentityType;
}
