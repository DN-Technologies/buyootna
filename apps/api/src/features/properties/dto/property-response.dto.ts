import { ApiProperty } from '@nestjs/swagger';

/** Lightweight property card used by the feed/list/home endpoints. */
export class PropertyCardDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty({ nullable: true })
  price: number | null;

  @ApiProperty()
  companyName: string;

  @ApiProperty()
  isFeatured: boolean;

  @ApiProperty()
  type: string;

  @ApiProperty()
  categoryLabel: string;

  @ApiProperty({ enum: ['SALE', 'RENT', 'EXCHANGE'] })
  listingType: string;

  @ApiProperty({ nullable: true, description: 'سنة الطلب, on exchange ads' })
  requestYear: number | null;

  @ApiProperty({
    nullable: true,
    description: 'السنة المطلوبة, on exchange ads',
  })
  requiredYear: number | null;

  @ApiProperty({ nullable: true })
  area: number | null;

  @ApiProperty({ nullable: true })
  beds: number | null;

  @ApiProperty({ nullable: true })
  baths: number | null;

  @ApiProperty()
  location: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({
    nullable: true,
    description: 'When the ad last went live (publish or republish)',
  })
  publishedAt: Date | null;

  @ApiProperty({ nullable: true })
  phoneNumber: string | null;

  @ApiProperty({ nullable: true })
  identityId?: string;

  @ApiProperty({ enum: ['INDIVIDUAL', 'COMPANY', 'OFFICE'], nullable: true })
  identityType?: string;
}

export class TopCompanyDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  rating: number;

  @ApiProperty()
  projectsCount: string;

  @ApiProperty({ nullable: true })
  serviceArea: string | null;

  @ApiProperty({ nullable: true })
  logoUrl: string | null;

  @ApiProperty()
  isVerified: boolean;
}

export class HomeFeedResponseDto {
  @ApiProperty({ type: [PropertyCardDto] })
  sale: PropertyCardDto[];

  @ApiProperty({ type: [PropertyCardDto] })
  rent: PropertyCardDto[];

  @ApiProperty({ type: [PropertyCardDto] })
  exchange: PropertyCardDto[];

  @ApiProperty({ type: [TopCompanyDto] })
  companies: TopCompanyDto[];
}

class PropertyListMetaDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  current: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;

  @ApiProperty()
  hasNextPage: boolean;
}

export class PropertyListResponseDto {
  @ApiProperty({ type: [PropertyCardDto] })
  data: PropertyCardDto[];

  @ApiProperty({ type: PropertyListMetaDto })
  meta: PropertyListMetaDto;
}

export class PropertyHostDto {
  @ApiProperty({ nullable: true })
  id?: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  avatarUrl: string;

  @ApiProperty()
  joinedDate: string;

  @ApiProperty()
  isVerified: boolean;

  @ApiProperty()
  rating: number;

  @ApiProperty({ enum: ['INDIVIDUAL', 'COMPANY', 'OFFICE'] })
  role: string;
}

/** Full property record as returned by findOne/create/update (all Property scalar fields + host). */
export class PropertyDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  referenceNumber: number;

  @ApiProperty()
  type: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  isFeatured: boolean;

  @ApiProperty({ nullable: true })
  featuredUntil: Date | null;

  @ApiProperty()
  isPriority: boolean;

  @ApiProperty({ nullable: true })
  price: number | null;

  @ApiProperty({ nullable: true })
  beds: number | null;

  @ApiProperty({ nullable: true })
  baths: number | null;

  @ApiProperty()
  location: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({
    nullable: true,
    description: 'When the ad last went live (publish or republish)',
  })
  publishedAt: Date | null;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  views: number;

  @ApiProperty({ nullable: true })
  areaId: string | null;

  @ApiProperty({ nullable: true })
  areaSize: number | null;

  @ApiProperty({ nullable: true })
  auctionStatus: string | null;

  @ApiProperty({ nullable: true })
  endDate: Date | null;

  @ApiProperty({ nullable: true })
  floors: number | null;

  @ApiProperty({ description: 'Array of feature IDs/labels' })
  features: unknown;

  @ApiProperty({ nullable: true })
  governorateId: string | null;

  @ApiProperty({ nullable: true })
  requestYear: number | null;

  @ApiProperty({ nullable: true })
  requiredYear: number | null;

  @ApiProperty({ nullable: true })
  salePercentage: number | null;

  @ApiProperty({ nullable: true })
  startDate: Date | null;

  @ApiProperty({ nullable: true })
  exchangeStatus: string | null;

  @ApiProperty({
    nullable: true,
    description: 'block / street / avenue / building / landmark',
  })
  addressDetails?: Record<string, string> | null;

  @ApiProperty({ nullable: true })
  latitude: number | null;

  @ApiProperty({ nullable: true })
  longitude: number | null;

  @ApiProperty({ nullable: true })
  propertyAge: number | null;

  @ApiProperty({ nullable: true })
  propertyIncome: number | null;

  @ApiProperty()
  status: string;

  @ApiProperty()
  isHidden: boolean;

  @ApiProperty({ nullable: true })
  additionalExpenses: string | null;

  @ApiProperty({ nullable: true })
  automatedNumber: string | null;

  @ApiProperty({ nullable: true })
  phoneNumber: string | null;

  @ApiProperty({ nullable: true })
  whatsappNumber: string | null;

  @ApiProperty({ nullable: true })
  allocationStatus: string | null;

  @ApiProperty({ nullable: true })
  rentConditions: string | null;

  @ApiProperty({ nullable: true })
  planSlotId: string | null;

  @ApiProperty({ type: PropertyHostDto })
  host: PropertyHostDto;

  @ApiProperty({ nullable: true })
  licenseNumber?: string;
}

export class MyActivityPropertyDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty({ nullable: true })
  price: number | null;

  @ApiProperty()
  type: string;

  @ApiProperty()
  category: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty({
    nullable: true,
    description: 'When the ad last went live (publish or republish)',
  })
  publishedAt: Date | null;

  @ApiProperty({ nullable: true })
  endDate: Date | null;

  @ApiProperty()
  isPremium: boolean;

  @ApiProperty()
  isHidden: boolean;

  @ApiProperty()
  location: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ nullable: true })
  automatedNumber: string | null;

  @ApiProperty({ nullable: true })
  beds: number | null;

  @ApiProperty({ nullable: true })
  baths: number | null;

  @ApiProperty({ nullable: true })
  areaSize: number | null;

  @ApiProperty({ nullable: true })
  floors: number | null;

  @ApiProperty()
  views: number;
}

export class IncrementViewsResponseDto {
  @ApiProperty()
  success: boolean;
}

export class RemovePropertyResponseDto {
  @ApiProperty()
  message: string;
}
