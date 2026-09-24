import { ApiProperty } from '@nestjs/swagger';

export class PlanPackageDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ description: 'Number of ads this package adds to the wallet' })
  adsCount: number;

  @ApiProperty({ description: 'Price in KWD' })
  price: number;
}

export class PlanDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  slug: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  price: number;

  @ApiProperty({ nullable: true })
  originalPrice: number | null;

  @ApiProperty({ nullable: true })
  discountText: string | null;

  @ApiProperty({ nullable: true })
  badge: string | null;

  @ApiProperty({ type: [String] })
  features: string[];

  @ApiProperty()
  color: string;

  @ApiProperty()
  sortOrder: number;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  maxActiveAds: number;

  @ApiProperty()
  durationDays: number;

  @ApiProperty()
  maxImagesPerAd: number;

  @ApiProperty()
  featuredDays: number;

  @ApiProperty()
  prioritySearch: boolean;

  @ApiProperty({ type: [PlanPackageDto] })
  packages: PlanPackageDto[];
}

class WalletBalanceCountsDto {
  @ApiProperty()
  gold: number;

  @ApiProperty()
  silver: number;

  @ApiProperty()
  regular: number;
}

class WalletSlotDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  planId: string;

  @ApiProperty()
  planName: string;

  @ApiProperty()
  planSlug: string;

  @ApiProperty()
  color: string;

  @ApiProperty({ nullable: true })
  badge: string | null;

  @ApiProperty()
  adsRemaining: number;

  @ApiProperty()
  maxActiveAds: number;

  @ApiProperty({
    description:
      'Ads this slot started with (purchased package size, else the plan default)',
  })
  totalAds: number;

  @ApiProperty()
  createdAt: Date;
}

export class PackageHistoryItemDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  displayId: string;

  @ApiProperty()
  planName: string;

  @ApiProperty()
  planSlug: string;

  @ApiProperty({ enum: ['ACTIVE', 'EXPIRED'] })
  status: string;

  @ApiProperty()
  dateText: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  adsRemaining: number;
}

export class UserWalletResponseDto {
  @ApiProperty()
  freeAdsRemaining: number;

  @ApiProperty({ type: WalletBalanceCountsDto })
  balanceCounts: WalletBalanceCountsDto;

  @ApiProperty({ type: [WalletSlotDto] })
  slots: WalletSlotDto[];

  @ApiProperty({ type: [PackageHistoryItemDto] })
  history: PackageHistoryItemDto[];
}

class PublishOptionDto {
  @ApiProperty()
  type: string;

  @ApiProperty()
  slotId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  subtitle: string;

  @ApiProperty()
  planName: string;

  @ApiProperty()
  color: string;

  @ApiProperty()
  adsRemaining: number;

  @ApiProperty()
  durationDays: number;

  @ApiProperty()
  maxImagesPerAd: number;

  @ApiProperty()
  featuredDays: number;

  @ApiProperty()
  prioritySearch: boolean;
}

export class PublishOptionsResponseDto {
  @ApiProperty()
  canPublish: boolean;

  @ApiProperty({ type: [PublishOptionDto] })
  options: PublishOptionDto[];
}
