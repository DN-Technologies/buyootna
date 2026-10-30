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

export class ReportAssignedAdminDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;
}

export class ReportContentDto {
  @ApiProperty({ enum: ['PROPERTY', 'REVIEW', 'STORY', 'REEL'] })
  kind: 'PROPERTY' | 'REVIEW' | 'STORY' | 'REEL';

  @ApiProperty({
    nullable: true,
    description: 'Null once the listing, review, story or reel is gone',
  })
  id: string | null;

  @ApiProperty({
    type: 'object',
    additionalProperties: true,
    nullable: true,
    description: 'What a review, story or reel showed when it was reported',
  })
  snapshot: Record<string, unknown> | null;
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

  @ApiProperty({ type: ReportAssignedAdminDto, nullable: true })
  assignedAdmin: ReportAssignedAdminDto | null;

  @ApiProperty({
    type: ReportContentDto,
    nullable: true,
    description:
      'The listing, review, story or reel reported (null for a report on an account alone); what «حذف المحتوى وإيقاف الحساب» removes',
  })
  content: ReportContentDto | null;

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
