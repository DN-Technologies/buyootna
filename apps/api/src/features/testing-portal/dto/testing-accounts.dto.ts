import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { SlotStatus } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsEmail,
  IsEnum,
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Max,
  MaxLength,
  Min,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { DEMO_COMMANDS } from '../../../core/demo-data/pulse-demo';

const trim = ({ value }: { value: unknown }) =>
  typeof value === 'string' ? value.trim() : value;

export class TestingSearchQueryDto {
  @ApiProperty({ description: 'Email, phone or name (2+ characters)' })
  @Transform(trim)
  @IsString()
  @MaxLength(120)
  q: string;
}

export class TestingCooldownsQueryDto {
  @ApiPropertyOptional({
    description: 'Part of the key: email, phone or user id',
  })
  @IsOptional()
  @IsString()
  @MaxLength(120)
  q?: string;
}

export class TestingUnlockDto {
  @ApiProperty({ description: 'The limiter key, as listed by /cooldowns' })
  @IsString()
  @MaxLength(200)
  key: string;
}

class TestingPersonaDto {
  @ApiProperty({ enum: ['COMPANY', 'OFFICE'] })
  @IsIn(['COMPANY', 'OFFICE'])
  type: 'COMPANY' | 'OFFICE';

  @ApiProperty()
  @Transform(trim)
  @IsString()
  @Length(2, 80)
  name: string;

  @ApiProperty({ description: 'Unique across companies and offices' })
  @Transform(trim)
  @IsString()
  @Length(2, 40)
  licenseNumber: string;

  @ApiPropertyOptional({
    description: 'Approve an office at once (a company always is)',
  })
  @IsOptional()
  @IsBoolean()
  approveOffice?: boolean;
}

export class TestingCreateAccountDto {
  @ApiProperty()
  @Transform(trim)
  @IsString()
  @Length(2, 60)
  name: string;

  @ApiPropertyOptional()
  @IsOptional()
  @Transform(trim)
  @IsEmail({}, { message: 'البريد الإلكتروني غير صالح' })
  email?: string;

  @ApiPropertyOptional({ example: '55556666' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @Length(8, 16)
  phone?: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'كلمة المرور 6 أحرف على الأقل' })
  @MaxLength(128)
  password: string;

  @ApiPropertyOptional({ type: TestingPersonaDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => TestingPersonaDto)
  persona?: TestingPersonaDto;
}

export class TestingGrantPlanDto {
  @ApiProperty()
  @IsString()
  @MaxLength(64)
  planId: string;

  @ApiPropertyOptional({ description: "Ads in the slot (default: the plan's)" })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1000)
  adsRemaining?: number;
}

export class TestingEditSlotDto {
  @ApiPropertyOptional()
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(1000)
  adsRemaining?: number;

  @ApiPropertyOptional({ enum: SlotStatus })
  @IsOptional()
  @IsEnum(SlotStatus)
  status?: SlotStatus;
}

export class TestingFreeAdsDto {
  @ApiProperty()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(100)
  freeAdsRemaining: number;
}

export class TestingDemoDto {
  @ApiProperty({ enum: DEMO_COMMANDS })
  @IsIn(DEMO_COMMANDS)
  command: string;

  @ApiPropertyOptional({ description: 'expiring: whole days left (0-2)' })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(2)
  days?: number;
}
