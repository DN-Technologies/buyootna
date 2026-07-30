import { IsEnum, IsOptional, IsInt, Min, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { ListingType } from '@prisma/client';

export class GetPropertiesFilterDto {
  @IsOptional()
  @IsEnum(ListingType, { message: 'نوع الإعلان غير صالح' })
  type?: ListingType;

  @IsOptional()
  @IsString()
  identityId?: string;

  // The @Type decorator ensures the URL query string "?page=2" is converted to a number
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number;
}
