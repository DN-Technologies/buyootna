import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class AdminCreateIndividualDto {
  @ApiProperty({
    description: 'Full name of the individual',
    example: 'أحمد محمد العازمي',
  })
  @IsNotEmpty({ message: 'الاسم مطلوب' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Email address',
    example: 'ahmad@example.com',
  })
  @IsOptional()
  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  email?: string;

  @ApiPropertyOptional({
    description: 'Phone number',
    example: '+96599998888',
  })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({
    description: 'Account password. If omitted, a secure default is generated.',
    example: 'Secret123!',
    minLength: 6,
  })
  @IsOptional()
  @IsString()
  @MinLength(6, { message: 'يجب أن لا تقل كلمة المرور عن 6 أحرف' })
  password?: string;

  @ApiPropertyOptional({
    description: 'Optional subscription plan ID',
    example: 'plan-uuid-or-slug',
  })
  @IsOptional()
  @IsString()
  planId?: string;
}
