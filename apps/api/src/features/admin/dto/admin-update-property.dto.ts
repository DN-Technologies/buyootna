import { IsBoolean, IsDateString, IsIn, IsOptional } from 'class-validator';

export class AdminUpdatePropertyDto {
  @IsOptional()
  @IsBoolean()
  isHidden?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsDateString()
  featuredUntil?: string;

  @IsOptional()
  @IsIn(['DRAFT', 'ACTIVE', 'REJECTED', 'EXPIRED', 'CLOSED'])
  status?: 'DRAFT' | 'ACTIVE' | 'REJECTED' | 'EXPIRED' | 'CLOSED';
}
