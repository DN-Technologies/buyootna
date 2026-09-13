import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsNotEmpty, IsOptional, IsString } from 'class-validator';

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
