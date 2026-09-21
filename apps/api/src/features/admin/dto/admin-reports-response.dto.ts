import { ApiProperty } from '@nestjs/swagger';

export class ReportUserSummaryDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  email: string | null;

  @ApiProperty({ nullable: true })
  phone: string | null;

  @ApiProperty({ nullable: true, enum: ['INDIVIDUAL', 'COMPANY', 'OFFICE'] })
  role: string | null;

  @ApiProperty({ nullable: true })
  avatarUrl: string | null;
}

export class AdminReportRowDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'RP-1234' })
  reportNumber: string;

  @ApiProperty({ enum: ['USER', 'PROPERTY'] })
  targetType: string;

  @ApiProperty({ enum: ['PENDING', 'RESOLVED', 'DISMISSED'] })
  status: string;

  @ApiProperty({ enum: ['LOW', 'MEDIUM', 'URGENT'] })
  priority: string;

  @ApiProperty()
  reason: string;

  @ApiProperty({ nullable: true })
  description: string | null;

  @ApiProperty({ type: ReportUserSummaryDto })
  submittedBy: ReportUserSummaryDto;

  @ApiProperty({ type: ReportUserSummaryDto, nullable: true })
  against: ReportUserSummaryDto | null;

  @ApiProperty()
  createdAt: string;

  @ApiProperty({ nullable: true })
  resolvedAt: string | null;
}

class AdminReportsMetaDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  currentPage: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

class AdminReportsStatsDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  pending: number;

  @ApiProperty()
  resolved: number;

  @ApiProperty()
  dismissed: number;
}

export class AdminReportsListResponseDto {
  @ApiProperty({ type: [AdminReportRowDto] })
  data: AdminReportRowDto[];

  @ApiProperty({ type: AdminReportsMetaDto })
  meta: AdminReportsMetaDto;

  @ApiProperty({ type: AdminReportsStatsDto })
  stats: AdminReportsStatsDto;
}
