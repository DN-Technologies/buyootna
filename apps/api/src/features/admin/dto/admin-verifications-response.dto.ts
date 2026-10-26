import { ApiProperty } from '@nestjs/swagger';

export class AdminVerificationRowDto {
  @ApiProperty()
  identityId: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: ['شركة', 'مكتب عقاري'] })
  accountType: string;

  @ApiProperty({ enum: ['قيد الانتظار', 'موثق', 'غير موثق'] })
  status: string;

  @ApiProperty({ enum: ['نشط', 'موقوف'] })
  accountStatus: string;

  @ApiProperty()
  attachmentsText: string;

  @ApiProperty()
  sentAt: string;

  @ApiProperty({ enum: ['مراجعة', 'عرض'] })
  actionLabel: string;

  @ApiProperty({ nullable: true })
  licenseNumber: string | null;

  @ApiProperty({ nullable: true })
  licenseActivity: string | null;

  @ApiProperty({ nullable: true })
  licenseExpiry: string | null;

  @ApiProperty({
    nullable: true,
    description: 'The uploaded licence (image or PDF) to review',
  })
  licenseFileUrl: string | null;

  @ApiProperty({ nullable: true })
  logoUrl: string | null;

  @ApiProperty()
  createdAt: string;
}

class AdminVerificationsMetaDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

class AdminVerificationsCountsDto {
  @ApiProperty()
  all: number;

  @ApiProperty()
  companies: number;

  @ApiProperty()
  offices: number;
}

class AdminVerificationsStatsDto {
  @ApiProperty()
  pendingCount: number;

  @ApiProperty()
  approvedTodayCount: number;

  @ApiProperty()
  rejectedTodayCount: number;
}

export class AdminVerificationsListResponseDto {
  @ApiProperty({ type: [AdminVerificationRowDto] })
  data: AdminVerificationRowDto[];

  @ApiProperty({ type: AdminVerificationsMetaDto })
  meta: AdminVerificationsMetaDto;

  @ApiProperty({ type: AdminVerificationsCountsDto })
  counts: AdminVerificationsCountsDto;

  @ApiProperty({ type: AdminVerificationsStatsDto })
  stats: AdminVerificationsStatsDto;
}
