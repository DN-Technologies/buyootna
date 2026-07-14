import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export const MAP_PIN_TYPES = ['sell', 'rent', 'exchange', 'company'] as const;
export type MapPinType = (typeof MAP_PIN_TYPES)[number];

export class GetMapBoundsDto {
  @Type(() => Number)
  @IsNumber()
  ne_lat!: number;

  @Type(() => Number)
  @IsNumber()
  ne_lng!: number;

  @Type(() => Number)
  @IsNumber()
  sw_lat!: number;

  @Type(() => Number)
  @IsNumber()
  sw_lng!: number;

  @IsOptional()
  @IsIn(MAP_PIN_TYPES)
  type?: MapPinType;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  governorateId?: string;

  @IsOptional()
  @IsString()
  @IsNotEmpty()
  areaId?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  searchQuery?: string;
}
