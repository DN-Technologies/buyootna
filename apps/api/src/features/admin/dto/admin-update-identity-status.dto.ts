import { IsIn } from 'class-validator';

export class AdminUpdateIdentityStatusDto {
  @IsIn(['APPROVED', 'REJECTED'])
  status!: 'APPROVED' | 'REJECTED';
}
