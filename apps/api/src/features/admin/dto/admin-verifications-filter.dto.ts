import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';
import { Type } from 'class-transformer';

export class AdminVerificationsFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['شركة', 'مكتب عقاري'])
  accountType?: 'شركة' | 'مكتب عقاري';

  @IsOptional()
  @IsIn(['ALL', 'VERIFIED', 'PENDING', 'UNVERIFIED'])
  status?: 'ALL' | 'VERIFIED' | 'PENDING' | 'UNVERIFIED';

  @IsOptional()
  @IsIn(['NEWEST', 'OLDEST'])
  sortOrder?: 'NEWEST' | 'OLDEST';

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 10;
}
