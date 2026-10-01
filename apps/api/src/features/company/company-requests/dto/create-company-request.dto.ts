import {
  ArrayMaxSize,
  IsArray,
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { AddressDetailsDto } from '../../../../core/dto/address-details.dto';

/**
 * Creates a price-quote request. Authenticated as the requesting identity;
 * omit `targetIdentityId` to publish a public/marketplace request, or set it
 * to a COMPANY/OFFICE identity id to send the request directly to them.
 */
export class CreateCompanyRequestDto {
  // The request's subject line. Clients derive it from the selected
  // category/service (the submission forms have no separate title field).
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  @MaxLength(120)
  title: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(60)
  priceRange?: string;

  @ApiProperty({ required: false })
  @IsString()
  @IsOptional()
  @MaxLength(40)
  offerType?: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  location: string;

  @ApiProperty({ required: false, type: AddressDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDetailsDto)
  addressDetails?: AddressDetailsDto;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @ApiProperty({ required: false })
  @IsNumber()
  @IsOptional()
  longitude?: number;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MinLength(5)
  @MaxLength(2000)
  description: string;

  @ApiProperty({ required: false, type: [String] })
  @IsArray()
  @ArrayMaxSize(10)
  @IsString({ each: true })
  @IsOptional()
  images?: string[];

  @ApiProperty({
    required: false,
    description:
      'Omit for a public/marketplace request; set to a COMPANY/OFFICE identity id to send directly',
  })
  @IsString()
  @IsOptional()
  targetIdentityId?: string;
}
