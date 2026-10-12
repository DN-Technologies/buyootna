import { IsOptional, IsString, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class GetOfficesFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  // Governorate or area names ("حولي,السالمية"), matched against the
  // office's location; several match any
  @IsOptional()
  @IsString()
  location?: string;

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
