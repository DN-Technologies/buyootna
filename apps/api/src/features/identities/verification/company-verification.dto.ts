import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength } from 'class-validator';

/**
 * «تقديم طلب توثيق» (multipart, with the `license` file). On a resubmit only
 * the fields the admin sent back are read.
 */
export class SubmitVerificationDto {
  @ApiPropertyOptional({ description: 'رقم الرخصة (required on submit)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  licenseNumber?: string;

  @ApiPropertyOptional({ description: 'النشاط' })
  @IsOptional()
  @IsString()
  @MaxLength(100)
  licenseActivity?: string;

  @ApiPropertyOptional({ description: 'تاريخ انتهاء الرخصة (display text)' })
  @IsOptional()
  @IsString()
  @MaxLength(50)
  licenseExpiry?: string;
}

/** The admin's reason per field it sends back (any subset). */
export class VerificationIssuesDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  licenseFile?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  licenseNumber?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  licenseActivity?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(300)
  licenseExpiry?: string;

  @ApiPropertyOptional({ description: 'A general note' })
  @IsOptional()
  @IsString()
  @MaxLength(500)
  note?: string;
}

export class VerificationRequestResponseDto {
  @ApiProperty() id!: string;
  @ApiProperty({ enum: ['PENDING', 'CHANGES_REQUESTED', 'APPROVED'] })
  status!: string;
  @ApiProperty({ nullable: true }) licenseActivity!: string | null;
  @ApiProperty() licenseNumber!: string;
  @ApiProperty({ nullable: true }) licenseExpiry!: string | null;
  @ApiProperty() licenseFileUrl!: string;
  @ApiProperty({ nullable: true }) licenseFileName!: string | null;
  @ApiProperty({ nullable: true }) licenseFileSize!: number | null;
  @ApiProperty({ nullable: true }) licenseFileType!: string | null;
  @ApiProperty({
    nullable: true,
    type: VerificationIssuesDto,
    description: 'What the admin asked to fix, a reason per field',
  })
  issues!: VerificationIssuesDto | null;
  @ApiProperty() submittedAt!: Date;
  @ApiProperty({ nullable: true }) reviewedAt!: Date | null;
  @ApiProperty() createdAt!: Date;
}

export class MyVerificationResponseDto {
  @ApiProperty() isVerified!: boolean;
  @ApiProperty({ nullable: true, type: VerificationRequestResponseDto })
  request!: VerificationRequestResponseDto | null;
}
