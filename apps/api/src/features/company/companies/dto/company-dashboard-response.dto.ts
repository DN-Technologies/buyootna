import { ApiProperty } from '@nestjs/swagger';

export class CompanyDashboardListingsDto {
  @ApiProperty({ description: "Count of this identity's ACTIVE properties" })
  activeCount: number;

  @ApiProperty({
    description:
      "Lifetime sum of views across all of this identity's properties, regardless of status",
  })
  totalViews: number;
}

export class CompanyDashboardBillingDto {
  @ApiProperty()
  hasActivePlan: boolean;

  @ApiProperty({ nullable: true })
  activePlanName: string | null;

  @ApiProperty()
  adsRemaining: number;

  @ApiProperty()
  hasOverdueInvoice: boolean;
}

export class CompanyDashboardResponseDto {
  @ApiProperty({ type: CompanyDashboardListingsDto })
  listings: CompanyDashboardListingsDto;

  @ApiProperty({ type: CompanyDashboardBillingDto })
  billing: CompanyDashboardBillingDto;
}
