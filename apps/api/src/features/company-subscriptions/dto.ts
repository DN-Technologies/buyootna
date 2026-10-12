import { ApiProperty } from '@nestjs/swagger';

export class CompanyPlanDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ example: 'annual' })
  slug: string;

  @ApiProperty({ example: 'السنوية' })
  name: string;

  @ApiProperty({ example: 12 })
  durationMonths: number;

  @ApiProperty({ example: 100, description: 'KWD' })
  price: number;

  @ApiProperty({ type: [String] })
  features: string[];

  @ApiProperty({ nullable: true, example: 'الأكثر طلبا' })
  badge: string | null;
}

export class CompanySubscriptionStateDto {
  @ApiProperty({ enum: ['TRIAL', 'ACTIVE', 'EXPIRED', 'NONE'] })
  status: string;

  @ApiProperty({
    nullable: true,
    description: 'Plan of the latest paid period; null on a trial',
  })
  currentPlanId: string | null;

  @ApiProperty({ nullable: true })
  endsAt: Date | null;

  @ApiProperty()
  daysLeft: number;
}
