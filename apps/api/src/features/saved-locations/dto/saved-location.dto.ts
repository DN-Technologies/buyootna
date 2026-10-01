import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { SavedLocationLabel } from '@prisma/client';
import { Transform, Type } from 'class-transformer';
import {
  IsEnum,
  IsLatitude,
  IsLongitude,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  ValidateNested,
} from 'class-validator';
import { AddressDetailsDto } from '../../../core/dto/address-details.dto';
import { trim } from '../../../core/validators/trim.transform';

export class CreateSavedLocationDto {
  @ApiProperty({ enum: SavedLocationLabel })
  @IsEnum(SavedLocationLabel, { message: 'نوع الموقع غير صالح' })
  label: SavedLocationLabel;

  @ApiPropertyOptional({ description: 'Required for OTHER' })
  @IsOptional()
  @Transform(trim)
  @IsString()
  @MaxLength(40, { message: 'اسم الموقع طويل جداً' })
  name?: string;

  @ApiProperty()
  @Transform(trim)
  @IsString()
  @IsNotEmpty({ message: 'العنوان مطلوب' })
  @MaxLength(200)
  address: string;

  @ApiProperty()
  @IsLatitude({ message: 'إحداثيات غير صالحة' })
  latitude: number;

  @ApiProperty()
  @IsLongitude({ message: 'إحداثيات غير صالحة' })
  longitude: number;

  @ApiPropertyOptional({ type: AddressDetailsDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => AddressDetailsDto)
  details?: AddressDetailsDto;
}

export class UpdateSavedLocationDto extends PartialType(
  CreateSavedLocationDto,
) {}
