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

  @ApiProperty({ type: RequestClientInfoDto })
  client: RequestClientInfoDto;
}
