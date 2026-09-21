import { IsIn, IsOptional } from 'class-validator';

export class AdminReportUpdateDto {
  @IsOptional()
  @IsIn(['RESOLVED', 'DISMISSED'])
  status?: 'RESOLVED' | 'DISMISSED';

  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'URGENT'])
  priority?: 'LOW' | 'MEDIUM' | 'URGENT';
}
