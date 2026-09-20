import { ApiProperty } from '@nestjs/swagger';

class AdminDashboardMetricsDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  totalUsersChangePct: number;

  @ApiProperty()
  trialAccounts: number;

  @ApiProperty()
  trialAccountsChangePct: number;

  @ApiProperty()
  revenueTotal: number;

  @ApiProperty()
  revenueChangePct: number;
}

class AdminDashboardUsersByTypeDto {
  @ApiProperty()
  individual: number;

  @ApiProperty()
  company: number;

  @ApiProperty()
  office: number;
}

class AdminDashboardRevenueMonthDto {
  @ApiProperty()
  month: string;

  @ApiProperty()
  year: number;

  @ApiProperty()
  amount: number;
}

class AdminDashboardRecentRegistrationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  email: string;

  @ApiProperty({ enum: ['فرد', 'شركة', 'مكتب عقاري'] })
  accountType: string;

  @ApiProperty({ nullable: true })
  planName: string | null;

  @ApiProperty()
  createdAt: Date;
}

class AdminDashboardPendingVerificationDto {
  @ApiProperty()
  identityId: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ['شركة', 'مكتب عقاري'] })
  type: string;
}

export class AdminDashboardResponseDto {
  @ApiProperty({ type: AdminDashboardMetricsDto })
  metrics: AdminDashboardMetricsDto;

  @ApiProperty({ type: AdminDashboardUsersByTypeDto })
  usersByType: AdminDashboardUsersByTypeDto;

  @ApiProperty({ type: [AdminDashboardRevenueMonthDto] })
  revenueByMonth: AdminDashboardRevenueMonthDto[];

  @ApiProperty({ type: [AdminDashboardRecentRegistrationDto] })
  recentRegistrations: AdminDashboardRecentRegistrationDto[];

  @ApiProperty({ type: [AdminDashboardPendingVerificationDto] })
  pendingVerifications: AdminDashboardPendingVerificationDto[];
}
