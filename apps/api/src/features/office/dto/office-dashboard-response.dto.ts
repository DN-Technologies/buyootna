import { ApiProperty } from '@nestjs/swagger';
import { ListingType, PropertyCategory } from '@prisma/client';

export class OfficeDashboardStatsDto {
  @ApiProperty({ description: "Count of this office's ACTIVE properties" })
  activeListings: number;

  @ApiProperty({
    description: 'ACTIVE properties published in the last 7 days',
  })
  activeListingsThisWeek: number;

  @ApiProperty({ description: "Number of services in the office's profile" })
  activeServices: number;

  @ApiProperty({
    description:
      'Messages other personas sent this office since midnight, Kuwait time',
  })
  newMessagesToday: number;

  @ApiProperty({
    description:
      "Lifetime sum of views across all of this office's properties, regardless of status",
  })
  totalViews: number;
}

export class OfficeDashboardBillingDto {
  @ApiProperty({ description: 'Has an ACTIVE ad package with credits left' })
  hasActivePackage: boolean;

  @ApiProperty({ description: 'Credits left across ACTIVE ad packages' })
  adsRemaining: number;

  @ApiProperty({ description: 'The welcome free ad, if not used yet' })
  freeAdsRemaining: number;
}

export class OfficeDashboardListingDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ enum: ListingType })
  type: ListingType;

  @ApiProperty({ enum: PropertyCategory })
  category: PropertyCategory;

  @ApiProperty({ nullable: true, description: 'null = السعر غير معلن' })
  price: number | null;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty({ description: 'Featured and not past featuredUntil' })
  isFeatured: boolean;

  @ApiProperty({ nullable: true, type: Date })
  featuredUntil: Date | null;

  @ApiProperty()
  views: number;

  @ApiProperty({ description: 'People who saved the ad' })
  favoritesCount: number;

  @ApiProperty({ description: 'Conversations opened about the ad' })
  chatsCount: number;
}

export class OfficeDashboardServiceDto {
  @ApiProperty()
  title: string;

  @ApiProperty({
    description:
      'Open (PENDING/RESPONDED) requests sent to this office whose category or title mentions the service',
  })
  openRequests: number;
}

export class OfficeDashboardResponseDto {
  @ApiProperty({ type: OfficeDashboardStatsDto })
  stats: OfficeDashboardStatsDto;

  @ApiProperty({ type: OfficeDashboardBillingDto })
  billing: OfficeDashboardBillingDto;

  @ApiProperty({ type: [OfficeDashboardListingDto] })
  listings: OfficeDashboardListingDto[];

  @ApiProperty({ type: [OfficeDashboardServiceDto] })
  services: OfficeDashboardServiceDto[];
}
