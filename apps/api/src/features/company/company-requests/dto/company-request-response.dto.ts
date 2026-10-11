import { ApiProperty } from '@nestjs/swagger';

export class RequestClientInfoDto {
  @ApiProperty()
  name: string;

  @ApiProperty()
  joinedDate: string;

  @ApiProperty()
  previousOffers: number;

  @ApiProperty({ nullable: true })
  rating: number | null;

  @ApiProperty({ required: false, nullable: true })
  avatarUrl?: string | null;

  @ApiProperty({ required: false, nullable: true })
  phone?: string | null;

  @ApiProperty({ required: false, nullable: true })
  whatsapp?: string | null;

  @ApiProperty({ required: false })
  isVerified?: boolean;
}

export class RequestProviderInfoDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ nullable: true })
  logoUrl: string | null;

  @ApiProperty({ nullable: true })
  specialty: string | null;

  @ApiProperty()
  isVerified: boolean;
}

export class RequestOfferReplyDto {
  @ApiProperty({ nullable: true })
  message: string | null;

  @ApiProperty({ nullable: true })
  notes: string | null;
}

export class RequestOfferResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty({ type: RequestProviderInfoDto })
  provider: RequestProviderInfoDto;

  @ApiProperty({ nullable: true })
  price: number | null;

  @ApiProperty({ enum: ['sent', 'accepted', 'rejected'] })
  status: 'sent' | 'accepted' | 'rejected';

  @ApiProperty({ type: RequestOfferReplyDto })
  reply: RequestOfferReplyDto;
}

export class CompanyRequestResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  clientIdentityId: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  clientName: string;

  @ApiProperty()
  requestNumber: string;

  @ApiProperty({ required: false, nullable: true })
  category?: string | null;

  @ApiProperty({ required: false, nullable: true })
  priceRange?: string | null;

  @ApiProperty()
  location: string;

  @ApiProperty()
  attachmentsCount: number;

  @ApiProperty({ required: false, nullable: true })
  offerType?: string | null;

  @ApiProperty({ type: [String] })
  images: string[];

  @ApiProperty({
    required: false,
    nullable: true,
    description: 'block / street / avenue / building / landmark',
  })
  addressDetails?: Record<string, string> | null;

  @ApiProperty({ required: false, nullable: true })
  latitude?: number | null;

  @ApiProperty({ required: false, nullable: true })
  longitude?: number | null;

  @ApiProperty()
  description: string;

  @ApiProperty({ enum: ['pending', 'responded', 'accepted', 'rejected'] })
  status: 'pending' | 'responded' | 'accepted' | 'rejected';

  @ApiProperty({ enum: ['company', 'public'] })
  scope: 'company' | 'public';

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  @ApiProperty({ type: RequestClientInfoDto })
  client: RequestClientInfoDto;

  @ApiProperty({
    type: RequestProviderInfoDto,
    required: false,
    nullable: true,
    description:
      'Requester-facing (scope=mine): the company/office it was sent to or that accepted it',
  })
  provider?: RequestProviderInfoDto | null;

  @ApiProperty({
    required: false,
    description: 'Requester-facing (scope=mine): quotes received so far',
  })
  offersCount?: number;

  @ApiProperty({
    type: [RequestOfferResponseDto],
    required: false,
    description:
      "Companies' answers: all of them for the requester, only its own for a company",
  })
  offers?: RequestOfferResponseDto[];
}
