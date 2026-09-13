import { IsOptional, IsString, IsInt, Min, IsEnum } from 'class-validator';
import { Type } from 'class-transformer';
import { Role } from '@prisma/client';

export class AdminUsersFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;

  @IsOptional()
  @IsString()
  status?: 'active' | 'blocked' | 'suspended';

  @IsOptional()
  @IsString()
  plan?: string;

  @IsOptional()
  @IsString()
  subscriptionPlan?: string;

  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc';

  @IsOptional()
  @IsString()
  sortBy?: 'createdAt' | 'name';

  @IsOptional()
  @IsString()
  verification?: 'verified' | 'unverified' | 'pending';

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
