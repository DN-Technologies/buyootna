import { IsIn, IsOptional, IsString } from 'class-validator';

export class AdminReportUpdateDto {
  @IsOptional()
  @IsIn(['RESOLVED', 'DISMISSED'])
  status?: 'RESOLVED' | 'DISMISSED';

  @IsOptional()
  @IsIn(['LOW', 'MEDIUM', 'URGENT'])
  priority?: 'LOW' | 'MEDIUM' | 'URGENT';

  // A string admin user id to assign, or '' to unassign. Optional/undefined
  // means "leave assignment unchanged".
  @IsOptional()
  @IsString()
  assignedAdminId?: string;
}
