import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

// Shared location selection object from the frontend drawer
export class SelectionItemDto {
  @IsString()
  id: string;

  @IsString()
  label: string;
}

export class StandardFilterDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectionItemDto)
  govs?: SelectionItemDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectionItemDto)
  areas?: SelectionItemDto[];

  // Mobile's category picker is a multi-select chip group -- accept a list.
  @IsOptional() @IsArray() @IsString({ each: true }) category?: string[];
  @IsOptional() @IsNumber() @Type(() => Number) rooms?: number;
  @IsOptional() @IsNumber() @Type(() => Number) baths?: number;

  // Stored as strings in frontend text inputs, but evaluated as numbers
  @IsOptional() @IsNumber() @Type(() => Number) minPrice?: number;
  @IsOptional() @IsNumber() @Type(() => Number) maxPrice?: number;
  @IsOptional() @IsNumber() @Type(() => Number) minArea?: number;
  @IsOptional() @IsNumber() @Type(() => Number) maxArea?: number;

  @IsOptional() @IsArray() @IsString({ each: true }) features?: string[];
}

export class ExchangeFilterDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectionItemDto)
  govs?: SelectionItemDto[];
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectionItemDto)
  areas?: SelectionItemDto[];

  @IsOptional() @IsNumber() @Type(() => Number) requestYear?: number;
  @IsOptional() @IsNumber() @Type(() => Number) requiredYear?: number;

  @IsOptional() @IsString() status?: string; // 'BUILDING' or 'LAND'
  @IsOptional() @IsNumber() @Type(() => Number) areaSize?: number;

  @IsOptional() @IsArray() @IsString({ each: true }) features?: string[];
}

export class CompanyFilterDto {
  @IsOptional() @IsString() specialty?: string;
  @IsOptional() @IsString() requestType?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectionItemDto)
  govs?: SelectionItemDto[];
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectionItemDto)
  areas?: SelectionItemDto[];
}

export class AuctionFilterDto {
  @IsOptional() @IsString() status?: string;
  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;

  @IsOptional() @IsArray() @IsString({ each: true }) propertyTypes?: string[];
}

export class DealFilterDto {
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectionItemDto)
  govs?: SelectionItemDto[];
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SelectionItemDto)
  areas?: SelectionItemDto[];

  @IsOptional() @IsNumber() @Type(() => Number) salePercentage?: number;

  @IsOptional() @IsDateString() startDate?: string;
  @IsOptional() @IsDateString() endDate?: string;

  @IsOptional() @IsNumber() @Type(() => Number) minPrice?: number;
  @IsOptional() @IsNumber() @Type(() => Number) maxPrice?: number;
  @IsOptional() @IsNumber() @Type(() => Number) minArea?: number;
  @IsOptional() @IsNumber() @Type(() => Number) maxArea?: number;

  @IsOptional() @IsArray() @IsString({ each: true }) propertyTypes?: string[];
}
