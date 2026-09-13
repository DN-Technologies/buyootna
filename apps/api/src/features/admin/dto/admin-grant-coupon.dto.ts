import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  ArrayNotEmpty,
  IsArray,
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

export class AdminGrantCouponDto {
  @ApiProperty({
    description: 'Coupon code',
    example: 'LAUNCHPROMO26',
  })
  @IsNotEmpty({ message: 'كود الكوبون مطلوب' })
  @IsString({ message: 'كود الكوبون يجب أن يكون نصاً' })
  couponCode: string;

  @ApiPropertyOptional({
    description: 'Coupon display name',
    example: 'Byoutna10',
  })
  @IsOptional()
  @IsString()
  couponName?: string;

  @ApiPropertyOptional({
    description: 'Send notification to user email',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  notifyEmail?: boolean;

  @ApiPropertyOptional({
    description: 'Send notification inside mobile/web app',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  notifyApp?: boolean;
}

export class AdminGrantBulkCouponDto {
  @ApiProperty({
    description: 'Array of user IDs to receive the coupon',
    example: ['user-id-1', 'user-id-2'],
    type: [String],
  })
  @IsArray({ message: 'قائمة معرفات المستخدمين يجب أن تكون مصفوفة' })
  @IsString({ each: true, message: 'كل معرف مستخدم يجب أن يكون نصاً' })
  @ArrayNotEmpty({ message: 'يجب تحديد مستخدم واحد على الأقل' })
  userIds: string[];

  @ApiProperty({
    description: 'Coupon code',
    example: 'LAUNCHPROMO26',
  })
  @IsNotEmpty({ message: 'كود الكوبون مطلوب' })
  @IsString({ message: 'كود الكوبون يجب أن يكون نصاً' })
  couponCode: string;

  @ApiPropertyOptional({
    description: 'Coupon display name',
    example: 'Byoutna10',
  })
  @IsOptional()
  @IsString()
  couponName?: string;

  @ApiPropertyOptional({
    description: 'Send notification to user email',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  notifyEmail?: boolean;

  @ApiPropertyOptional({
    description: 'Send notification inside mobile/web app',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  notifyApp?: boolean;
}
