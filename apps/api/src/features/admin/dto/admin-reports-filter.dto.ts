import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';

export class AdminReportsFilterDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsIn(['ALL', 'PENDING', 'RESOLVED', 'DISMISSED'])
  status?: 'ALL' | 'PENDING' | 'RESOLVED' | 'DISMISSED';

  @IsOptional()
  @IsIn(['ALL', 'LOW', 'MEDIUM', 'URGENT'])
  priority?: 'ALL' | 'LOW' | 'MEDIUM' | 'URGENT';

  @IsOptional()
  @IsIn(['ALL', 'USER', 'PROPERTY'])
  targetType?: 'ALL' | 'USER' | 'PROPERTY';

  @IsOptional()
  @IsIn(['ALL', 'INDIVIDUAL', 'COMPANY', 'OFFICE'])
  targetRole?: 'ALL' | 'INDIVIDUAL' | 'COMPANY' | 'OFFICE';

  @IsOptional()
  @IsIn(['ALL', 'TODAY', 'WEEK', 'MONTH'])
  dateFilter?: 'ALL' | 'TODAY' | 'WEEK' | 'MONTH';

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

  // Reports against one of the user's identities only (users/:id/reports)
  @IsOptional()
  @IsUUID()
  identityId?: string;
}
